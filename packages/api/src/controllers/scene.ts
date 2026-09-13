import type { Request, Response } from "express";
import { findAllScenes } from "../queries/scene.js";
import { toSceneSummary } from "../serializers/scene.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const handleGetScenes = (prisma: PrismaClient) => async (_req: Request, res: Response) => {
  const scenes = await findAllScenes(prisma);
  res.json(scenes.map(toSceneSummary));
};

export { handleGetScenes };
