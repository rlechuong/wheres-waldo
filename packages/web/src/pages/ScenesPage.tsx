import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchScenes } from "../lib/api/scenes.js";
import { cloudinaryUrl } from "../lib/cloudinary.js";
import PageMessage from "../components/PageMessage.js";
import styles from "./ScenesPage.module.css";

const ScenesPage = () => {
  const {
    data: scenes,
    isPending,
    error,
  } = useQuery({ queryKey: ["scenes"], queryFn: fetchScenes });

  if (isPending) return <PageMessage>Loading scenes...</PageMessage>;
  if (error) return <PageMessage>Couldn't load scenes: {error.message}</PageMessage>;

  return (
    <section className={styles.scenePage}>
      <h1>Choose a scene</h1>
      {scenes.length === 0 ? (
        <p>No scenes yet.</p>
      ) : (
        <ul className={styles.scenesList}>
          {scenes.map((scene) => (
            <li key={scene.id} className={styles.scenesItem}>
              <Link to={`/scenes/${scene.slug}`} className={styles.sceneLink}>
                <img
                  className={styles.thumbnail}
                  src={cloudinaryUrl(scene.publicId, { width: 400 })}
                  alt=""
                  loading="lazy"
                />
                <div className={styles.cardBody}>
                  <h2>{scene.name}</h2>
                  <p>
                    {scene.characterCount === 1
                      ? "1 character to find"
                      : `${scene.characterCount} characters to find`}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ScenesPage;
