import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import type { MouseEvent } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";

const PlayPage = () => {
  const { slug } = useParams();
  if (!slug) throw new Error("PlayPage rendered without a slug param.");

  const {
    data: scene,
    isPending,
    error,
  } = useQuery({ queryKey: ["scenes", slug], queryFn: () => fetchScene(slug) });

  const handleClick = (e: MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.width;
    if (import.meta.env.DEV) console.log({ x, y });
  };

  if (isPending) return <p>Loading scene...</p>;
  if (error) return <p>Couldn't load scene: {error.message}</p>;

  return (
    <section>
      <h1>{scene.name}</h1>
      <img
        onClick={handleClick}
        src={cloudinaryUrl(scene.publicId, { width: 2000 })}
        alt={scene.name}
        style={{ aspectRatio: `${scene.width} / ${scene.height}`, width: "100%" }}
      />
    </section>
  );
};

export default PlayPage;
