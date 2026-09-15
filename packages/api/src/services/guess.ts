import { findCharacterById } from "../queries/character.js";
import { findFoundCharacter, findGameState } from "../queries/game.js";
import { ApiError } from "../lib/error.js";
import type { SessionContext } from "../types/session.js";
import type { CreateGuessBody } from "../schemas/game.js";
import type { PrismaClient } from "../generated/prisma/client.js";

const recordGuess = async (
  prisma: PrismaClient,
  session: SessionContext,
  { characterId, x, y }: CreateGuessBody,
) => {
  if (session.finishedAt) {
    throw new ApiError(409, "GAME_ALREADY_FINISHED", "Game already finished.");
  }

  const character = await findCharacterById(prisma, characterId);
  if (!character) {
    throw new ApiError(404, "CHARACTER_NOT_FOUND", "Character not found.");
  }

  // The schema cannot enforce that a character belongs to a scene because each foreign key is
  // validated independently, so nothing checks the join.
  if (character.sceneId !== session.sceneId) {
    throw new ApiError(
      400,
      "CHARACTER_SCENE_MISMATCH",
      "Character does not belong to this game's scene.",
    );
  }

  const foundCharacter = await findFoundCharacter(prisma, session.id, characterId);
  if (foundCharacter) {
    throw new ApiError(409, "CHARACTER_ALREADY_FOUND", "Character already found.");
  }

  const correct =
    x >= character.xMin && x <= character.xMax && y >= character.yMin && y <= character.yMax;

  if (correct) {
    await prisma.$transaction(async (tx) => {
      await tx.foundCharacter.create({
        data: { gameSessionId: session.id, characterId },
      });

      const foundCount = await tx.foundCharacter.count({
        where: { gameSessionId: session.id },
      });

      const totalCount = await tx.character.count({
        where: { sceneId: session.sceneId },
      });

      if (foundCount === totalCount) {
        await tx.gameSession.update({
          where: { id: session.id },
          data: { finishedAt: new Date() },
        });
      }
    });
  }

  const gameState = await findGameState(prisma, session.id);
  if (!gameState) {
    throw new ApiError(500, "INTERNAL_ERROR", "Game state could not be loaded.");
  }

  return { correct, gameState };
};

export { recordGuess };
