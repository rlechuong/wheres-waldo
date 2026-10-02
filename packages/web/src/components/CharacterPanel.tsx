import { cloudinaryUrl } from "../lib/cloudinary.js";
import type { CharacterOption } from "@wheres-waldo/shared";
import styles from "./CharacterPanel.module.css";

type CharacterPanelProps = {
  characters: CharacterOption[];
  foundIds: Set<number>;
};

const CharacterPanel = ({ characters, foundIds }: CharacterPanelProps) => {
  return (
    <div>
      <p>
        {foundIds.size} out of {characters.length} found
      </p>
      <ul>
        {characters.map((character) => (
          <li
            key={character.id}
            className={foundIds.has(character.id) ? styles.found : styles.remaining}
          >
            <img src={cloudinaryUrl(character.thumbnailPublicId, { width: 64 })} alt="" />
            <p>{character.name}</p>
            {foundIds.has(character.id) && <span className="sr-only">(found)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CharacterPanel;
