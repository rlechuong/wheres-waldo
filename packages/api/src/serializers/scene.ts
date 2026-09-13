import type { SceneSummary, SceneDetail, CharacterOption } from "@wheres-waldo/shared";

const toSceneSummary = (scene: {
  id: number;
  name: string;
  slug: string;
  publicId: string;
  _count: { characters: number };
}): SceneSummary => ({
  id: scene.id,
  name: scene.name,
  slug: scene.slug,
  publicId: scene.publicId,
  characterCount: scene._count.characters,
});

const toSceneDetail = (scene: {
  id: number;
  name: string;
  slug: string;
  publicId: string;
  width: number;
  height: number;
  characters: CharacterOption[];
}): SceneDetail => ({
  id: scene.id,
  name: scene.name,
  slug: scene.slug,
  publicId: scene.publicId,
  width: scene.width,
  height: scene.height,
  characters: scene.characters,
});

export { toSceneSummary, toSceneDetail };
