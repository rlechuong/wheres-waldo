import type { PrismaClient } from "../generated/prisma/client.js";
import type { SessionContext } from "../types/session.js";
import type { SubmitScoreBody } from "../schemas/game.js";
import type { ScoreResponse } from "@wheres-waldo/shared";
import { ApiError } from "../lib/error.js";
import { countFasterGames, updatePlayerName } from "../queries/game.js";

const submitScore = async (
  prisma: PrismaClient,
  session: SessionContext,
  { playerName }: SubmitScoreBody,
): Promise<ScoreResponse> => {
  if (!session.finishedAt) {
    throw new ApiError(409, "GAME_NOT_FINISHED", "Game not finished.");
  }

  if (session.playerName) {
    throw new ApiError(409, "NAME_ALREADY_SUBMITTED", "Name already submitted.");
  }

  const resolvedName = playerName === "" ? "Anonymous" : playerName;

  const updated = await updatePlayerName(prisma, session.id, resolvedName);
  if (updated === 0) {
    throw new ApiError(409, "NAME_ALREADY_SUBMITTED", "Name already submitted.");
  }

  const durationMs = session.finishedAt.getTime() - session.startedAt.getTime();

  const fasterGames = await countFasterGames(prisma, session.sceneId, durationMs);
  const rank = fasterGames + 1;

  return { playerName: resolvedName, durationMs, rank };
};

export { submitScore };
