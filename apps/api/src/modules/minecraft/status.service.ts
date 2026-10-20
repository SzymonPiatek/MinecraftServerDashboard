import type { OnlinePlayers, ServerStatus } from "@mcd/shared";
import { queryFull, status } from "minecraft-server-util";
import { cacheAsync } from "../../lib/ttl-cache.js";

export interface MinecraftStatusService {
  getStatus(): Promise<ServerStatus>;
  getPlayers(): Promise<OnlinePlayers>;
}

interface StatusOptions {
  host: string;
  port: number;
  queryPort: number;
  timeoutMs: number;
  cacheMs: number;
}

const OFFLINE_STATUS: ServerStatus = {
  online: false,
  playersOnline: 0,
  playersMax: 0,
  version: null,
  motd: null,
  pingMs: null,
};

/**
 * Status comes from Server List Ping, the full player list from the Query protocol.
 * Results are cached briefly so public traffic can't amplify into load on the game server.
 */
export function createMinecraftStatusService(options: StatusOptions): MinecraftStatusService {
  const { host, port, queryPort, timeoutMs, cacheMs } = options;

  const fetchStatus = async (): Promise<ServerStatus> => {
    try {
      const res = await status(host, port, { timeout: timeoutMs });
      return {
        online: true,
        playersOnline: res.players.online,
        playersMax: res.players.max,
        version: res.version.name,
        motd: res.motd.clean,
        pingMs: res.roundTripLatency,
      };
    } catch {
      return OFFLINE_STATUS;
    }
  };

  const fetchPlayers = async (): Promise<OnlinePlayers> => {
    try {
      const res = await queryFull(host, queryPort, { timeout: timeoutMs });
      return { online: res.players.online, max: res.players.max, players: res.players.list };
    } catch {
      return playersFromPing();
    }
  };

  // Fallback when Query is disabled: Server List Ping exposes only a sample of names.
  const playersFromPing = async (): Promise<OnlinePlayers> => {
    try {
      const res = await status(host, port, { timeout: timeoutMs });
      return {
        online: res.players.online,
        max: res.players.max,
        players: res.players.sample?.map((p) => p.name) ?? [],
      };
    } catch {
      return { online: 0, max: 0, players: [] };
    }
  };

  return {
    getStatus: cacheAsync(fetchStatus, cacheMs),
    getPlayers: cacheAsync(fetchPlayers, cacheMs),
  };
}
