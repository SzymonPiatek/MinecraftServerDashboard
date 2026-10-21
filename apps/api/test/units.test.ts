import { describe, expect, it, vi } from "vitest";
import { cacheAsync } from "../src/lib/ttl-cache.js";
import { parseGamerule, parseRuleNames } from "../src/modules/admin/gamerules.service.js";
import { parseBanlist } from "../src/modules/admin/bans.service.js";
import { parseWhitelist } from "../src/modules/admin/whitelist.service.js";

describe("parseWhitelist", () => {
  it("extracts names from the server reply", () => {
    expect(parseWhitelist("There are 2 whitelisted player(s): Alex, Steve")).toEqual(["Alex", "Steve"]);
  });

  it("returns an empty list when nobody is whitelisted", () => {
    expect(parseWhitelist("There are no whitelisted players")).toEqual([]);
  });
});

describe("parseBanlist", () => {
  it("extracts names and reasons from the server reply", () => {
    expect(
      parseBanlist(
        "There are 2 ban(s):\nSteve was banned by Rcon: griefing: spawn\nAlex was banned by Server: x",
      ),
    ).toEqual([
      { name: "Steve", reason: "griefing: spawn" },
      { name: "Alex", reason: "x" },
    ]);
  });

  it("returns an empty list when nobody is banned", () => {
    expect(parseBanlist("There are no bans")).toEqual([]);
  });
});

describe("parseGamerule", () => {
  it("reads booleans and integers", () => {
    expect(parseGamerule("Gamerule keep_inventory is currently set to: true")).toBe(true);
    expect(parseGamerule("Gamerule pvp is currently set to: false")).toBe(false);
    expect(parseGamerule("Gamerule max_entity_cramming is currently set to: 24")).toBe(24);
  });

  it("returns null for rules the server does not know", () => {
    expect(parseGamerule("Incorrect argument for commandgamerule keepInventory<--[HERE]")).toBeNull();
    expect(parseGamerule("")).toBeNull();
  });
});

describe("parseRuleNames", () => {
  it("keeps the plain names and drops the minecraft: twins and the truncated tail", () => {
    const help =
      "/gamerule keep_inventory [<value>]/gamerule minecraft:keep_inventory [<value>]/gamerule spawn_phantoms [<value>]/gamerule mi";
    expect(parseRuleNames(help)).toEqual(["keep_inventory", "spawn_phantoms"]);
  });
});

describe("cacheAsync", () => {
  it("shares one in-flight call and serves cached values until the TTL passes", async () => {
    vi.useFakeTimers();
    const loader = vi.fn(async () => Math.random());
    const get = cacheAsync(loader, 1000);

    const [a, b] = await Promise.all([get(), get()]);
    expect(a).toBe(b);
    expect(await get()).toBe(a);
    expect(loader).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    await get();
    expect(loader).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
