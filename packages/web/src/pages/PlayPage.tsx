import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
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

  if (isPending) return <p>Loading scene...</p>;
  if (error) return <p>Couldn't load scene: {error.message}</p>;

  return (
    <section>
      <h1>{scene.name}</h1>
      <img
        src={cloudinaryUrl(scene.publicId, { width: 2000 })}
        alt={scene.name}
        style={{ aspectRatio: `${scene.width} / ${scene.height}`, width: "100%" }}
      />
    </section>
  );
};

export default PlayPage;
