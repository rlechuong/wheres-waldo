import dotenv from "dotenv";
import path from "node:path";
import { beforeEach, afterAll } from "vitest";
import { createPrismaClient } from "../lib/prisma.js";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../.env.test"),
  override: true,
  quiet: true,
});

const url = process.env.DATABASE_URL;
if (!url?.includes("_test")) {
  throw new Error(`Refusing to run tests against non-test database: ${url}`);
}

const prisma = createPrismaClient();

beforeEach(async () => {
  await prisma.foundCharacter.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.character.deleteMany();
  await prisma.scene.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
