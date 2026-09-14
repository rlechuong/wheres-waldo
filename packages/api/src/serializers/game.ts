import type { CreateGameResponse } from "@wheres-waldo/shared";

const toCreateGameResponse = (gameSession: {
  id: string;
  startedAt: Date;
}): CreateGameResponse => ({
  sessionId: gameSession.id,
  startedAt: gameSession.startedAt.toISOString(),
});

export { toCreateGameResponse };
