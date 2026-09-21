import { apiFetch } from "../api.js";
import type { SceneSummary, SceneDetail } from "@wheres-waldo/shared";

const fetchScenes = () => apiFetch<SceneSummary[]>("/scenes");

const fetchScene = (slug: string) => apiFetch<SceneDetail>(`/scenes/${encodeURIComponent(slug)}`);

export { fetchScenes, fetchScene };
