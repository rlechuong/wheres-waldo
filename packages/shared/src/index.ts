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
