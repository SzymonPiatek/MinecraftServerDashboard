import type {
  AdminSession,
  AuditLogEntry,
  BannedPlayer,
  Gamerule,
  ServerProperty,
  LogLine,
  ContactBody,
  LoginBody,
  OnlinePlayers,
  PlayerAction,
  PlayerReasonBody,
  ServerControlAction,
  ServerStatus,
  ServiceState,
} from "@mcd/shared";
import { apiFetcher } from "./api-fetcher";
import { apiRoutes } from "./routes";

interface WithSignal {
  signal?: AbortSignal;
}

export const authActions = {
  login: (body: LoginBody) =>
    apiFetcher<AdminSession>(apiRoutes.auth.login, { method: "POST", body, expireSessionOn401: false }),
  logout: () => apiFetcher(apiRoutes.auth.logout, { method: "POST" }),
  me: ({ signal }: WithSignal = {}) =>
    apiFetcher<AdminSession>(apiRoutes.auth.me, { signal, expireSessionOn401: false }),
};

export const contactActions = {
  send: (body: Record<string, FormDataEntryValue> | ContactBody) =>
    apiFetcher(apiRoutes.contact, {
      method: "POST",
      body,
      fallbackError: "Nie udało się wysłać wiadomości.",
    }),
};

export const publicActions = {
  getStatus: ({ signal }: WithSignal = {}) => apiFetcher<ServerStatus>(apiRoutes.public.status, { signal }),
  getPlayers: ({ signal }: WithSignal = {}) =>
    apiFetcher<OnlinePlayers>(apiRoutes.public.players, { signal }),
};

export const adminActions = {
  getWhitelist: ({ signal }: WithSignal = {}) =>
    apiFetcher<{ players: string[] }>(apiRoutes.admin.whitelist, { signal }),
  addToWhitelist: (username: string) =>
    apiFetcher(apiRoutes.admin.whitelist, { method: "POST", body: { username } }),
  removeFromWhitelist: (username: string) =>
    apiFetcher(apiRoutes.admin.whitelistEntry(username), { method: "DELETE" }),

  getLogs: (after?: string, { signal }: WithSignal = {}) =>
    apiFetcher<{ lines: LogLine[] }>(apiRoutes.admin.logs, { query: { after }, signal }),

  getGamerules: ({ signal }: WithSignal = {}) =>
    apiFetcher<{ rules: Gamerule[] }>(apiRoutes.admin.gamerules, { signal }),
  setGamerule: (name: string, value: boolean | number) =>
    apiFetcher<Gamerule>(apiRoutes.admin.gamerule(name), { method: "PUT", body: { value } }),

  getProperties: () => apiFetcher<{ properties: ServerProperty[] }>(apiRoutes.admin.properties),
  saveProperties: (changes: Record<string, string>, restart: boolean) =>
    apiFetcher<{ saved: number; restarted: boolean }>(apiRoutes.admin.properties, {
      method: "PUT",
      body: { changes, restart },
    }),

  getBans: ({ signal }: WithSignal = {}) =>
    apiFetcher<{ players: BannedPlayer[] }>(apiRoutes.admin.bans, { signal }),

  applyPlayerAction: (username: string, action: PlayerAction, body: PlayerReasonBody) =>
    apiFetcher<{ message: string }>(apiRoutes.admin.playerAction(username, action), {
      method: "POST",
      body,
    }),

  runConsoleCommand: (command: string) =>
    apiFetcher<{ output: string }>(apiRoutes.admin.console, { method: "POST", body: { command } }),

  getServerState: ({ signal }: WithSignal = {}) =>
    apiFetcher<{ state: ServiceState }>(apiRoutes.admin.server, { signal }),
  controlServer: (action: ServerControlAction) =>
    apiFetcher<{ state: ServiceState }>(apiRoutes.admin.serverAction(action), { method: "POST" }),

  getAuditLog: (limit = 50, { signal }: WithSignal = {}) =>
    apiFetcher<{ entries: AuditLogEntry[] }>(apiRoutes.admin.auditLog, { query: { limit }, signal }),
};
