import { HttpError } from "../../lib/http-error.js";
import type { RconClient } from "../minecraft/rcon.client.js";

export interface WhitelistService {
  list(): Promise<string[]>;
  add(username: string): Promise<void>;
  remove(username: string): Promise<void>;
}

/** Parses `whitelist list` output, e.g. "There are 2 whitelisted player(s): Alex, Steve". */
export function parseWhitelist(output: string): string[] {
  const separator = output.indexOf(":");
  if (separator === -1) return [];
  return output
    .slice(separator + 1)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function createWhitelistService(rcon: RconClient): WhitelistService {
  return {
    async list() {
      return parseWhitelist(await rcon.execute("whitelist list"));
    },

    async add(username) {
      const output = await rcon.execute(`whitelist add ${username}`);
      if (/already/i.test(output)) throw HttpError.conflict(`${username} is already whitelisted`);
      if (/does not exist/i.test(output)) throw HttpError.notFound(`Player ${username} does not exist`);
    },

    async remove(username) {
      const output = await rcon.execute(`whitelist remove ${username}`);
      if (/not whitelisted/i.test(output)) throw HttpError.notFound(`${username} is not whitelisted`);
    },
  };
}
