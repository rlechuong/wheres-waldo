import { apiFetch } from "../api.js";
import type { SceneSummary, SceneDetail, Leaderboard } from "@wheres-waldo/shared";

const fetchScenes = () => apiFetch<SceneSummary[]>("/scenes");

const fetchScene = (slug: string) => apiFetch<SceneDetail>(`/scenes/${encodeURIComponent(slug)}`);

const fetchLeaderboard = (slug: string) =>
  apiFetch<Leaderboard>(`/scenes/${encodeURIComponent(slug)}/leaderboard`);

export { fetchScenes, fetchScene, fetchLeaderboard };
