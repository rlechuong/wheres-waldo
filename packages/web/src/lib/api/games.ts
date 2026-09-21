import { apiFetch } from "../api.js";
import type {
  CreateGameResponse,
  GameState,
  GuessRequest,
  GuessResponse,
  ScoreResponse,
} from "@wheres-waldo/shared";

const createGame = (sceneSlug: string) =>
  apiFetch<CreateGameResponse>("/games", { method: "POST", body: JSON.stringify({ sceneSlug }) });

const fetchGameState = (sessionId: string) =>
  apiFetch<GameState>("/games/current", { headers: { "X-Game-Session": sessionId } });

const submitGuess = (sessionId: string, guess: GuessRequest) =>
  apiFetch<GuessResponse>("/guesses", {
    method: "POST",
    body: JSON.stringify(guess),
    headers: { "X-Game-Session": sessionId },
  });

const submitScore = (sessionId: string, playerName: string) =>
  apiFetch<ScoreResponse>("/games/current/score", {
    method: "PATCH",
    body: JSON.stringify({ playerName }),
    headers: { "X-Game-Session": sessionId },
  });

export { createGame, fetchGameState, submitGuess, submitScore };
