import { parseEnv } from "../src/config/env.js";
import type { Container } from "../src/container.js";
import type { ContactBody } from "@mcd/shared";
import { createPlayersService } from "../src/modules/admin/players.service.js";
import { createWhitelistService } from "../src/modules/admin/whitelist.service.js";
import type { AuditEvent } from "../src/modules/audit/audit.service.js";
import type { AdminRecord } from "../src/modules/auth/admin.repository.js";
import { createAuthService } from "../src/modules/auth/auth.service.js";
import { hashPassword } from "../src/modules/auth/password.js";
import { createSessionTokens } from "../src/modules/auth/session-token.js";

export const ADMIN = { username: "admin", password: "correct-horse-battery" };

export async function createTestContainer(rconReplies: Record<string, string> = {}) {
  const env = parseEnv({
    NODE_ENV: "test",
    JWT_SECRET: "x".repeat(32),
    RCON_PASSWORD: "secret",
    LOG_LEVEL: "silent",
  });

  const record: AdminRecord = {
    id: 1,
    username: ADMIN.username,
    passwordHash: await hashPassword(ADMIN.password),
  };
  const admins = {
    findByUsername: async (u: string) => (u === record.username ? record : null),
    findById: async (id: number) => (id === record.id ? record : null),
    upsert: async () => record,
  };

  const rconCommands: string[] = [];
  const rcon = {
    execute: async (command: string) => {
      rconCommands.push(command);
      return rconReplies[command] ?? "";
    },
  };

  const auditEvents: AuditEvent[] = [];
  const serverActions: string[] = [];
  const contactMessages: ContactBody[] = [];

  const container: Container = {
    env,
    admins,
    auth: createAuthService(admins, createSessionTokens(env.JWT_SECRET, env.SESSION_TTL_HOURS)),
    audit: {
      record: async (event) => void auditEvents.push(event),
      list: async () => [],
    },
    contact: { send: async (message) => void contactMessages.push(message) },
    minecraft: {
      getStatus: async () => ({
        online: true,
        playersOnline: 1,
        playersMax: 20,
        version: "1.21",
        motd: "Hello",
        pingMs: 12,
      }),
      getPlayers: async () => ({ online: 1, max: 20, players: ["Steve"] }),
    },
    rcon,
    whitelist: createWhitelistService(rcon),
    players: createPlayersService(rcon),
    serverControl: {
      getState: async () => "active",
      control: async (action) => void serverActions.push(action),
    },
    close: async () => {},
  };

  return { container, rconCommands, auditEvents, serverActions, contactMessages };
}
