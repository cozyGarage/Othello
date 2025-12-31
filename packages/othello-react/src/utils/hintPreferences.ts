const HINTS_PER_GAME_KEY = 'othello:hintsPerGame';
const DEFAULT_HINTS_PER_GAME = 3;

/**
 * Load the preferred number of hints per game from localStorage.
 */
export const getHintsPerGame = (): number => {
  try {
    const raw = window.localStorage.getItem(HINTS_PER_GAME_KEY);
    if (!raw) return DEFAULT_HINTS_PER_GAME;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 20 ? parsed : DEFAULT_HINTS_PER_GAME;
  } catch {
    return DEFAULT_HINTS_PER_GAME;
  }
};

/**
 * Persist the preferred number of hints per game to localStorage.
 */
export const setHintsPerGame = (value: number): void => {
  try {
    const clamped = Math.max(0, Math.min(20, Math.round(value)));
    window.localStorage.setItem(HINTS_PER_GAME_KEY, String(clamped));
  } catch {
    // Ignore storage errors (private mode, etc.)
  }
};
