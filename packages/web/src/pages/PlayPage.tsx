import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { fetchScene } from "../lib/api/scenes.js";
import { useGameSession } from "../hooks/useGameSession.js";
import { useElapsedTime } from "../hooks/useElapsedTime.js";
import { useTransientFlag } from "../hooks/useTransientFlag.js";
import { markScoreSkipped, wasScoreSkipped } from "../lib/session.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import { formatDuration } from "../lib/format.js";
import CharacterPanel from "../components/CharacterPanel.js";
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
    submitGuess,
    isSubmittingGuess,
    lastGuess,
    lastGuessCorrect,
    submitScore,
    isSubmittingScore,
    scoreResult,
    scoreError,
    resetGame,
  } = useGameSession(slug);

  const elapsed = useElapsedTime(gameState?.startedAt, !!gameState && !gameState.isComplete);

  const showWrongToast = useTransientFlag(lastGuessCorrect === false ? lastGuess : undefined);

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
  const menuOnLeft = target !== null && target.x > 0.75;
  const menuAbove = target !== null && target.y * (scene.width / scene.height) > 0.75;
  const menuTransform = `translate(${menuOnLeft ? "calc(-100% - 32px)" : "32px"}, ${menuAbove ? "calc(-100% + 32px)" : "-50%"})`;

  const foundCharacterIds = new Set(gameState?.foundCharacters.map((character) => character.id));
  const remainingCharacters = scene.characters.filter(
    (character) => !foundCharacterIds.has(character.id),
  );

  return (
    <section>
      <div className={styles.bar}>
        <CharacterPanel characters={scene.characters} foundIds={foundCharacterIds} />
        <div className={styles.barRight}>
          {gameState && <span>{formatDuration(duration)}</span>}
          <p className={styles.foundCounter}>
            {foundCharacterIds.size} / {scene.characters.length}
          </p>
          <Link to={`/scenes/${slug}/leaderboard`}>Leaderboard</Link>
        </div>
      </div>

      <h1>{scene.name}</h1>
      {!sessionId && (
        <button onClick={startGame} disabled={isStartingGame}>
          Start
        </button>
      )}

      {showWrongToast && <p className={styles.toast}>Not quite.</p>}
      {gameState && !isComplete && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to start over?")) {
              setTarget(null);
              resetGame();
            }
          }}
        >
          Start over
        </button>
      )}
      {isComplete && (
        <div className={styles.results}>
          <h2>You found everyone!</h2>
          <p>Your time: {formatDuration(duration)}</p>
          {submittedName && <p>Submitted as {submittedName}.</p>}
          <div className={styles.resultsButtons}>
            {!submittedName && (
              <button onClick={() => dialogRef.current?.showModal()}>Submit your score</button>
            )}
            <button
              onClick={() => {
                if (submittedName || confirm("Play again? Your score won't be saved.")) {
                  setTarget(null);
                  resetGame();
                }
              }}
            >
              Play again
            </button>
            <Link to="/">All scenes</Link>
          </div>
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
            <div
              className={styles.characterMenu}
              style={{ ...targetPosition, transform: menuTransform }}
            >
              <ul>
                {remainingCharacters.map((character) => (
                  <li key={character.id}>
                    <button onClick={() => handleGuess(character.id)} disabled={isSubmittingGuess}>
                      {character.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={handleClose} className={styles.closeButton}>
                Close
              </button>
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
          <div className={styles.dialogActions}>
            <button type="submit" disabled={isSubmittingScore} className={styles.primaryButton}>
              {isSubmittingScore ? "Submitting" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => {
                markScoreSkipped(slug);
                dialogRef.current?.close();
              }}
            >
              Skip
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
};

export default PlayPage;
