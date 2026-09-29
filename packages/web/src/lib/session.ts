const sessionKey = (slug: string) => `waldo:session:${slug}`;
const skipKey = (slug: string) => `waldo:skipped:${slug}`;

const loadSessionId = (slug: string): string | null => {
  try {
    return localStorage.getItem(sessionKey(slug));
  } catch {
    return null;
  }
};

const saveSessionId = (slug: string, id: string): void => {
  try {
    localStorage.setItem(sessionKey(slug), id);
  } catch {
    // Storage Unavailable - The game still works, but won't survive a refresh.
  }
};

const clearSessionId = (slug: string): void => {
  try {
    localStorage.removeItem(sessionKey(slug));
    localStorage.removeItem(skipKey(slug));
  } catch {
    // Storage Unavailable - Nothing to clear.
  }
};

const wasScoreSkipped = (slug: string): boolean => {
  try {
    return localStorage.getItem(skipKey(slug)) === "true";
  } catch {
    return false;
  }
};

const markScoreSkipped = (slug: string): void => {
  try {
    localStorage.setItem(skipKey(slug), "true");
  } catch {
    // Storage Unavailable - The dialog will reappear on refresh.
  }
};

export { loadSessionId, saveSessionId, clearSessionId, wasScoreSkipped, markScoreSkipped };
