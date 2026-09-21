import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchScenes } from "../lib/api/scenes.js";

const ScenesPage = () => {
  const {
    data: scenes,
    isPending,
    error,
  } = useQuery({ queryKey: ["scenes"], queryFn: fetchScenes });

  if (isPending) return <p>Loading scenes...</p>;
  if (error) return <p>Couldn't load scenes: {error.message}</p>;

  return (
    <section>
      <h1>Choose a scene</h1>
      {scenes.length === 0 ? (
        <p>No scenes yet.</p>
      ) : (
        <ul>
          {scenes.map((scene) => (
            <li key={scene.id}>
              <h2>
                <Link to={`/scenes/${scene.slug}`}>{scene.name}</Link>
              </h2>
              <p>
                {scene.characterCount === 1
                  ? "1 character to find"
                  : `${scene.characterCount} characters to find`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ScenesPage;
