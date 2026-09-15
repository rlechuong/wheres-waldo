import type { PrismaClient } from "../generated/prisma/client.js";

const findCharacterById = async (prisma: PrismaClient, id: number) => {
  const character = await prisma.character.findUnique({
    where: { id },
    select: { id: true, sceneId: true, xMin: true, xMax: true, yMin: true, yMax: true },
  });

  return character;
};

export { findCharacterById };
