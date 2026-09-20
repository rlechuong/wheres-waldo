import { Router } from "express";
import { handleCreateGame, handleGetCurrentGame, handleSubmitScore } from "../controllers/game.js";
import { requireSession } from "../middleware/session.js";
import { validateBody } from "../middleware/validate.js";
import { createGameSchema, submitScoreSchema } from "../schemas/game.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const createGameRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.patch(
    "/current/score",
    requireSession(prisma),
    validateBody(submitScoreSchema),
    handleSubmitScore(prisma),
  );
  router.get("/current", requireSession(prisma), handleGetCurrentGame(prisma));
  router.post("/", validateBody(createGameSchema), handleCreateGame(prisma));

  return router;
};

export { createGameRouter };
