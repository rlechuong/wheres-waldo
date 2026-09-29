import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { useGameSession } from "../hooks/useGameSession.js";
import { useElapsedTime } from "../hooks/useElapsedTime.js";
import { markScoreSkipped, wasScoreSkipped } from "../lib/session.js";
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

  const isComplete = gameState?.isComplete ?? false;
  const duration =
    gameState?.finishedAt && gameState.startedAt
      ? new Date(gameState.finishedAt).getTime() - new Date(gameState.startedAt).getTime()
      : elapsed;
  const submittedName = scoreResult?.playerName ?? gameState?.playerName ?? null;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isComplete && !submittedName && !wasScoreSkipped(slug)) dialogRef.current?.showModal();
  }, [isComplete, submittedName, slug]);

  useEffect(() => {
    if (scoreResult) dialogRef.current?.close();
  }, [scoreResult]);

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
      {isSubmittingScore && <p>Submitting Score...</p>}
      {lastGuessCorrect === false && <p>Not quite.</p>}
      {!!gameState && !isComplete && <span>{formatDuration(duration)}</span>}
      {isComplete && (
        <div className={styles.results}>
          <h2>You found everyone!</h2>
          <p>Your time: {formatDuration(duration)}</p>
          {submittedName ? (
            <p>Submitted as {submittedName}.</p>
          ) : (
            <button onClick={() => dialogRef.current?.showModal()}>Submit your score</button>
          )}
          <Link to={`/scenes/${slug}/leaderboard`}>Leaderboard</Link>
          <Link to="/">All scenes</Link>
        </div>
      )}
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
        <p>Your time: {formatDuration(duration)}</p>

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
          <button type="submit" disabled={isSubmittingScore}>
            {isSubmittingScore ? "Submitting" : "Submit"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            markScoreSkipped(slug);
            dialogRef.current?.close();
          }}
        >
          Skip
        </button>
      </dialog>
    </section>
  );
};

export default PlayPage;
