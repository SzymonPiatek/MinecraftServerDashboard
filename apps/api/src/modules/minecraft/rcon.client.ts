import { RCON } from "minecraft-server-util";
import { HttpError } from "../../lib/http-error.js";

export interface RconClient {
  execute(command: string): Promise<string>;
  /** Runs the commands in order over one connection, as a single unit in the queue. */
  executeMany(commands: string[]): Promise<string[]>;
}

interface RconOptions {
  host: string;
  port: number;
  password: string;
  timeoutMs: number;
}

/**
 * Opens a short-lived connection per call. Calls are queued one at a time: a vanilla server collects the output of
 * every RCON command in one shared buffer, so commands running in parallel get each other's replies mixed in.
 */
export function createRconClient({ host, port, password, timeoutMs }: RconOptions): RconClient {
  let queue: Promise<unknown> = Promise.resolve();

  const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
    const result = queue.then(task);
    queue = result.catch(() => undefined);
    return result;
  };

  const withConnection = <T>(run: (rcon: RCON) => Promise<T>): Promise<T> =>
    enqueue(async () => {
      const rcon = new RCON();
      try {
        await rcon.connect(host, port, { timeout: timeoutMs });
        await rcon.login(password, { timeout: timeoutMs });
        return await run(rcon);
      } catch {
        throw HttpError.unavailable("Minecraft server is unreachable via RCON");
      } finally {
        rcon.close();
      }
    });

  return {
    execute: (command) => withConnection(async (rcon) => (await rcon.execute(command)).trim()),

    executeMany: (commands) =>
      withConnection(async (rcon) => {
        const replies: string[] = [];
        for (const command of commands) replies.push((await rcon.execute(command)).trim());
        return replies;
      }),
  };
}
