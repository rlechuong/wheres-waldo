import { cloudinaryUrl } from "../lib/cloudinary.js";
import type { CharacterOption } from "@wheres-waldo/shared";
import styles from "./CharacterPanel.module.css";

type CharacterPanelProps = {
  characters: CharacterOption[];
  foundIds: Set<number>;
};

const CharacterPanel = ({ characters, foundIds }: CharacterPanelProps) => {
  return (
    <ul className={styles.list}>
      {characters.map((character) => {
        const found = foundIds.has(character.id);
        return (
          <li key={character.id} className={`${styles.item} ${found ? styles.found : ""}`}>
            <img src={cloudinaryUrl(character.thumbnailPublicId, { width: 64 })} alt="" />
            <p>{character.name}</p>
            {found && <span className="sr-only">(found)</span>}
          </li>
        );
      })}
    </ul>
  );
};

export default CharacterPanel;
