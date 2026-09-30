import type { Request, Response } from "express";
import { findAllScenes, findSceneBySlug } from "../queries/scene.js";
import { findLeaderboard } from "../queries/leaderboard.js";
import { toSceneDetail, toSceneSummary } from "../serializers/scene.js";
import { toLeaderboard } from "../serializers/leaderboard.js";
import { ApiError } from "../lib/error.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const LEADERBOARD_LIMIT = 20;

const handleGetScenes = (prisma: PrismaClient) => async (_req: Request, res: Response) => {
  const scenes = await findAllScenes(prisma);
  res.json(scenes.map(toSceneSummary));
};

const handleGetSceneBySlug =
  (prisma: PrismaClient) => async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;

    const scene = await findSceneBySlug(prisma, slug);
    if (!scene) {
      throw new ApiError(404, "SCENE_NOT_FOUND", "Scene not found.");
    }

    res.json(toSceneDetail(scene));
  };

const handleGetLeaderboard =
  (prisma: PrismaClient) => async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;

    const scene = await findSceneBySlug(prisma, slug);
    if (!scene) {
      throw new ApiError(404, "SCENE_NOT_FOUND", "Scene not found.");
    }

    const entries = await findLeaderboard(prisma, scene.id, LEADERBOARD_LIMIT);

    res.json(toLeaderboard(scene, entries));
  };

export { handleGetScenes, handleGetSceneBySlug, handleGetLeaderboard };
