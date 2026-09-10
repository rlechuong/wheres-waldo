import express from "express";
import type { PrismaClient } from "./generated/prisma/client.js";

const createApp = (prisma: PrismaClient) => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/scenes", async (_req, res) => {
    const scenes = await prisma.scene.findMany();
    res.json(scenes);
  });

  return app;
};

export { createApp };
