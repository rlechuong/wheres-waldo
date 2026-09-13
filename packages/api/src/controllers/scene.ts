import type { Request, Response } from "express";
import { findAllScenes, findSceneBySlug } from "../queries/scene.js";
import { toSceneDetail, toSceneSummary } from "../serializers/scene.js";
import { ApiError } from "../lib/error.js";
import type { PrismaClient } from "../generated/prisma/client.js";

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

export { handleGetScenes, handleGetSceneBySlug };
