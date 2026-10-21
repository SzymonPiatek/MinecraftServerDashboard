import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { ADMIN, createTestContainer } from "./helpers.js";

type Harness = Awaited<ReturnType<typeof createTestContainer>>;

let harness: Harness;
let agent: ReturnType<typeof request.agent>;

async function loginAsAdmin() {
  await agent.post("/api/auth/login").send(ADMIN).expect(200);
}

beforeEach(async () => {
  harness = await createTestContainer({
    "whitelist list": "There are 2 whitelisted player(s): Alex, Steve",
    "help gamerule":
      "/gamerule keep_inventory [<value>]/gamerule minecraft:keep_inventory [<value>]/gamerule brand_new_rule [<value>]",
    "gamerule keep_inventory": "Gamerule keep_inventory is currently set to: true",
    "gamerule brand_new_rule": "Gamerule brand_new_rule is currently set to: 7",
    "gamerule keep_inventory false": "Gamerule keep_inventory is now set to: false",
    "gamerule keep_inventory 5": "Incorrect argument for command",
    "banlist players": "There are 1 ban(s):\nSteve was banned by Rcon: griefing",
  });
  agent = request.agent(createApp(harness.container));
});

describe("public endpoints", () => {
  it("serves status and players without authentication", async () => {
    const status = await agent.get("/api/status").expect(200);
    expect(status.body).toMatchObject({ online: true, playersOnline: 1 });

    const players = await agent.get("/api/players").expect(200);
    expect(players.body.players).toEqual(["Steve"]);
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await agent.get("/api/nope").expect(404);
    expect(res.body).toEqual({ error: "Route not found" });
  });
});

describe("authentication", () => {
  it("rejects admin routes without a session", async () => {
    await agent.get("/api/admin/whitelist").expect(401);
    await agent.post("/api/admin/console").send({ command: "list" }).expect(401);
  });

  it("rejects wrong credentials with a generic message", async () => {
    const wrongPassword = await agent
      .post("/api/auth/login")
      .send({ ...ADMIN, password: "nope" })
      .expect(401);
    const wrongUser = await agent
      .post("/api/auth/login")
      .send({ username: "ghost", password: "nope" })
      .expect(401);
    expect(wrongPassword.body).toEqual(wrongUser.body);
  });

  it("logs in with an httpOnly cookie, exposes /me, and logs out", async () => {
    const login = await agent.post("/api/auth/login").send(ADMIN).expect(200);
    expect(login.headers["set-cookie"]?.[0]).toMatch(/HttpOnly/i);

    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body).toEqual({ id: 1, username: "admin" });

    await agent.post("/api/auth/logout").expect(204);
    await agent.get("/api/auth/me").expect(401);
  });

  it("validates the login body", async () => {
    await agent.post("/api/auth/login").send({}).expect(400);
  });
});

describe("admin bans", () => {
  it("lists banned players", async () => {
    await loginAsAdmin();
    const res = await agent.get("/api/admin/bans").expect(200);
    expect(res.body.players).toEqual([{ name: "Steve", reason: "griefing" }]);
  });
});

describe("admin logs", () => {
  it("requires a session and validates the cursor", async () => {
    await agent.get("/api/admin/logs").expect(401);
    await loginAsAdmin();
    const res = await agent.get("/api/admin/logs").expect(200);
    expect(res.body.lines).toHaveLength(1);
    await agent.get("/api/admin/logs").query({ after: "yesterday" }).expect(400);
  });
});

describe("admin gamerules", () => {
  it("lists the rules the server answers for, including ones it reports itself", async () => {
    await loginAsAdmin();
    const res = await agent.get("/api/admin/gamerules").expect(200);
    expect(res.body.rules).toEqual([
      { name: "brand_new_rule", value: 7 },
      { name: "keep_inventory", value: true },
    ]);
  });

  it("sets a rule and audits it", async () => {
    await loginAsAdmin();
    await agent.put("/api/admin/gamerules/keep_inventory").send({ value: false }).expect(200);
    expect(harness.rconCommands).toContain("gamerule keep_inventory false");
    expect(harness.auditEvents.at(-1)).toMatchObject({
      action: "gamerule.set",
      target: "keep_inventory",
      details: "false",
    });
  });

  it("rejects values the server refuses and names that could inject commands", async () => {
    await loginAsAdmin();
    await agent.put("/api/admin/gamerules/keep_inventory").send({ value: 5 }).expect(400);
    await agent.put("/api/admin/gamerules/keep_inventory").send({ value: "x" }).expect(400);
    await agent.put("/api/admin/gamerules/a%20b").send({ value: true }).expect(400);
    await agent.put("/api/admin/gamerules/Keep_Inventory").send({ value: true }).expect(400);
    expect(harness.rconCommands).not.toContain("gamerule a b true");
  });

  it("requires a session", async () => {
    await agent.get("/api/admin/gamerules").expect(401);
  });
});

describe("admin whitelist", () => {
  it("lists, adds and removes players, auditing mutations", async () => {
    await loginAsAdmin();

    const list = await agent.get("/api/admin/whitelist").expect(200);
    expect(list.body.players).toEqual(["Alex", "Steve"]);

    await agent.post("/api/admin/whitelist").send({ username: "Notch" }).expect(201);
    await agent.delete("/api/admin/whitelist/Notch").expect(204);

    expect(harness.rconCommands).toEqual(["whitelist list", "whitelist add Notch", "whitelist remove Notch"]);
    expect(harness.auditEvents.map((e) => e.action)).toEqual(["whitelist.add", "whitelist.remove"]);
  });

  it("rejects usernames that could inject RCON commands", async () => {
    await loginAsAdmin();
    await agent.post("/api/admin/whitelist").send({ username: "Steve; op Steve" }).expect(400);
    await agent.delete("/api/admin/whitelist/a%20b").expect(400);
    expect(harness.rconCommands).toEqual([]);
  });
});

describe("admin players, console and server control", () => {
  it("applies player actions with a sanitized reason", async () => {
    await loginAsAdmin();
    await agent.post("/api/admin/players/Steve/kick").send({ reason: "AFK" }).expect(200);
    await agent.post("/api/admin/players/Steve/op").send({}).expect(200);
    await agent.post("/api/admin/players/Steve/explode").send({}).expect(400);
    expect(harness.rconCommands).toEqual(["kick Steve AFK", "op Steve"]);
  });

  it("runs single-line console commands only", async () => {
    await loginAsAdmin();
    await agent.post("/api/admin/console").send({ command: "list" }).expect(200);
    await agent.post("/api/admin/console").send({ command: "list\nstop" }).expect(400);
    expect(harness.rconCommands).toEqual(["list"]);
  });

  it("controls the server process and records it", async () => {
    await loginAsAdmin();
    await agent.post("/api/admin/server/restart").expect(202);
    await agent.post("/api/admin/server/reboot").expect(400);
    expect(harness.serverActions).toEqual(["restart"]);
    expect(harness.auditEvents.map((e) => e.action)).toEqual(["server.restart"]);
  });
});

describe("contact form", () => {
  const body = { name: "Steve", email: "steve@example.com", message: "Dopisz mnie do whitelisty proszę" };

  it("forwards a valid message without authentication", async () => {
    await agent.post("/api/contact").send(body).expect(204);
    expect(harness.contactMessages).toEqual([body]);
  });

  it("validates the body", async () => {
    await agent
      .post("/api/contact")
      .send({ ...body, email: "nope" })
      .expect(400);
    await agent
      .post("/api/contact")
      .send({ ...body, message: "hi" })
      .expect(400);
    expect(harness.contactMessages).toEqual([]);
  });

  it("silently drops submissions that fill the honeypot", async () => {
    await agent
      .post("/api/contact")
      .send({ ...body, website: "http://spam.example" })
      .expect(204);
    expect(harness.contactMessages).toEqual([]);
  });

  it("rate limits repeated submissions", async () => {
    for (let i = 0; i < 5; i++) await agent.post("/api/contact").send(body).expect(204);
    await agent.post("/api/contact").send(body).expect(429);
  });
});
