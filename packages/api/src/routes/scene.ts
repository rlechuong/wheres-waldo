import { Router } from "express";
import { handleGetScenes } from "../controllers/scene.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const createSceneRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", handleGetScenes(prisma));

  return router;
};

export { createSceneRouter };
