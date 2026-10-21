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
  harness = await createTestContainer({ "whitelist list": "There are 2 whitelisted player(s): Alex, Steve" });
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
