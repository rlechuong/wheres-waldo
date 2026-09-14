import type { Request, Response } from "express";
import { createGameSession, findGameState } from "../queries/game.js";
import { findSceneBySlug } from "../queries/scene.js";
import { toCreateGameResponse, toGameState } from "../serializers/game.js";
import { ApiError } from "../lib/error.js";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { CreateGameBody } from "../schemas/game.js";

const handleCreateGame =
  (prisma: PrismaClient) =>
  async (req: Request<unknown, unknown, CreateGameBody>, res: Response) => {
    const { sceneSlug } = req.body;

    const scene = await findSceneBySlug(prisma, sceneSlug);
    if (!scene) {
      throw new ApiError(404, "SCENE_NOT_FOUND", "Scene not found.");
    }

    const gameSession = await createGameSession(prisma, scene.id);
    res.status(201).json(toCreateGameResponse(gameSession));
  };

const handleGetCurrentGame = (prisma: PrismaClient) => async (req: Request, res: Response) => {
  const session = req.session;
  if (!session) {
    throw new ApiError(500, "INTERNAL_ERROR", "Session middleware did not run.");
  }

  const gameState = await findGameState(prisma, session.id);
  if (!gameState) {
    throw new ApiError(404, "SESSION_NOT_FOUND", "Session not found.");
  }

  res.json(toGameState(gameState));
};

export { handleCreateGame, handleGetCurrentGame };
