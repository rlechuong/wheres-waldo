import type { PrismaClient } from "../generated/prisma/client.js";

const findLeaderboard = async (prisma: PrismaClient, sceneId: number, limit: number) => {
  const rows = await prisma.$queryRaw<{ playerName: string; durationMs: number }[]>`
  SELECT "playerName", (EXTRACT(EPOCH FROM ("finishedAt" - "startedAt")) * 1000)::float8 
    AS "durationMs"
  FROM "GameSession"
  WHERE "sceneId" = ${sceneId}
    AND "playerName" IS NOT NULL
    AND "finishedAt" IS NOT NULL
    ORDER BY "durationMs" ASC
    LIMIT ${limit}
  `;

  return rows;
};

export { findLeaderboard };
