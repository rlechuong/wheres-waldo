import type { PrismaClient } from "../generated/prisma/client.js";

const findAllScenes = async (prisma: PrismaClient) => {
  const scenes = await prisma.scene.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      publicId: true,
      _count: { select: { characters: true } },
    },
    orderBy: { id: "asc" },
  });

  return scenes;
};

export { findAllScenes };
