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
  // Escape must dismiss overlays even when a settings field has focus.
  if (event.key === 'Escape') return 'escape';

  if (
    target?.tagName === 'INPUT' ||
    target?.tagName === 'TEXTAREA' ||
    target?.tagName === 'SELECT'
  ) {
    return null;
  }
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

/**
 * X-axis span for the evaluation graph.
 * Early games spread across the chart instead of sitting in the first few pixels of a 0–60 scale.
 */
export function evaluationGraphMaxMove(moves: number[]): number {
  const last = moves.length > 0 ? Math.max(...moves) : 0;
  return Math.max(8, last);
}

/**
 * Nearest recorded move for a click inside the plot.
 * clickX is in the same coordinate space as plotLeft and plotWidth.
 */
export function nearestEvaluationMove(
  moves: number[],
  clickX: number,
  plotLeft: number,
  plotWidth: number,
  maxMove: number
): number | null {
  const first = moves[0];
  if (first === undefined || plotWidth <= 0 || maxMove <= 0) return null;
  const rawMove = ((clickX - plotLeft) / plotWidth) * maxMove;
  let best = first;
  let bestDist = Math.abs(best - rawMove);
  for (const move of moves) {
    const dist = Math.abs(move - rawMove);
    if (dist < bestDist) {
      best = move;
      bestDist = dist;
    }
  }
  return best;
}

/** How many undo/redo steps reach a graph point from the current ply. */
export function movesToReachGraphIndex(
  currentMove: number,
  targetMove: number
): { undo: number; redo: number } {
  if (targetMove < currentMove) return { undo: currentMove - targetMove, redo: 0 };
  if (targetMove > currentMove) return { undo: 0, redo: targetMove - currentMove };
  return { undo: 0, redo: 0 };
}
