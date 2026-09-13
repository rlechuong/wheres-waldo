import { Router } from "express";
import { handleGetSceneBySlug, handleGetScenes } from "../controllers/scene.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const createSceneRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.get("/", handleGetScenes(prisma));
  router.get("/:slug", handleGetSceneBySlug(prisma));

  return router;
};

export { createSceneRouter };
