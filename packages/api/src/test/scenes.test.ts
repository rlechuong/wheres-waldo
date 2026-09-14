import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "./setup.js";

const createTestScene = async () => {
  const scene = await prisma.scene.create({
    data: {
      name: "Test Scene Name",
      slug: "test-scene-slug",
      publicId: "testScenePublicId",
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
            xMin: 0.1,
            xMax: 0.2,
            yMin: 0.1,
            yMax: 0.2,
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

describe("GET /scenes", () => {
  it("returns SceneSummary", async () => {
    const scene = await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).get("/scenes");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: scene.id,
        name: scene.name,
        slug: scene.slug,
        publicId: scene.publicId,
        characterCount: scene.characters.length,
      },
    ]);
  });
});

describe("GET /scenes/:slug", () => {
  it("returns SceneDetail", async () => {
    const scene = await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).get("/scenes/test-scene-slug");

    const [first, second] = scene.characters;
    if (!first || !second) throw new Error("Test setup failed.");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: scene.id,
      name: scene.name,
      slug: scene.slug,
      publicId: scene.publicId,
      width: scene.width,
      height: scene.height,
      characters: [
        {
          id: first.id,
          name: first.name,
          thumbnailPublicId: first.thumbnailPublicId,
        },
        {
          id: second.id,
          name: second.name,
          thumbnailPublicId: second.thumbnailPublicId,
        },
      ],
    });
  });

  it("returns 404 on invalid slug", async () => {
    await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).get("/scenes/nonexistent-scene-slug");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "SCENE_NOT_FOUND", message: "Scene not found." } });
  });
});
