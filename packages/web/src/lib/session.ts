const key = (slug: string) => `waldo:session:${slug}`;

const loadSessionId = (slug: string): string | null => {
  try {
    return localStorage.getItem(key(slug));
  } catch {
    return null;
  }
};

const saveSessionId = (slug: string, id: string): void => {
  try {
    localStorage.setItem(key(slug), id);
  } catch {
    // Storage Unavailable - The game still works, but won't survive a refresh.
  }
};

const clearSessionId = (slug: string): void => {
  try {
    localStorage.removeItem(key(slug));
  } catch {
    // Storage Unavailable - Nothing to clear.
  }
};

export { loadSessionId, saveSessionId, clearSessionId };
