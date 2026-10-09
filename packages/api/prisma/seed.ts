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

    const scene2 = await prisma.scene.create({
      data: {
        name: "Children's Games",
        slug: "childrens-games",
        publicId: "wheres-waldo/scenes/childrens-games",
        width: 3000,
        height: 2179,
        characters: {
          create: [
            {
              name: "Barrel Rider",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/barrel-rider",
              xMin: 0.642,
              xMax: 0.713,
              yMin: 0.532,
              yMax: 0.6167,
            },
            {
              name: "Hoop Roller",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/hoop-roller",
              xMin: 0.5007,
              xMax: 0.5837,
              yMin: 0.6023,
              yMax: 0.7,
            },
            {
              name: "Stilt Walker",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/stilt-walker",
              xMin: 0.6523,
              xMax: 0.6853,
              yMin: 0.205,
              yMax: 0.325,
            },
            {
              name: "Masked Face",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/masked-face",
              xMin: 0.0,
              xMax: 0.028,
              yMin: 0.273,
              yMax: 0.3017,
            },
            {
              name: "Golden Cloak",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/golden-cloak",
              xMin: 0.1657,
              xMax: 0.2093,
              yMin: 0.595,
              yMax: 0.6897,
            },
            {
              name: "Fence Riders",
              thumbnailPublicId: "wheres-waldo/characters/childrens-games/fence-riders",
              xMin: 0.338,
              xMax: 0.409,
              yMin: 0.2963,
              yMax: 0.3673,
            },
          ],
        },
      },
      include: {
        characters: true,
      },
    });
    console.log(`Seeded ${scene2.name} with ${scene2.characters.length} characters.`);

    const scene3 = await prisma.scene.create({
      data: {
        name: "The Fight Between Carnival And Lent",
        slug: "the-fight-between-carnival-and-lent",
        publicId: "wheres-waldo/scenes/the-fight-between-carnival-and-lent",
        width: 3000,
        height: 2090,
        characters: {
          create: [
            {
              name: "Barrel Rider",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/barrel-rider",
              xMin: 0.3443,
              xMax: 0.4347,
              yMin: 0.4297,
              yMax: 0.5583,
            },
            {
              name: "Lent On Cart",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/lent-on-cart",
              xMin: 0.5943,
              xMax: 0.688,
              yMin: 0.4283,
              yMax: 0.6087,
            },
            {
              name: "Lute Player",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/lute-player",
              xMin: 0.1113,
              xMax: 0.1843,
              yMin: 0.478,
              yMax: 0.623,
            },
            {
              name: "Pretzel Woman",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/pretzel-woman",
              xMin: 0.7623,
              xMax: 0.815,
              yMin: 0.5383,
              yMax: 0.6263,
            },
            {
              name: "Window Sitter",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/window-sitter",
              xMin: 0.5383,
              xMax: 0.5613,
              yMin: 0.0643,
              yMax: 0.1017,
            },
            {
              name: "Fish Seller",
              thumbnailPublicId:
                "wheres-waldo/characters/the-fight-between-carnival-and-lent/fish-seller",
              xMin: 0.5253,
              xMax: 0.5703,
              yMin: 0.2913,
              yMax: 0.3407,
            },
          ],
        },
      },
      include: {
        characters: true,
      },
    });
    console.log(`Seeded ${scene3.name} with ${scene3.characters.length} characters.`);
  } catch (err) {
    console.error("Seeding Failed: ", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

await main();
