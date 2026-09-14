import { Router } from "express";
import { handleCreateGame } from "../controllers/game.js";
import { validateBody } from "../middleware/validate.js";
import { createGameSchema } from "../schemas/game.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const createGameRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.post("/", validateBody(createGameSchema), handleCreateGame(prisma));

  return router;
};

export { createGameRouter };
