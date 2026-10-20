import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ServerControlAction, ServiceState } from "@mcd/shared";
import { HttpError } from "../../lib/http-error.js";

const execFileAsync = promisify(execFile);

export interface ServerControlService {
  getState(): Promise<ServiceState>;
  control(action: ServerControlAction): Promise<void>;
}

/**
 * Controls the Minecraft systemd unit. Commands run without a shell; `sudo -n` requires a
 * sudoers rule limited to `systemctl start|stop|restart <unit>` for the API user.
 */
export function createSystemdService(unit: string): ServerControlService {
  return {
    async getState() {
      try {
        const { stdout } = await execFileAsync("systemctl", ["is-active", unit]);
        return toState(stdout);
      } catch (err) {
        // `is-active` exits non-zero for inactive/failed units but still prints the state.
        const stdout = (err as { stdout?: string }).stdout;
        return stdout ? toState(stdout) : "unknown";
      }
    },

    async control(action) {
      try {
        await execFileAsync("sudo", ["-n", "systemctl", action, unit]);
      } catch {
        throw HttpError.unavailable(`Could not ${action} the server`);
      }
    },
  };
}

function toState(output: string): ServiceState {
  const value = output.trim();
  return value === "active" || value === "inactive" || value === "failed" ? value : "unknown";
}
