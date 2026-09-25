import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { useGameSession } from "../hooks/useGameSession.js";
import { useElapsedTime } from "../hooks/useElapsedTime.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import { formatDuration } from "../lib/format.js";
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
    submitScore,
    isSubmittingScore,
    scoreResult,
    scoreError,
  } = useGameSession(slug);

  const elapsed = useElapsedTime(gameState?.startedAt, !!gameState && !gameState.isComplete);

  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [playerName, setPlayerName] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const isComplete = gameState?.isComplete ?? false;

  useEffect(() => {
    if (isComplete) dialogRef.current?.showModal();
  }, [isComplete]);

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
      {!!gameState && <span>{formatDuration(elapsed)}</span>}
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
      <dialog ref={dialogRef} className={styles.winDialog}>
        <h2>You found everyone!</h2>
        {isSubmittingScore && <p>Submitting Score...</p>}
        {scoreResult ? (
          <div>
            <p>Submitted Name: {scoreResult.playerName}</p>
            <p>Submitted Time: {formatDuration(scoreResult.durationMs)}</p>
            <p>Rank: {scoreResult.rank}</p>
            <p>
              <Link to={`/scenes/${slug}/leaderboard`}>Leaderboard</Link>
            </p>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
        ) : (
          <div>
            <p>Final Time: {formatDuration(elapsed)}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitScore(playerName);
              }}
            >
              <label htmlFor="playerName">Name</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              {scoreError && <p>{scoreError.message}</p>}
              <button type="submit">Submit</button>
            </form>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Skip
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
};

export default PlayPage;
