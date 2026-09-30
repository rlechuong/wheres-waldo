import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "./setup.js";
import { createTestScene, createTestGameSession, createFinishedSession } from "./helpers.js";
import type { Leaderboard } from "@wheres-waldo/shared";

describe("GET /scenes/:slug/leaderboard", () => {
  it("orders by fastest games", async () => {
    const scene = await createTestScene();
    await createFinishedSession(scene.id, 90000, "Lam");
    await createFinishedSession(scene.id, 60000, "Thomas");
    await createFinishedSession(scene.id, 30000, "Richard");
    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sceneName: scene.name,
      sceneSlug: scene.slug,
      entries: [
        { rank: 1, playerName: "Richard", durationMs: 30000 },
        { rank: 2, playerName: "Thomas", durationMs: 60000 },
        { rank: 3, playerName: "Lam", durationMs: 90000 },
      ],
    });
  });

  it("excludes unnamed games", async () => {
    const scene = await createTestScene();
    await createFinishedSession(scene.id, 15000);
    await createFinishedSession(scene.id, 90000, "Lam");
    await createFinishedSession(scene.id, 60000, "Thomas");
    await createFinishedSession(scene.id, 30000, "Richard");
    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sceneName: scene.name,
      sceneSlug: scene.slug,
      entries: [
        { rank: 1, playerName: "Richard", durationMs: 30000 },
        { rank: 2, playerName: "Thomas", durationMs: 60000 },
        { rank: 3, playerName: "Lam", durationMs: 90000 },
      ],
    });
  });

  it("excludes unfinished games", async () => {
    const scene = await createTestScene();
    await createTestGameSession(scene.id);
    await createFinishedSession(scene.id, 90000, "Lam");
    await createFinishedSession(scene.id, 60000, "Thomas");
    await createFinishedSession(scene.id, 30000, "Richard");
    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sceneName: scene.name,
      sceneSlug: scene.slug,
      entries: [
        { rank: 1, playerName: "Richard", durationMs: 30000 },
        { rank: 2, playerName: "Thomas", durationMs: 60000 },
        { rank: 3, playerName: "Lam", durationMs: 90000 },
      ],
    });
  });

  it("filters by scene", async () => {
    const scene = await createTestScene();
    const scene2 = await createTestScene("second-scene");
    await createFinishedSession(scene.id, 90000, "Lam");
    await createFinishedSession(scene.id, 60000, "Thomas");
    await createFinishedSession(scene.id, 30000, "Richard");
    await createFinishedSession(scene2.id, 90000, "Kalon");
    await createFinishedSession(scene2.id, 60000, "John");
    await createFinishedSession(scene2.id, 30000, "Xavier");
    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sceneName: scene.name,
      sceneSlug: scene.slug,
      entries: [
        { rank: 1, playerName: "Richard", durationMs: 30000 },
        { rank: 2, playerName: "Thomas", durationMs: 60000 },
        { rank: 3, playerName: "Lam", durationMs: 90000 },
      ],
    });
  });

  it("returns empty entries array if no completed games", async () => {
    const scene = await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      sceneName: scene.name,
      sceneSlug: scene.slug,
      entries: [],
    });
  });

  it("returns 404 for an unknown slug", async () => {
    await createTestScene();
    const app = createApp(prisma);

    const res = await request(app).get("/scenes/unknown-slug/leaderboard");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "SCENE_NOT_FOUND", message: "Scene not found." } });
  });

  it("returns at most 20 entries, keeping the fastest", async () => {
    const scene = await createTestScene();

    for (let i = 1; i <= 21; i++) {
      await createFinishedSession(scene.id, i * 1000, `Player ${i}`);
    }

    const app = createApp(prisma);

    const res = await request(app).get(`/scenes/${scene.slug}/leaderboard`);
    const body = res.body as Leaderboard;

    expect(res.status).toBe(200);
    expect(body.entries).toHaveLength(20);
    expect(body.entries[0]?.playerName).toBe("Player 1");
    expect(body.entries[19]?.playerName).toBe("Player 20");
    expect(body.entries.some((entry) => entry.playerName === "Player 21")).toBe(false);
  });
});
