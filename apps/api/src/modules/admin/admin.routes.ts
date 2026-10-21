import {
  consoleCommandBodySchema,
  playerActionSchema,
  playerReasonBodySchema,
  serverControlActionSchema,
  whitelistAddBodySchema,
  minecraftUsernameSchema,
  type ConsoleCommandBody,
  type PlayerReasonBody,
  type WhitelistAddBody,
} from "@mcd/shared";
import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { parseParam, validateBody } from "../../middleware/validate.js";
import type { AuditService } from "../audit/audit.service.js";
import { currentAdmin } from "../auth/require-admin.js";
import type { RconClient } from "../minecraft/rcon.client.js";
import type { ServerControlService } from "../server-control/docker.service.js";
import type { BansService } from "./bans.service.js";
import type { PlayersService } from "./players.service.js";
import type { WhitelistService } from "./whitelist.service.js";

interface AdminRoutesOptions {
  requireAdmin: RequestHandler;
  whitelist: WhitelistService;
  players: PlayersService;
  bans: BansService;
  rcon: RconClient;
  serverControl: ServerControlService;
  audit: AuditService;
}

const logsAfterSchema = z.iso.datetime().optional();
const auditLimitSchema = z.coerce.number().int().min(1).max(200).default(50);

export function createAdminRoutes(deps: AdminRoutesOptions): Router {
  const { requireAdmin, whitelist, players, bans, rcon, serverControl, audit } = deps;
  const router = Router();
  router.use(requireAdmin);

  // --- Whitelist ---
  router.get("/whitelist", async (_req, res) => {
    res.json({ players: await whitelist.list() });
  });

  router.post("/whitelist", validateBody(whitelistAddBodySchema), async (req, res) => {
    const { username } = req.body as WhitelistAddBody;
    await whitelist.add(username);
    await audit.record({ adminId: currentAdmin(req).id, action: "whitelist.add", target: username });
    res.status(201).json({ username });
  });

  router.delete("/whitelist/:username", async (req, res) => {
    const username = parseParam(minecraftUsernameSchema, req.params.username);
    await whitelist.remove(username);
    await audit.record({ adminId: currentAdmin(req).id, action: "whitelist.remove", target: username });
    res.status(204).end();
  });

  // --- Bans ---
  router.get("/bans", async (_req, res) => {
    res.json({ players: await bans.list() });
  });

  // --- Player management (kick, ban, pardon, op, deop) ---
  router.post("/players/:username/:action", validateBody(playerReasonBodySchema), async (req, res) => {
    const username = parseParam(minecraftUsernameSchema, req.params.username);
    const action = parseParam(playerActionSchema, req.params.action);
    const { reason } = req.body as PlayerReasonBody;

    const message = await players.apply(action, username, reason);
    await audit.record({
      adminId: currentAdmin(req).id,
      action: `player.${action}`,
      target: username,
      details: reason,
    });
    res.json({ message });
  });

  // --- Console ---
  router.post("/console", validateBody(consoleCommandBodySchema), async (req, res) => {
    const { command } = req.body as ConsoleCommandBody;
    const output = await rcon.execute(command);
    await audit.record({ adminId: currentAdmin(req).id, action: "console.command", details: command });
    res.json({ output });
  });

  // --- Server process ---
  router.get("/server", async (_req, res) => {
    res.json({ state: await serverControl.getState() });
  });

  router.get("/logs", async (req, res) => {
    const after = parseParam(logsAfterSchema, req.query.after);
    res.json({ lines: await serverControl.getLogs(after) });
  });

  router.post("/server/:action", async (req, res) => {
    const action = parseParam(serverControlActionSchema, req.params.action);
    await serverControl.control(action);
    await audit.record({ adminId: currentAdmin(req).id, action: `server.${action}` });
    res.status(202).json({ state: await serverControl.getState() });
  });

  // --- Audit log ---
  router.get("/audit-log", async (req, res) => {
    const limit = parseParam(auditLimitSchema, req.query.limit);
    res.json({ entries: await audit.list(limit) });
  });

  return router;
}
