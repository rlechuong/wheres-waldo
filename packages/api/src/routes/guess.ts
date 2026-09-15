import { Router } from "express";
import { handleCreateGuess } from "../controllers/guess.js";
import { requireSession } from "../middleware/session.js";
import { validateBody } from "../middleware/validate.js";
import { createGuessSchema } from "../schemas/game.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const createGuessRouter = (prisma: PrismaClient) => {
  const router = Router();

  router.post(
    "/",
    requireSession(prisma),
    validateBody(createGuessSchema),
    handleCreateGuess(prisma),
  );

  return router;
};

export { createGuessRouter };
