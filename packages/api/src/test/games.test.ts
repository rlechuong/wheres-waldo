import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "./setup.js";
import type { CreateGameResponse } from "@wheres-waldo/shared";

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
        ],
      },
    },
    include: {
      characters: true,
    },
  });

  return scene;
};

describe("POST /games", () => {
  it("creates a session", async () => {
    const scene = await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).post("/games").send({ sceneSlug: "test-scene-slug" });
    const body = res.body as CreateGameResponse;

    expect(res.status).toBe(201);
    expect(typeof body.sessionId).toBe("string");
    expect(typeof body.startedAt).toBe("string");

    const session = await prisma.gameSession.findUnique({
      where: { id: body.sessionId },
    });

    expect(session).not.toBeNull();
    expect(session?.sceneId).toBe(scene.id);
  });

  it("returns 404 when scene slug doesn't exist", async () => {
    await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).post("/games").send({ sceneSlug: "nonexistent-scene-slug" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "SCENE_NOT_FOUND", message: "Scene not found." } });
  });

  it("returns 400 when a scene slug isn't sent", async () => {
    await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).post("/games").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: "INVALID_REQUEST_BODY", message: "sceneSlug is required." },
    });
  });
});
