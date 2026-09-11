import type { SceneSummary } from "@wheres-waldo/shared";

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

export { toSceneSummary };
