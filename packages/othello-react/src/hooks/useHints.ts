import { useCallback, useEffect, useRef, useState } from 'react';
import { getHintsPerGame, setHintsPerGame as persistHintsPerGame } from '../utils/hintPreferences';
import { initialHintsRemaining } from '../utils/gameChromeHelpers';
import type { Coordinate } from 'othello-engine';

/**
 * Hint budget + transient hint highlight for the current game.
 */
export function useHints() {
  const [hintsPerGame, setHintsPerGameState] = useState(getHintsPerGame);
  const [hintsRemaining, setHintsRemaining] = useState(() =>
    initialHintsRemaining(getHintsPerGame())
  );
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [hintMove, setHintMove] = useState<Coordinate | null>(null);
  const clearHintTimeoutRef = useRef<number | null>(null);

  const clearHintTimeout = useCallback(() => {
    if (clearHintTimeoutRef.current !== null) {
      clearTimeout(clearHintTimeoutRef.current);
      clearHintTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearHintTimeout(), [clearHintTimeout]);

  const resetHintsForNewGame = useCallback(() => {
    clearHintTimeout();
    setHintMove(null);
    setHintsEnabled(false);
    setHintsRemaining(initialHintsRemaining(hintsPerGame));
  }, [hintsPerGame, clearHintTimeout]);

  const requestHint = useCallback(
    (gameOver: boolean) => {
      if (hintsRemaining <= 0 || gameOver) return;
      clearHintTimeout();
      setHintsEnabled(true);
      setHintsRemaining((prev) => prev - 1);
      clearHintTimeoutRef.current = window.setTimeout(() => {
        clearHintTimeoutRef.current = null;
        setHintsEnabled(false);
        setHintMove(null);
      }, 5000);
    },
    [hintsRemaining, clearHintTimeout]
  );

  const setHintsPerGame = useCallback((count: number) => {
    persistHintsPerGame(count);
    setHintsPerGameState(count);
    setHintsRemaining(initialHintsRemaining(count));
  }, []);

  return {
    hintsPerGame,
    hintsRemaining,
    hintsEnabled,
    hintMove,
    setHintMove,
    resetHintsForNewGame,
    requestHint,
    setHintsPerGame,
  };
}
