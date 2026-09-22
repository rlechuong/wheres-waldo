import { useEffect } from "react";
import { useQuery, useMutation, skipToken } from "@tanstack/react-query";
import { createGame, fetchGameState } from "../lib/api/games.js";
import { loadSessionId, saveSessionId, clearSessionId } from "../lib/session.js";
import { ApiError } from "../lib/api.js";

const useGameSession = (slug: string) => {
  const startGame = useMutation({
    mutationFn: () => createGame(slug),
    onSuccess: (data) => saveSessionId(slug, data.sessionId),
  });

  const storedSessionId = startGame.data?.sessionId ?? loadSessionId(slug);

  const game = useQuery({
    queryKey: ["game", storedSessionId],
    queryFn: storedSessionId ? () => fetchGameState(storedSessionId) : skipToken,
    retry: false,
  });

  const sessionMissing = game.error instanceof ApiError && game.error.code === "SESSION_NOT_FOUND";

  const sessionId = sessionMissing ? null : storedSessionId;

  useEffect(() => {
    if (sessionMissing) clearSessionId(slug);
  }, [sessionMissing, slug]);

  return {
    sessionId,
    gameState: sessionId ? game.data : undefined,
    start: () => startGame.mutate(),
    isStarting: startGame.isPending,
    isLoading: game.isPending && sessionId !== null,
  };
};

export { useGameSession };
