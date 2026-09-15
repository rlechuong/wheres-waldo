import type { GameSession } from "../generated/prisma/client.js";

export type SessionContext = Pick<
  GameSession,
  "id" | "sceneId" | "startedAt" | "finishedAt" | "playerName"
>;
