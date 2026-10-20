import type { ServerControlAction, ServiceState } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";

export interface ServerControlService {
  getState(): Promise<ServiceState>;
  control(action: ServerControlAction): Promise<void>;
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
