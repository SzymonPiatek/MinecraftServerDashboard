import { GAMERULE_NAMES, type Gamerule } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";
import type { RconClient } from "../minecraft/rcon.client.js";

export interface GamerulesService {
  list(): Promise<Gamerule[]>;
  set(name: string, value: boolean | number): Promise<void>;
}

/** Parses "Gamerule keep_inventory is currently set to: true"; anything else (unknown rule) gives null. */
export function parseGamerule(output: string): boolean | number | null {
  const value = /currently set to: (.+)$/.exec(output.trim())?.[1]?.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  return value !== undefined && /^-?\d+$/.test(value) ? Number(value) : null;
}

/** Rule names from `help gamerule`, which prints "/gamerule <name> [<value>]" plus a "minecraft:"-prefixed twin of each. */
export function parseRuleNames(help: string): string[] {
  return [...help.matchAll(/\/gamerule ([a-z_]+) \[<value>\]/g)].map((match) => match[1]!);
}

export function createGamerulesService(rcon: RconClient): GamerulesService {
  return {
    async list() {
      const names = [
        ...new Set([...GAMERULE_NAMES, ...parseRuleNames(await rcon.execute("help gamerule"))]),
      ].sort();

      const replies = await rcon.executeMany(names.map((name) => `gamerule ${name}`));

      return names.flatMap((name, i) => {
        const value = parseGamerule(replies[i] ?? "");
        return value === null ? [] : [{ name, value }];
      });
    },

    async set(name, value) {
      const output = await rcon.execute(`gamerule ${name} ${value}`);
      if (!/now set to/i.test(output)) throw HttpError.badRequest(output || `Could not set ${name}`);
    },
  };
}
