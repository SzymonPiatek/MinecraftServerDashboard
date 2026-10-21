import { parseEnv } from "../src/config/env.js";
import type { Container } from "../src/container.js";
import type { ContactBody } from "@mcd/shared";
import { createPlayersService } from "../src/modules/admin/players.service.js";
import { createPropertiesService } from "../src/modules/admin/properties.service.js";
import { createGamerulesService } from "../src/modules/admin/gamerules.service.js";
import { createBansService } from "../src/modules/admin/bans.service.js";
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

  const propertiesFile = {
    text: "#Minecraft server properties\n#Wed Oct 21 10:00:00 UTC 2026\nmotd=A Minecraft Server\nmax-players=20\npvp=true\nrcon.password=hunter2\nserver-port=25565\n",
  };
  const rconCommands: string[] = [];
  const rcon = {
    execute: async (command: string) => {
      rconCommands.push(command);
      return rconReplies[command] ?? "";
    },
    executeMany: async (commands: string[]) =>
      commands.map((command) => (rconCommands.push(command), rconReplies[command] ?? "")),
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
    bans: createBansService(rcon),
    gamerules: createGamerulesService(rcon),
    properties: createPropertiesService({
      readProperties: async () => ({
        text: propertiesFile.text,
        meta: { mode: 0o644, uid: 1000, gid: 1000 },
      }),
      writeProperties: async (text) => void (propertiesFile.text = text),
    }),
    serverControl: {
      getState: async () => "active",
      control: async (action) => void serverActions.push(action),
      getLogs: async () => [
        { time: "2026-10-21T10:00:00.5Z", text: "[10:00:00] [Server thread/INFO]: Done" },
      ],
    },
    close: async () => {},
  };

  return { container, rconCommands, auditEvents, serverActions, contactMessages, propertiesFile };
}
