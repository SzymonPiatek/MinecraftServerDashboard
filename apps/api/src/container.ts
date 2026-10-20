import type { Env } from "./config/env.js";
import { createPrismaClient } from "./db/prisma.js";
import { createPlayersService, type PlayersService } from "./modules/admin/players.service.js";
import { createWhitelistService, type WhitelistService } from "./modules/admin/whitelist.service.js";
import { createAuditService, type AuditService } from "./modules/audit/audit.service.js";
import { createPrismaAdminRepository, type AdminRepository } from "./modules/auth/admin.repository.js";
import { createAuthService, type AuthService } from "./modules/auth/auth.service.js";
import { createSessionTokens } from "./modules/auth/session-token.js";
import { createRconClient, type RconClient } from "./modules/minecraft/rcon.client.js";
import {
  createMinecraftStatusService,
  type MinecraftStatusService,
} from "./modules/minecraft/status.service.js";
import { createDockerService, type ServerControlService } from "./modules/server-control/docker.service.js";

/** Everything the HTTP layer depends on; tests substitute fakes for any of these. */
export interface Container {
  env: Env;
  admins: AdminRepository;
  auth: AuthService;
  audit: AuditService;
  minecraft: MinecraftStatusService;
  rcon: RconClient;
  whitelist: WhitelistService;
  players: PlayersService;
  serverControl: ServerControlService;
  close(): Promise<void>;
}

export function createContainer(env: Env): Container {
  const prisma = createPrismaClient(env.DATABASE_URL);
  const admins = createPrismaAdminRepository(prisma);
  const rcon = createRconClient({
    host: env.MC_HOST,
    port: env.RCON_PORT,
    password: env.RCON_PASSWORD,
    timeoutMs: env.MC_TIMEOUT_MS,
  });

  return {
    env,
    admins,
    auth: createAuthService(admins, createSessionTokens(env.JWT_SECRET, env.SESSION_TTL_HOURS)),
    audit: createAuditService(prisma),
    minecraft: createMinecraftStatusService({
      host: env.MC_HOST,
      port: env.MC_PORT,
      queryPort: env.MC_QUERY_PORT,
      timeoutMs: env.MC_TIMEOUT_MS,
      cacheMs: env.MC_STATUS_CACHE_MS,
    }),
    rcon,
    whitelist: createWhitelistService(rcon),
    players: createPlayersService(rcon),
    serverControl: createDockerService({ apiUrl: env.DOCKER_API_URL, containerName: env.MC_CONTAINER_NAME }),
    close: () => prisma.$disconnect(),
  };
}
