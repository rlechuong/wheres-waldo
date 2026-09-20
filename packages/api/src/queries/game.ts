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

const updatePlayerName = async (prisma: PrismaClient, sessionId: string, playerName: string) => {
  const result = await prisma.gameSession.updateMany({
    where: { id: sessionId, playerName: null },
    data: { playerName },
  });

  return result.count;
};

const countFasterGames = async (prisma: PrismaClient, sceneId: number, durationMs: number) => {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
  SELECT COUNT(*) as count
  FROM "GameSession"
  WHERE "sceneId" = ${sceneId}
    AND "playerName" IS NOT NULL
    AND "finishedAt" IS NOT NULL
    AND EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) * 1000 < ${durationMs}
  `;

  return Number(rows[0]?.count ?? 0);
};

export { createGameSession, findGameState, findFoundCharacter, updatePlayerName, countFasterGames };
