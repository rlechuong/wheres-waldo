import type { Leaderboard } from "@wheres-waldo/shared";

const toLeaderboard = (
  scene: { name: string; slug: string },
  rows: { playerName: string; durationMs: number }[],
): Leaderboard => ({
  sceneName: scene.name,
  sceneSlug: scene.slug,
  entries: rows.map((row, index) => ({
    rank: index + 1,
    playerName: row.playerName,
    durationMs: row.durationMs,
  })),
});

export { toLeaderboard };
