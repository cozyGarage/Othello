import { useCallback, useState } from 'react';
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

  const resetHintsForNewGame = useCallback(() => {
    setHintMove(null);
    setHintsEnabled(false);
    setHintsRemaining(initialHintsRemaining(hintsPerGame));
  }, [hintsPerGame]);

  const requestHint = useCallback(
    (gameOver: boolean) => {
      if (hintsRemaining <= 0 || gameOver) return;
      setHintsEnabled(true);
      setHintsRemaining((prev) => prev - 1);
      window.setTimeout(() => {
        setHintsEnabled(false);
        setHintMove(null);
      }, 5000);
    },
    [hintsRemaining]
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
