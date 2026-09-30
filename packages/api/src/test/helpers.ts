import { prisma } from "./setup.js";

const createTestScene = async (slug = "test-scene-slug") => {
  const scene = await prisma.scene.create({
    data: {
      name: "Test Scene Name",
      slug,
      publicId: `testScenePublicId-${slug}`,
      width: 3000,
      height: 1500,
      characters: {
        create: [
          {
            name: "Test Character 1",
            thumbnailPublicId: "testThumbnailPublicId1",
            xMin: 0.1,
            xMax: 0.2,
            yMin: 0.1,
            yMax: 0.2,
          },
          {
            name: "Test Character 2",
            thumbnailPublicId: "testThumbnailPublicId2",
            xMin: 0.3,
            xMax: 0.4,
            yMin: 0.3,
            yMax: 0.4,
          },
          {
            name: "Test Character 3",
            thumbnailPublicId: "testThumbnailPublicId3",
            xMin: 0.5,
            xMax: 0.6,
            yMin: 0.5,
            yMax: 0.6,
          },
        ],
      },
    },
    include: {
      characters: true,
    },
  });

  return scene;
};

const createTestGameSession = async (sceneId: number) => {
  const gameSession = await prisma.gameSession.create({
    data: {
      sceneId,
    },
  });

  return gameSession;
};

const createFinishedSession = async (
  sceneId: number,
  durationMs: number,
  playerName: string | null = null,
) => {
  const startedAt = new Date("2026-01-01T00:00:00.000Z");
  const finishedAt = new Date(startedAt.getTime() + durationMs);

  return await prisma.gameSession.create({
    data: { sceneId, startedAt, finishedAt, playerName },
  });
};

export { createTestScene, createTestGameSession, createFinishedSession };
