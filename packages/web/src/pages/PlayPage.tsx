import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useState } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { useGameSession } from "../hooks/useGameSession.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import type { MouseEvent } from "react";
import styles from "./PlayPage.module.css";

const PlayPage = () => {
  const { slug } = useParams();
  if (!slug) throw new Error("PlayPage rendered without a slug param.");

  const {
    data: scene,
    isPending: isLoadingScene,
    error: sceneError,
  } = useQuery({ queryKey: ["scenes", slug], queryFn: () => fetchScene(slug) });

  const {
    sessionId,
    gameState,
    startGame,
    isStartingGame,
    isResumingGame,
    submitGuess,
    isSubmittingGuess,
    lastGuessCorrect,
  } = useGameSession(slug);

  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  const handleImageClick = (e: MouseEvent<HTMLImageElement>) => {
    if (!sessionId || gameState?.isComplete) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.width;
    if (import.meta.env.DEV) console.log({ x, y });
    setTarget({ x, y });
  };

  const handleGuess = (characterId: number) => {
    if (!target) return;
    submitGuess({ characterId, x: target.x, y: target.y });
    setTarget(null);
  };

  const handleClose = () => {
    setTarget(null);
  };

  if (isLoadingScene) return <p>Loading scene...</p>;
  if (sceneError) return <p>Couldn't load scene: {sceneError.message}</p>;

  const targetPosition = target
    ? {
        left: `${target.x * 100}%`,
        top: `${((target.y * scene.width) / scene.height) * 100}%`,
      }
    : undefined;

  const foundCharactersIds = new Set(gameState?.foundCharacters.map((character) => character.id));
  const remainingCharacters = scene.characters.filter(
    (character) => !foundCharactersIds.has(character.id),
  );

  return (
    <section>
      <h1>{scene.name}</h1>
      {!sessionId && (
        <button onClick={startGame} disabled={isStartingGame}>
          Start
        </button>
      )}
      {isResumingGame && <p>Resuming game...</p>}
      {lastGuessCorrect === false && <p>Not quite.</p>}
      <div className={styles.imageContainer}>
        <img
          onClick={handleImageClick}
          src={cloudinaryUrl(scene.publicId, { width: 2000 })}
          alt={scene.name}
          style={{ aspectRatio: `${scene.width} / ${scene.height}`, width: "100%" }}
        />
        {gameState?.foundCharacters.map((character) => (
          <div
            key={character.id}
            className={styles.marker}
            style={{
              left: `${character.xMin * 100}%`,
              top: `${((character.yMin * scene.width) / scene.height) * 100}%`,
              width: `${(character.xMax - character.xMin) * 100}%`,
              height: `${(((character.yMax - character.yMin) * scene.width) / scene.height) * 100}%`,
            }}
          />
        ))}
        {target && (
          <>
            <div className={styles.targetingBox} style={targetPosition} />
            <div className={styles.characterMenu} style={targetPosition}>
              <ul>
                {remainingCharacters.map((character) => (
                  <li key={character.id}>
                    <button onClick={() => handleGuess(character.id)} disabled={isSubmittingGuess}>
                      {character.name}
                    </button>
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
