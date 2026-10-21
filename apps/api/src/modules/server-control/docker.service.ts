import type { LogLine, ServerControlAction, ServiceState } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";

export interface ServerControlService {
  getState(): Promise<ServiceState>;
  control(action: ServerControlAction): Promise<void>;
  /** Console output of the server. Without `after`: the last lines; with it: only lines newer than that timestamp. */
  getLogs(after?: string): Promise<LogLine[]>;
}

interface DockerOptions {
  /** Base URL of the Docker Engine API, normally a socket proxy that only allows container start/stop/restart. */
  apiUrl: string;
  containerName: string;
  /** Seconds Docker waits after SIGTERM before killing the container; the world needs time to save. */
  stopTimeoutSeconds?: number;
  fetch?: typeof fetch;
}

interface ContainerInspect {
  State: { Status: string; ExitCode: number; OOMKilled?: boolean };
}

const REQUEST_TIMEOUT_MS = 5_000;
const INITIAL_LOG_LINES = 300;

/** Exit codes of a container stopped on purpose: clean exit, SIGTERM (143) or SIGKILL after the stop timeout (137). */
const DELIBERATE_STOP_CODES = new Set([0, 137, 143]);

export function createDockerService({
  apiUrl,
  containerName,
  stopTimeoutSeconds = 60,
  fetch: fetchImpl = fetch,
}: DockerOptions): ServerControlService {
  const base = `${apiUrl.replace(/\/$/, "")}/containers/${encodeURIComponent(containerName)}`;

  return {
    async getState() {
      try {
        const res = await fetchImpl(`${base}/json`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!res.ok) return "unknown";
        return toState((await res.json()) as ContainerInspect);
      } catch {
        return "unknown";
      }
    },

    async getLogs(after) {
      const query = new URLSearchParams({ stdout: "1", stderr: "1", timestamps: "1" });
      // Docker's `since` has whole-second resolution, so ask from the second of the cursor and drop what was already sent.
      if (after) query.set("since", String(Math.floor(Date.parse(`${after.slice(0, 19)}Z`) / 1000)));
      else query.set("tail", String(INITIAL_LOG_LINES));

      let body: Buffer;
      try {
        const res = await fetchImpl(`${base}/logs?${query}`, {
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Docker answered ${res.status}`);
        body = Buffer.from(await res.arrayBuffer());
      } catch {
        throw HttpError.unavailable("Could not read the server logs");
      }

      const lines = parseLogStream(body);
      return after ? lines.filter((line) => timeKey(line.time) > timeKey(after)) : lines;
    },

    async control(action) {
      // Docker blocks `stop` and `restart` until the container is down, so allow for the stop timeout.
      const timeoutMs = REQUEST_TIMEOUT_MS + stopTimeoutSeconds * 1000;
      const query = action === "start" ? "" : `?t=${stopTimeoutSeconds}`;

      let status: number;
      try {
        const res = await fetchImpl(`${base}/${action}${query}`, {
          method: "POST",
          signal: AbortSignal.timeout(timeoutMs),
        });
        status = res.status;
      } catch {
        throw HttpError.unavailable(`Could not ${action} the server`);
      }

      // 204 = done, 304 = already in the requested state; anything else is a failure.
      if (status !== 204 && status !== 304) throw HttpError.unavailable(`Could not ${action} the server`);
    },
  };
}

/**
 * Docker multiplexes stdout/stderr of containers without a TTY into frames: 1 byte stream type, 3 zero bytes,
 * a big-endian uint32 length, then the payload. A container with a TTY sends plain text instead.
 */
export function parseLogStream(buffer: Buffer): LogLine[] {
  let text = "";
  let offset = 0;
  while (offset + 8 <= buffer.length && buffer[offset]! <= 2 && buffer.readUIntBE(offset + 1, 3) === 0) {
    const end = offset + 8 + buffer.readUInt32BE(offset + 4);
    text += buffer.toString("utf8", offset + 8, end);
    offset = end;
  }
  if (offset === 0) text = buffer.toString("utf8");

  return text
    .split("\n")
    .filter((raw) => raw.length > 0)
    .map((raw) => {
      const space = raw.indexOf(" ");
      return space === -1
        ? { time: "", text: stripAnsi(raw) }
        : { time: raw.slice(0, space), text: stripAnsi(raw.slice(space + 1)).trimEnd() };
    });
}

// eslint-disable-next-line no-control-regex -- matching the ESC character is the point
const ANSI_ESCAPE = /\x1b\[[0-9;]*m/g;
const stripAnsi = (value: string) => value.replace(ANSI_ESCAPE, "");

/** Docker trims trailing zeros of the fraction, so pad it to compare timestamps as plain strings. */
function timeKey(time: string) {
  const [seconds = "", fraction = ""] = time.replace(/Z$/, "").split(".");
  return `${seconds}.${fraction.padEnd(9, "0")}`;
}

function toState({ State }: ContainerInspect): ServiceState {
  switch (State.Status) {
    case "running":
      return "active";
    case "restarting":
      return "failed";
    case "exited":
    case "dead":
      return DELIBERATE_STOP_CODES.has(State.ExitCode) && !State.OOMKilled ? "inactive" : "failed";
    case "created":
    case "paused":
      return "inactive";
    default:
      return "unknown";
  }
}
