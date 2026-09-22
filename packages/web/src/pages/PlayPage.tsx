import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useState } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import type { MouseEvent } from "react";
import styles from "./PlayPage.module.css";

const PlayPage = () => {
  const { slug } = useParams();
  if (!slug) throw new Error("PlayPage rendered without a slug param.");

  const {
    data: scene,
    isPending,
    error,
  } = useQuery({ queryKey: ["scenes", slug], queryFn: () => fetchScene(slug) });

  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.width;
    if (import.meta.env.DEV) console.log({ x, y });
    setTarget({ x, y });
  };

  const handleGuess = (characterId: number) => {
    if (!target) return;
    console.log({ characterId, x: target.x, y: target.y });
    setTarget(null);
  };

  const handleClose = () => {
    setTarget(null);
  };

  if (isPending) return <p>Loading scene...</p>;
  if (error) return <p>Couldn't load scene: {error.message}</p>;

  const targetStyle = target
    ? {
        left: `${target.x * 100}%`,
        top: `${((target.y * scene.width) / scene.height) * 100}%`,
      }
    : undefined;

  return (
    <section>
      <h1>{scene.name}</h1>
      <div className={styles.imageContainer}>
        <img
          onClick={handleClick}
          src={cloudinaryUrl(scene.publicId, { width: 2000 })}
          alt={scene.name}
          style={{ aspectRatio: `${scene.width} / ${scene.height}`, width: "100%" }}
        />
        {target && (
          <>
            <div className={styles.targetingBox} style={targetStyle} />
            <div className={styles.characterMenu} style={targetStyle}>
              <ul>
                {scene.characters.map((character) => (
                  <li key={character.id}>
                    <button onClick={() => handleGuess(character.id)}>{character.name}</button>
                  </li>
                ))}
              </ul>
              <button onClick={handleClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PlayPage;
