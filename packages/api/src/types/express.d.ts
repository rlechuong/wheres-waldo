import type { GameSession } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      session?: Pick<GameSession, "id" | "sceneId" | "startedAt" | "finishedAt" | "playerName">;
    }
  }
}

export {};
