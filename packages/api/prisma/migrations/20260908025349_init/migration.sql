-- CreateTable
CREATE TABLE "Scene" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ (3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ (3) NOT NULL,
    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnailPublicId" TEXT NOT NULL,
    "xMin" DOUBLE PRECISION NOT NULL,
    "xMax" DOUBLE PRECISION NOT NULL,
    "yMin" DOUBLE PRECISION NOT NULL,
    "yMax" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ (3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ (3) NOT NULL,
    "sceneId" INTEGER NOT NULL,
    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "playerName" TEXT,
    "startedAt" TIMESTAMPTZ (3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ (3),
    "sceneId" INTEGER NOT NULL,
    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundCharacter" (
    "gameSessionId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "foundAt" TIMESTAMPTZ (3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoundCharacter_pkey" PRIMARY KEY ("gameSessionId", "characterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scene_slug_key" ON "Scene" ("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_publicId_key" ON "Scene" ("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_sceneId_name_key" ON "Character" ("sceneId", "name");

-- CreateIndex
CREATE INDEX "GameSession_sceneId_idx" ON "GameSession" ("sceneId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundCharacter" ADD CONSTRAINT "FoundCharacter_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoundCharacter" ADD CONSTRAINT "FoundCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Character hitboxes must be normalized fractions with correct ordering
ALTER TABLE "Character" ADD CONSTRAINT "Character_coordinates_valid" CHECK (
    "xMin" >= 0
    AND "xMax" <= 1
    AND "xMin" < "xMax"
    AND "yMin" >= 0
    AND "yMax" <= 1
    AND "yMin" < "yMax"
);

-- A player name is only meaningful on a finished game
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_name_requires_finish" CHECK (
    "playerName" IS NULL
    OR "finishedAt" IS NOT NULL
);

-- Leaderboard queries only ever touch named, finished games
CREATE INDEX "GameSession_leaderboard_idx" ON "GameSession" ("sceneId", "finishedAt")
WHERE
    "playerName" IS NOT NULL;