import { Router } from "express";
import type { MinecraftStatusService } from "./status.service.js";

export function createPublicRoutes(minecraft: MinecraftStatusService): Router {
  const router = Router();

  router.get("/status", async (_req, res) => {
    res.json(await minecraft.getStatus());
  });

  router.get("/players", async (_req, res) => {
    res.json(await minecraft.getPlayers());
  });

  return router;
}
