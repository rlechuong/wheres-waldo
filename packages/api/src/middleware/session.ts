import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/error.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const requireSession =
  (prisma: PrismaClient) => async (req: Request, _res: Response, next: NextFunction) => {
    const sessionId = req.header("X-Game-Session");

    if (!sessionId) {
      next(new ApiError(401, "MISSING_SESSION", "X-Game-Session header is required."));
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: { id: true, playerName: true, startedAt: true, finishedAt: true, sceneId: true },
    });

    if (!session) {
      next(new ApiError(404, "SESSION_NOT_FOUND", "Session not found."));
      return;
    }

    req.session = session;
    next();
  };

export { requireSession };
