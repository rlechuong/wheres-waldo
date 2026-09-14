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
          {
            name: "Test Character 2",
            thumbnailPublicId: "testThumbnailPublicId2",
            xMin: 0.1,
            xMax: 0.2,
            yMin: 0.1,
            yMax: 0.2,
          },
          {
            name: "Test Character 3",
            thumbnailPublicId: "testThumbnailPublicId3",
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

const createTestGameSession = async (sceneId: number) => {
  const gameSession = await prisma.gameSession.create({
    data: {
      sceneId,
    },
  });

  return gameSession;
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

describe("GET /games/current", () => {
  it("returns empty foundCharacters and isComplete: false on fresh session", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const app = createApp(prisma);

    const res = await request(app).get("/games/current").set("X-Game-Session", gameSession.id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sessionId: gameSession.id,
      sceneSlug: scene.slug,
      startedAt: gameSession.startedAt.toISOString(),
      foundCharacters: [],
      isComplete: false,
    });
  });

  it("returns found characters with coordinates", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    await prisma.foundCharacter.create({
      data: {
        gameSessionId: gameSession.id,
        characterId: first.id,
      },
    });
    const app = createApp(prisma);

    const res = await request(app).get("/games/current").set("X-Game-Session", gameSession.id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sessionId: gameSession.id,
      sceneSlug: scene.slug,
      startedAt: gameSession.startedAt.toISOString(),
      foundCharacters: [
        {
          id: first.id,
          name: first.name,
          xMin: first.xMin,
          xMax: first.xMax,
          yMin: first.yMin,
          yMax: first.yMax,
        },
      ],
      isComplete: false,
    });
  });

  it("returns true for isComplete if all characters found", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first, second, third] = scene.characters;
    if (!first || !second || !third) throw new Error("Test setup failed.");
    await prisma.foundCharacter.createMany({
      data: [
        { gameSessionId: gameSession.id, characterId: first.id },
        { gameSessionId: gameSession.id, characterId: second.id },
        { gameSessionId: gameSession.id, characterId: third.id },
      ],
    });
    const app = createApp(prisma);

    const res = await request(app).get("/games/current").set("X-Game-Session", gameSession.id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sessionId: gameSession.id,
      sceneSlug: scene.slug,
      startedAt: gameSession.startedAt.toISOString(),
      foundCharacters: [
        {
          id: first.id,
          name: first.name,
          xMin: first.xMin,
          xMax: first.xMax,
          yMin: first.yMin,
          yMax: first.yMax,
        },
        {
          id: second.id,
          name: second.name,
          xMin: second.xMin,
          xMax: second.xMax,
          yMin: second.yMin,
          yMax: second.yMax,
        },
        {
          id: third.id,
          name: third.name,
          xMin: third.xMin,
          xMax: third.xMax,
          yMin: third.yMin,
          yMax: third.yMax,
        },
      ],
      isComplete: true,
    });
  });

  it("returns 401 if no header sent", async () => {
    const app = createApp(prisma);

    const res = await request(app).get("/games/current");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: "MISSING_SESSION", message: "X-Game-Session header is required." },
    });
  });

  it("returns 404 if session doesn't exist", async () => {
    const app = createApp(prisma);

    const res = await request(app)
      .get("/games/current")
      .set("X-Game-Session", "01936c7a-0000-7000-8000-000000000000");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "SESSION_NOT_FOUND", message: "Session not found." },
    });
  });
});
