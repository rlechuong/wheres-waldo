import express from "express";
import cors from "cors";
import { createSceneRouter } from "./routes/scene.js";
import { createGameRouter } from "./routes/game.js";
import { createGuessRouter } from "./routes/guess.js";
import { errorHandler } from "./middleware/error.js";
import { ApiError } from "./lib/error.js";
import type { PrismaClient } from "./generated/prisma/client.js";

const createApp = (prisma: PrismaClient) => {
  const app = express();

  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") ?? [];
  const corsOptions = {
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "X-Game-Session"],
  };
  app.use(cors(corsOptions));

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/scenes", createSceneRouter(prisma));
  app.use("/games", createGameRouter(prisma));
  app.use("/guesses", createGuessRouter(prisma));

  app.use((_req, _res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Route not found."));
  });

  app.use(errorHandler);

  return app;
};

export { createApp };
