import express from "express";
import { createSceneRouter } from "./routes/scene.js";
import type { PrismaClient } from "./generated/prisma/client.js";

const createApp = (prisma: PrismaClient) => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/scenes", createSceneRouter(prisma));

  return app;
};

export { createApp };
