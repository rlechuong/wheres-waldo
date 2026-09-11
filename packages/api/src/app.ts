import express from "express";
import type { PrismaClient } from "./generated/prisma/client.js";
import { toSceneSummary } from "./serializers/scene.js";

const createApp = (prisma: PrismaClient) => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/scenes", async (_req, res) => {
    const scenes = await prisma.scene.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        publicId: true,
        _count: { select: { characters: true } },
      },
      orderBy: { id: "asc" },
    });

    res.json(scenes.map(toSceneSummary));
  });

  return app;
};

export { createApp };
