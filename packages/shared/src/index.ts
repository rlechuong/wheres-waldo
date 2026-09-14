export type CharacterOption = {
  id: number;
  name: string;
  thumbnailPublicId: string;
};

export type SceneSummary = {
  id: number;
  name: string;
  slug: string;
  publicId: string;
  characterCount: number;
};

export type SceneDetail = {
  id: number;
  name: string;
  slug: string;
  publicId: string;
  width: number;
  height: number;
  characters: CharacterOption[];
};

export type CreateGameResponse = {
  sessionId: string;
  startedAt: string;
};

export type FoundCharacter = {
  id: number;
  name: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type GameState = {
  sessionId: string;
  sceneSlug: string;
  startedAt: string;
  foundCharacters: FoundCharacter[];
  isComplete: boolean;
};
