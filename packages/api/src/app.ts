import express from "express";
import { createSceneRouter } from "./routes/scene.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { errorHandler } from "./middleware/error.js";

const createApp = (prisma: PrismaClient) => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/scenes", createSceneRouter(prisma));
  app.use(errorHandler);

  return app;
};

export { createApp };
