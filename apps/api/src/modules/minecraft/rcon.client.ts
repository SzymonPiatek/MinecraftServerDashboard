import { RCON } from "minecraft-server-util";
import { HttpError } from "../../lib/http-error.js";

export interface RconClient {
  execute(command: string): Promise<string>;
}

interface RconOptions {
  host: string;
  port: number;
  password: string;
  timeoutMs: number;
}

/** Opens a short-lived connection per command; RCON traffic here is low-volume and admin-only. */
export function createRconClient({ host, port, password, timeoutMs }: RconOptions): RconClient {
  return {
    async execute(command) {
      const rcon = new RCON();
      try {
        await rcon.connect(host, port, { timeout: timeoutMs });
        await rcon.login(password, { timeout: timeoutMs });
        return (await rcon.execute(command)).trim();
      } catch {
        throw HttpError.unavailable("Minecraft server is unreachable via RCON");
      } finally {
        rcon.close();
      }
    },
  };
}
