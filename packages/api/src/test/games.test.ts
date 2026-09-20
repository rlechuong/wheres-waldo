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

describe("POST /guesses", () => {
  it("returns true for correct for a click inside a character's box", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: first.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: true,
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

  it("rejects the wrong character at valid coordinates", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first, second] = scene.characters;
    if (!first || !second) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: second.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: false,
      sessionId: gameSession.id,
      sceneSlug: scene.slug,
      startedAt: gameSession.startedAt.toISOString(),
      foundCharacters: [],
      isComplete: false,
    });
  });

  it("rejects a correct character outside its box", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: first.id, x: 0.95, y: 0.95 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: false,
      sessionId: gameSession.id,
      sceneSlug: scene.slug,
      startedAt: gameSession.startedAt.toISOString(),
      foundCharacters: [],
      isComplete: false,
    });
  });

  it("returns true for isComplete if all characters found after a guess", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first, second, third] = scene.characters;
    if (!first || !second || !third) throw new Error("Test setup failed.");
    await prisma.foundCharacter.createMany({
      data: [
        { gameSessionId: gameSession.id, characterId: first.id },
        { gameSessionId: gameSession.id, characterId: second.id },
      ],
    });
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: third.id, x: 0.55, y: 0.55 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      correct: true,
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

  it("returns 409 if character already found", async () => {
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

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: first.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CHARACTER_ALREADY_FOUND", message: "Character already found." },
    });
  });

  it("returns 409 if game already finished", async () => {
    const scene = await createTestScene();
    const gameSession = await prisma.gameSession.create({
      data: {
        finishedAt: new Date(),
        sceneId: scene.id,
      },
    });
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: first.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "GAME_ALREADY_FINISHED", message: "Game already finished." },
    });
  });

  it("returns 400 for a click out of range", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", gameSession.id)
      .send({ characterId: first.id, x: 1.5, y: 1.5 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: "INVALID_REQUEST_BODY", message: "x must be between 0 and 1." },
    });
  });

  it("returns 401 if no header sent", async () => {
    const scene = await createTestScene();
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .send({ characterId: first.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: "MISSING_SESSION", message: "X-Game-Session header is required." },
    });
  });

  it("returns 404 if session doesn't exist", async () => {
    const scene = await createTestScene();
    const [first] = scene.characters;
    if (!first) throw new Error("Test setup failed.");
    const app = createApp(prisma);

    const res = await request(app)
      .post("/guesses")
      .set("X-Game-Session", "01936c7a-0000-7000-8000-000000000000")
      .send({ characterId: first.id, x: 0.15, y: 0.15 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "SESSION_NOT_FOUND", message: "Session not found." },
    });
  });
});

describe("PATCH /games/current/score", () => {
  it("returns playerName if submitted after a finished game", async () => {
    const scene = await createTestScene();
    const finishedSession = await createFinishedSession(scene.id, 60000);
    await createFinishedSession(scene.id, 30000, "Thomas");
    await createFinishedSession(scene.id, 90000, "Lam");
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", finishedSession.id)
      .send({ playerName: "Richard" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ playerName: "Richard", durationMs: 60000, rank: 2 });
  });

  it("returns Anonymous if blank name submitted after a finished game", async () => {
    const scene = await createTestScene();
    const finishedSession = await createFinishedSession(scene.id, 60000);
    await createFinishedSession(scene.id, 30000, "Thomas");
    await createFinishedSession(scene.id, 90000, "Lam");
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", finishedSession.id)
      .send({ playerName: "" });

    const data = await prisma.gameSession.findUnique({
      where: { id: finishedSession.id },
      select: { playerName: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ playerName: "Anonymous", durationMs: 60000, rank: 2 });
    expect(data?.playerName).toBe("Anonymous");
  });

  it("returns Anonymous if white space submitted after a finished game", async () => {
    const scene = await createTestScene();
    const finishedSession = await createFinishedSession(scene.id, 60000);
    await createFinishedSession(scene.id, 30000, "Thomas");
    await createFinishedSession(scene.id, 90000, "Lam");
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", finishedSession.id)
      .send({ playerName: "   " });

    const data = await prisma.gameSession.findUnique({
      where: { id: finishedSession.id },
      select: { playerName: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ playerName: "Anonymous", durationMs: 60000, rank: 2 });
    expect(data?.playerName).toBe("Anonymous");
  });

  it("returns 409 if game not finished", async () => {
    const scene = await createTestScene();
    const gameSession = await createTestGameSession(scene.id);
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", gameSession.id)
      .send({ playerName: "Richard" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "GAME_NOT_FINISHED", message: "Game not finished." },
    });
  });

  it("returns 409 if name already submitted", async () => {
    const scene = await createTestScene();
    const finishedSession = await createFinishedSession(scene.id, 60000, "Richard");
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", finishedSession.id)
      .send({ playerName: "Richard" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "NAME_ALREADY_SUBMITTED", message: "Name already submitted." },
    });
  });

  it("returns 400 if playerName too long", async () => {
    const scene = await createTestScene();
    const finishedSession = await createFinishedSession(scene.id, 60000);
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", finishedSession.id)
      .send({ playerName: "a".repeat(31) });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "playerName must be 30 characters or fewer.",
      },
    });
  });

  it("returns 401 if no header sent", async () => {
    const app = createApp(prisma);

    const res = await request(app).patch("/games/current/score").send({ playerName: "Richard" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: "MISSING_SESSION", message: "X-Game-Session header is required." },
    });
  });

  it("returns 404 if session doesn't exist", async () => {
    const app = createApp(prisma);

    const res = await request(app)
      .patch("/games/current/score")
      .set("X-Game-Session", "01936c7a-0000-7000-8000-000000000000")
      .send({ playerName: "Richard" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "SESSION_NOT_FOUND", message: "Session not found." },
    });
  });
});
