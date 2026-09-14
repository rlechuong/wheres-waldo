import type { Request, Response } from "express";
import { createGameSession } from "../queries/game.js";
import { findSceneBySlug } from "../queries/scene.js";
import { toCreateGameResponse } from "../serializers/game.js";
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

export { handleCreateGame };
