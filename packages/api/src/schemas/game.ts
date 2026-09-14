import { z } from "zod";

export const createGameSchema = z.object({
  sceneSlug: z.string({ message: "sceneSlug is required." }).min(1),
});

export type CreateGameBody = z.infer<typeof createGameSchema>;
