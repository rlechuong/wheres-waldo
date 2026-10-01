import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../lib/api/scenes.js";
import { ApiError } from "../lib/api.js";
import { formatDuration } from "../lib/format.js";

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

  if (isPending) return <p>Loading leaderboard...</p>;
  if (error) {
    const notFound = error instanceof ApiError && error.code === "SCENE_NOT_FOUND";
    return notFound ? (
      <p>
        That scene does not exist. <Link to="/">Browse all scenes.</Link>
      </p>
    ) : (
      <p>Couldn't load leaderboard: {error.message}</p>
    );
  }

  return (
    <section>
      <h1>{leaderboard.sceneName} Leaderboard</h1>

      {leaderboard.entries.length === 0 ? (
        <p>
          No scores yet. <Link to={`/scenes/${slug}`}>Be the first.</Link>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.entries.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.playerName}</td>
                <td>{formatDuration(entry.durationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to={`/scenes/${slug}`}>Back to scene</Link>
      <Link to="/">All scenes</Link>
    </section>
  );
};

export default LeaderboardPage;
