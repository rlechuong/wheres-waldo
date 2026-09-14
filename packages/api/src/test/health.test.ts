import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "./setup.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = createApp(prisma);

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Unknown Route", () => {
  it("returns 404", async () => {
    const app = createApp(prisma);

    const res = await request(app).get("/nonsense");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Route not found." } });
  });
});
