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
              xMin: 0.3687,
              xMax: 0.4407,
              yMin: 0.3973,
              yMax: 0.4947,
            },
            {
              name: "Crossbowman",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/crossbowman",
              xMin: 0.3333,
              xMax: 0.3927,
              yMin: 0.1313,
              yMax: 0.1793,
            },
            {
              name: "Head Banger",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/head-banger",
              xMin: 0.1293,
              xMax: 0.2113,
              yMin: 0.5421,
              yMax: 0.6607,
            },
            {
              name: "Man In Basket",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/man-in-basket",
              xMin: 0.9151,
              xMax: 0.9941,
              yMin: 0.3665,
              yMax: 0.4515,
            },
            {
              name: "Man With Fan",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/man-with-fan",
              xMin: 0.7626,
              xMax: 0.8233,
              yMin: 0.2529,
              yMax: 0.3447,
            },
            {
              name: "Shoveler",
              thumbnailPublicId: "wheres-waldo/characters/netherlandish-proverbs/shoveler",
              xMin: 0.4853,
              xMax: 0.5743,
              yMin: 0.5572,
              yMax: 0.6747,
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
