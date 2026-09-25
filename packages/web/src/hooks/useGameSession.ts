import { useEffect } from "react";
import { useQuery, useMutation, skipToken, useQueryClient } from "@tanstack/react-query";
import { postGame, fetchGameState, postGuess, patchScore } from "../lib/api/games.js";
import { loadSessionId, saveSessionId, clearSessionId } from "../lib/session.js";
import { ApiError } from "../lib/api.js";
import type { GuessRequest } from "@wheres-waldo/shared";

const useGameSession = (slug: string) => {
  const queryClient = useQueryClient();

  const startGameMutation = useMutation({
    mutationFn: () => postGame(slug),
    onSuccess: (data) => {
      saveSessionId(slug, data.sessionId);
      queryClient.setQueryData(["game", data.sessionId], {
        sessionId: data.sessionId,
        sceneSlug: slug,
        startedAt: data.startedAt,
        foundCharacters: [],
        isComplete: false,
      });
    },
  });

  const unverifiedSessionId = startGameMutation.data?.sessionId ?? loadSessionId(slug);

  const gameQuery = useQuery({
    queryKey: ["game", unverifiedSessionId],
    queryFn: unverifiedSessionId ? () => fetchGameState(unverifiedSessionId) : skipToken,
    retry: false,
  });

  const sessionMissing =
    gameQuery.error instanceof ApiError && gameQuery.error.code === "SESSION_NOT_FOUND";

  const sessionId = sessionMissing ? null : unverifiedSessionId;

  useEffect(() => {
    if (sessionMissing) clearSessionId(slug);
  }, [sessionMissing, slug]);

  const guessMutation = useMutation({
    mutationFn: (body: GuessRequest) => {
      if (!sessionId) throw new Error("No active session.");
      return postGuess(sessionId, body);
    },
    onSuccess: ({ correct: _correct, ...gameState }) => {
      queryClient.setQueryData(["game", sessionId], gameState);
    },
  });

  const scoreMutation = useMutation({
    mutationFn: (playerName: string) => {
      if (!sessionId) throw new Error("No active session.");
      return patchScore(sessionId, playerName);
    },
  });

  return {
    sessionId,
    gameState: sessionId ? gameQuery.data : undefined,
    startGame: () => startGameMutation.mutate(),
    isStartingGame: startGameMutation.isPending,
    isResumingGame: gameQuery.isPending && sessionId !== null,
    submitGuess: guessMutation.mutate,
    isSubmittingGuess: guessMutation.isPending,
    lastGuessCorrect: guessMutation.data?.correct,
    submitScore: scoreMutation.mutate,
    isSubmittingScore: scoreMutation.isPending,
    scoreResult: scoreMutation.data,
    scoreError: scoreMutation.error,
  };
};

export { useGameSession };
