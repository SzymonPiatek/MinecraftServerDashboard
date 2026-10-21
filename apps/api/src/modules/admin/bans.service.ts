import type { BannedPlayer } from "@mcd/shared";
import type { RconClient } from "../minecraft/rcon.client.js";

export interface BansService {
  list(): Promise<BannedPlayer[]>;
}

/**
 * Parses `banlist players` output: a header line, then one "<name> was banned by <source>: <reason>" per line,
 * e.g. "There are 1 ban(s):\nSteve was banned by Rcon: griefing". Anything else (like the "no bans" reply) is skipped.
 */
export function parseBanlist(output: string): BannedPlayer[] {
  return output
    .split(/\r?\n/)
    .map((line) => /^(\S+) was banned by .+?: (.*)$/.exec(line.trim()))
    .filter((match) => match !== null)
    .map(([, name, reason]) => ({ name, reason }));
}

export function createBansService(rcon: RconClient): BansService {
  return {
    async list() {
      return parseBanlist(await rcon.execute("banlist players"));
    },
  };
}
