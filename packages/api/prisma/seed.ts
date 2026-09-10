import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma.js";

const prisma = createPrismaClient();

const main = async () => {
  try {
    await prisma.foundCharacter.deleteMany();
    await prisma.gameSession.deleteMany();
    await prisma.character.deleteMany();
    await prisma.scene.deleteMany();

    const scene = await prisma.scene.create({
      data: {
        name: "Netherlandish Proverbs",
        slug: "netherlandish-proverbs",
        publicId: "wheres-waldo/scenes/netherlandish-proverbs",
        width: 3000,
        height: 2124,
        characters: {
          create: [
            {
              name: "Basket Carrier",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/basket-carrier",
              xMin: 1106 / 3000,
              xMax: 1322 / 3000,
              yMin: 1192 / 3000,
              yMax: 1484 / 3000,
            },
            {
              name: "Crossbowman",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/crossbowman",
              xMin: 1000 / 3000,
              xMax: 1178 / 3000,
              yMin: 394 / 3000,
              yMax: 538 / 3000,
            },
            {
              name: "Head Banger",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/head-banger",
              xMin: 388 / 3000,
              xMax: 634 / 3000,
              yMin: 1626 / 3000,
              yMax: 1982 / 3000,
            },
            {
              name: "Man In Basket",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/man-in-basket",
              xMin: 2748 / 3000,
              xMax: 2982 / 3000,
              yMin: 1098 / 3000,
              yMax: 1354 / 3000,
            },
            {
              name: "Man With Fan",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/man-with-fan",
              xMin: 2286 / 3000,
              xMax: 2470 / 3000,
              yMin: 758 / 3000,
              yMax: 1032 / 3000,
            },
            {
              name: "Shoveler",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/shoveler",
              xMin: 1456 / 3000,
              xMax: 1716 / 3000,
              yMin: 1674 / 3000,
              yMax: 2022 / 3000,
            },
          ],
        },
      },
      include: {
        characters: true,
      },
    });
    console.log(`Seeded ${scene.name} with ${scene.characters.length} characters.`);
  } catch (err) {
    console.error("Seeding Failed: ", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

await main();
