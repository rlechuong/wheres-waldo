import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchScenes } from "../lib/api/scenes.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import styles from "./ScenesPage.module.css";

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
              <Link to={`/scenes/${scene.slug}`}>
                <img
                  className={styles.thumbnail}
                  src={cloudinaryUrl(scene.publicId, { width: 400 })}
                  alt=""
                  loading="lazy"
                />
                <h2>{scene.name}</h2>
              </Link>
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
