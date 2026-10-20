import type { PlayerAction } from "@mcd/shared";
import type { RconClient } from "../minecraft/rcon.client.js";

export interface PlayersService {
  /** Runs the action and returns the server's reply. */
  apply(action: PlayerAction, username: string, reason?: string): Promise<string>;
}

export function createPlayersService(rcon: RconClient): PlayersService {
  return {
    apply(action, username, reason) {
      const suffix = action === "kick" || action === "ban" ? reasonSuffix(reason) : "";
      return rcon.execute(`${action} ${username}${suffix}`);
    },
  };
}

const reasonSuffix = (reason?: string) => (reason ? ` ${reason.replace(/[\r\n]+/g, " ")}` : "");
