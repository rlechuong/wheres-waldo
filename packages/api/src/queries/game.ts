import type { PrismaClient } from "../generated/prisma/client.js";

const createGameSession = async (prisma: PrismaClient, sceneId: number) => {
  const gameSession = await prisma.gameSession.create({
    data: { sceneId },
    select: { id: true, startedAt: true },
  });

  return gameSession;
};

export { createGameSession };
