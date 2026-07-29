import { useCallback, useState } from 'react';
import type { Move, TileValue } from 'othello-engine';

/**
 * Overlay / modal visibility + replay chrome for the game shell.
 */
export function useGameOverlays() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [puzzlesOpen, setPuzzlesOpen] = useState(false);
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [replayBoard, setReplayBoard] = useState<TileValue[][] | null>(null);
  const [historyReplayMoves, setHistoryReplayMoves] = useState<Move[] | null>(null);
  const [gameWinner, setGameWinner] = useState<'B' | 'W' | null>(null);
  const [endedByTimeout, setEndedByTimeout] = useState(false);

  const closeReplay = useCallback(() => {
    setReplayOpen(false);
    setReplayBoard(null);
    setHistoryReplayMoves(null);
  }, []);

  const closeTopOverlay = useCallback(() => {
    if (settingsOpen) setSettingsOpen(false);
    else if (statsOpen) setStatsOpen(false);
    else if (puzzlesOpen) setPuzzlesOpen(false);
    else if (replayOpen) closeReplay();
    else if (modeSelectorOpen) setModeSelectorOpen(false);
    else if (resultModalOpen) setResultModalOpen(false);
  }, [
    settingsOpen,
    statsOpen,
    puzzlesOpen,
    replayOpen,
    modeSelectorOpen,
    resultModalOpen,
    closeReplay,
  ]);

  const resetOverlaysForNewGame = useCallback(() => {
    closeReplay();
    setResultModalOpen(false);
    setGameWinner(null);
    setEndedByTimeout(false);
  }, [closeReplay]);

  const openResult = useCallback((winner: 'B' | 'W' | null, isTimeout: boolean) => {
    setResultModalOpen(true);
    setGameWinner(winner);
    setEndedByTimeout(isTimeout);
  }, []);

  const toggleReplay = useCallback(() => {
    setReplayOpen((open) => {
      if (open) {
        setReplayBoard(null);
        setHistoryReplayMoves(null);
        setResultModalOpen(false);
      }
      return !open;
    });
  }, []);

  const startHistoryReplay = useCallback(
    (moves: Array<{ player: 'B' | 'W'; coordinate: [number, number] }>) => {
      setHistoryReplayMoves(
        moves.map((m) => ({
          player: m.player,
          coordinate: m.coordinate,
          timestamp: 0,
          scoreAfter: { black: 0, white: 0 },
        }))
      );
      setReplayOpen(true);
      setReplayBoard(null);
      setStatsOpen(false);
    },
    []
  );

  return {
    settingsOpen,
    setSettingsOpen,
    statsOpen,
    setStatsOpen,
    puzzlesOpen,
    setPuzzlesOpen,
    modeSelectorOpen,
    setModeSelectorOpen,
    resultModalOpen,
    setResultModalOpen,
    replayOpen,
    setReplayOpen,
    replayBoard,
    setReplayBoard,
    historyReplayMoves,
    gameWinner,
    endedByTimeout,
    closeReplay,
    closeTopOverlay,
    resetOverlaysForNewGame,
    openResult,
    toggleReplay,
    startHistoryReplay,
  };
}
