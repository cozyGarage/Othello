export type GameShortcutAction =
  'escape' | 'newGame' | 'openSettings' | 'undo' | 'redo' | 'help' | null;

/**
 * Map a keyboard event to a game shortcut action.
 * Returns null for ignored events (form fields / unmatched keys).
 */
export function resolveGameShortcut(event: {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  // Accept DOM EventTarget; we only read optional tagName
  target: unknown;
}): GameShortcutAction {
  const target = event.target as { tagName?: string } | null;
  if (
    target?.tagName === 'INPUT' ||
    target?.tagName === 'TEXTAREA' ||
    target?.tagName === 'SELECT'
  ) {
    return null;
  }

  if (event.key === 'Escape') return 'escape';
  if (event.key === 'n' || event.key === 'N') return 'newGame';
  if (event.key === 's' || event.key === 'S') return 'openSettings';
  if ((event.key === 'z' || event.key === 'Z') && !event.ctrlKey && !event.metaKey) return 'undo';
  if ((event.key === 'y' || event.key === 'Y') && !event.ctrlKey && !event.metaKey) return 'redo';
  if (event.key === '?' || (event.shiftKey && event.key === '/')) return 'help';
  return null;
}

/** Initial remaining hints for a new game (0 = unlimited). */
export function initialHintsRemaining(hintsPerGame: number): number {
  return hintsPerGame === 0 ? 999 : hintsPerGame;
}
