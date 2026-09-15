import type { Request, Response } from "express";
import { recordGuess } from "../services/guess.js";
import { toGameState } from "../serializers/game.js";
import { ApiError } from "../lib/error.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { CreateGuessBody } from "../schemas/game.js";

const handleCreateGuess =
  (prisma: PrismaClient) =>
  async (req: Request<unknown, unknown, CreateGuessBody>, res: Response) => {
    const session = req.session;
    if (!session) {
      throw new ApiError(500, "INTERNAL_ERROR", "Session middleware did not run.");
    }

    const { correct, gameState } = await recordGuess(prisma, session, req.body);

    res.json({ correct, ...toGameState(gameState) });
  };

export { handleCreateGuess };
