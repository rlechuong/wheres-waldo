import { z } from "zod";

export const createGameSchema = z.object({
  sceneSlug: z.string({ message: "sceneSlug is required." }).min(1),
});

export type CreateGameBody = z.infer<typeof createGameSchema>;

export const createGuessSchema = z.object({
  characterId: z.number({ message: "characterId is required." }).int().positive(),
  x: z
    .number({ message: "x is required." })
    .min(0, { message: "x must be between 0 and 1." })
    .max(1, { message: "x must be between 0 and 1." }),
  y: z
    .number({ message: "y is required." })
    .min(0, { message: "y must be between 0 and 1." })
    .max(1, { message: "y must be between 0 and 1." }),
});

export type CreateGuessBody = z.infer<typeof createGuessSchema>;
