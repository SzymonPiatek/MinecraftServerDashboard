import type { PlayerAction, ServerControlAction } from "@mcd/shared";

const enc = encodeURIComponent;

/** Single source of truth for every backend path the web app talks to (relative to `API_BASE`). */
export const apiRoutes = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  contact: "/contact",
  public: {
    status: "/status",
    players: "/players",
  },
  admin: {
    whitelist: "/admin/whitelist",
    whitelistEntry: (username: string) => `/admin/whitelist/${enc(username)}`,
    bans: "/admin/bans",
    playerAction: (username: string, action: PlayerAction) => `/admin/players/${enc(username)}/${action}`,
    console: "/admin/console",
    server: "/admin/server",
    serverAction: (action: ServerControlAction) => `/admin/server/${action}`,
    auditLog: "/admin/audit-log",
  },
} as const;
