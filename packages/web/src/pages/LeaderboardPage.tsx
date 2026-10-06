import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../lib/api/scenes.js";
import { ApiError } from "../lib/api.js";
import { formatDuration } from "../lib/format.js";
import PageMessage from "../components/PageMessage.js";
import styles from "./LeaderboardPage.module.css";

const LeaderboardPage = () => {
  const { slug } = useParams();
  if (!slug) throw new Error("LeaderboardPage rendered without a slug param.");

  const {
    data: leaderboard,
    isPending,
    error,
  } = useQuery({
    queryKey: ["leaderboard", slug],
    queryFn: () => fetchLeaderboard(slug),
  });

  if (isPending) return <PageMessage>Loading leaderboard...</PageMessage>;
  if (error) {
    const notFound = error instanceof ApiError && error.code === "SCENE_NOT_FOUND";
    return notFound ? (
      <PageMessage>
        That scene does not exist. <Link to="/">Browse all scenes.</Link>
      </PageMessage>
    ) : (
      <PageMessage>Couldn't load leaderboard: {error.message}</PageMessage>
    );
  }

  return (
    <section className={styles.leaderboardPage}>
      <h1>Leaderboard</h1>
      <h2 className={styles.leaderboardPageScene}>{leaderboard.sceneName}</h2>

      {leaderboard.entries.length === 0 ? (
        <p>
          No scores yet. <Link to={`/scenes/${slug}`}>Be the first.</Link>
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th className={styles.timeColumn}>Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.entries.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.playerName}</td>
                <td className={styles.timeColumn}>{formatDuration(entry.durationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.navLinks}>
        <Link to={`/scenes/${slug}`} className="button-link">
          Back to scene
        </Link>
        <Link to="/" className="button-link">
          All scenes
        </Link>
      </div>
    </section>
  );
};

export default LeaderboardPage;
