import type { PrismaClient } from "../generated/prisma/client.js";

const createGameSession = async (prisma: PrismaClient, sceneId: number) => {
  const gameSession = await prisma.gameSession.create({
    data: { sceneId },
    select: { id: true, startedAt: true },
  });

  return gameSession;
};

const findGameState = async (prisma: PrismaClient, sessionId: string) => {
  const gameSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      startedAt: true,
      scene: {
        select: {
          slug: true,
          _count: { select: { characters: true } },
        },
      },
      foundCharacters: {
        select: {
          character: {
            select: { id: true, name: true, xMin: true, xMax: true, yMin: true, yMax: true },
          },
        },
        orderBy: { character: { id: "asc" } },
      },
    },
  });

  return gameSession;
};

const findFoundCharacter = async (
  prisma: PrismaClient,
  gameSessionId: string,
  characterId: number,
) => {
  const foundCharacter = await prisma.foundCharacter.findUnique({
    where: { gameSessionId_characterId: { gameSessionId, characterId } },
    select: { gameSessionId: true },
  });

  return foundCharacter;
};

export { createGameSession, findGameState, findFoundCharacter };
