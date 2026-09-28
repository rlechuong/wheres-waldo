import type { CreateGameResponse, FoundCharacter, GameState } from "@wheres-waldo/shared";

const toCreateGameResponse = (gameSession: {
  id: string;
  startedAt: Date;
}): CreateGameResponse => ({
  sessionId: gameSession.id,
  startedAt: gameSession.startedAt.toISOString(),
});

const toGameState = (gameState: {
  id: string;
  playerName: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  scene: {
    slug: string;
    _count: { characters: number };
  };
  foundCharacters: { character: FoundCharacter }[];
}): GameState => ({
  sessionId: gameState.id,
  playerName: gameState.playerName,
  sceneSlug: gameState.scene.slug,
  startedAt: gameState.startedAt.toISOString(),
  finishedAt: gameState.finishedAt?.toISOString() ?? null,
  foundCharacters: gameState.foundCharacters.map((found) => found.character),
  isComplete: gameState.scene._count.characters === gameState.foundCharacters.length,
});

export { toCreateGameResponse, toGameState };
