import { useState, useEffect, useRef, useCallback } from 'react';
import { OthelloBot, OthelloGameEngine, type BotDifficulty, type Coordinate } from 'othello-engine';
import { aiManager, type AIThinkingState } from '../utils/aiManager';

/**
 * Configuration for the useAIPlayer hook
 */
export interface UseAIPlayerConfig {
  /** The game engine instance */
  engine: OthelloGameEngine;
  /** Whether the game is over */
  gameOver: boolean;
  /** Callback when AI makes a move */
  onAIMove?: (move: Coordinate) => void;
}

/**
 * Return type for useAIPlayer hook
 */
export interface UseAIPlayerReturn {
  // AI settings
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'W' | 'B';

  // Spectator mode (AI vs AI)
  spectatorMode: boolean;

  // Thinking state (for UI indicator)
  thinkingState: AIThinkingState;

  // Actions
  setAIEnabled: (enabled: boolean) => void;
  setAIDifficulty: (difficulty: BotDifficulty) => void;
  setAIPlayer: (player: 'W' | 'B') => void;
  setSpectatorMode: (enabled: boolean) => void;

  // Trigger AI move check
  checkAndMakeAIMove: () => void;

  // Cleanup pending AI moves
  cancelPendingAIMove: () => void;
}

const IDLE_THINKING: AIThinkingState = {
  isThinking: false,
  depth: 0,
  nodesSearched: 0,
  bestMove: null,
};

/**
 * Custom hook that encapsulates AI player logic.
 *
 * Uses Web Worker via AIManager for hard difficulty to avoid blocking the UI.
 * Falls back to main-thread OthelloBot for easy/medium and spectator mode.
 *
 * Handles:
 * - Bot initialization (single AI or spectator mode)
 * - Web Worker-based move calculation for hard difficulty
 * - AI thinking state for UI indicators
 * - AI settings (difficulty, player color)
 * - Timeout management for bot moves
 */
export function useAIPlayer(config: UseAIPlayerConfig): UseAIPlayerReturn {
  const { engine, gameOver, onAIMove } = config;

  // State
  const [aiEnabled, setAIEnabledState] = useState(false);
  const [aiDifficulty, setAIDifficultyState] = useState<BotDifficulty>('medium');
  const [aiPlayer, setAIPlayerState] = useState<'W' | 'B'>('W');
  const [spectatorMode, setSpectatorModeState] = useState(false);
  const [thinkingState, setThinkingState] = useState<AIThinkingState>(IDLE_THINKING);

  // Refs for spectator bots (still run on main thread — they're fast enough)
  const spectatorBotBlackRef = useRef<OthelloBot | null>(null);
  const spectatorBotWhiteRef = useRef<OthelloBot | null>(null);
  const botMoveTimeoutRef = useRef<number | null>(null);
  const calculatingRef = useRef(false);

  // Refs for callbacks to avoid stale closures
  const onAIMoveRef = useRef(onAIMove);
  useEffect(() => {
    onAIMoveRef.current = onAIMove;
  });

  // Cancel any pending AI move
  const cancelPendingAIMove = useCallback(() => {
    if (botMoveTimeoutRef.current !== null) {
      clearTimeout(botMoveTimeoutRef.current);
      botMoveTimeoutRef.current = null;
    }
    aiManager.cancel();
    calculatingRef.current = false;
    setThinkingState(IDLE_THINKING);
  }, []);

  // Check and make AI move
  const checkAndMakeAIMove = useCallback(() => {
    if (gameOver || calculatingRef.current) return;

    const state = engine.getState();
    const currentPlayer = state.currentPlayer;

    // Spectator mode: both players are AI (main thread, fast bots)
    if (spectatorMode) {
      const bot =
        currentPlayer === 'B' ? spectatorBotBlackRef.current : spectatorBotWhiteRef.current;

      if (!bot) return;

      botMoveTimeoutRef.current = window.setTimeout(() => {
        if (!spectatorMode || gameOver) return;

        const currentState = engine.getState();
        const currentBot =
          currentState.currentPlayer === 'B'
            ? spectatorBotBlackRef.current
            : spectatorBotWhiteRef.current;

        if (!currentBot) return;

        const move = currentBot.calculateMove(currentState.board);
        if (move) {
          engine.makeMove(move);
          onAIMoveRef.current?.(move);
        }
      }, 1500);
      return;
    }

    // Single AI mode
    if (!aiEnabled) return;
    if (currentPlayer !== aiPlayer) return;

    // Use Web Worker via AIManager
    calculatingRef.current = true;
    setThinkingState({ isThinking: true, depth: 0, nodesSearched: 0, bestMove: null });

    // Small delay before starting computation for UX
    botMoveTimeoutRef.current = window.setTimeout(() => {
      if (!aiEnabled || gameOver) {
        calculatingRef.current = false;
        setThinkingState(IDLE_THINKING);
        return;
      }

      const currentState = engine.getState();
      if (currentState.currentPlayer !== aiPlayer) {
        calculatingRef.current = false;
        setThinkingState(IDLE_THINKING);
        return;
      }

      const moveHistory = engine.getMoveHistory().map((m) => ({ coordinate: m.coordinate }));

      aiManager
        .calculateMove(
          currentState.board,
          aiDifficulty,
          aiPlayer,
          moveHistory,
          (progress) => setThinkingState(progress),
          aiDifficulty === 'hard' ? 3000 : undefined
        )
        .then((result) => {
          calculatingRef.current = false;
          setThinkingState(IDLE_THINKING);

          if (result.move && !gameOver) {
            engine.makeMove(result.move);
            onAIMoveRef.current?.(result.move);
          }
        })
        .catch(() => {
          calculatingRef.current = false;
          setThinkingState(IDLE_THINKING);
        });
    }, 300);
  }, [engine, gameOver, aiEnabled, aiPlayer, aiDifficulty, spectatorMode]);

  // Actions
  const setAIEnabled = useCallback(
    (enabled: boolean) => {
      setAIEnabledState(enabled);

      if (enabled) {
        setTimeout(() => checkAndMakeAIMove(), 500);
      } else {
        cancelPendingAIMove();
      }
    },
    [checkAndMakeAIMove, cancelPendingAIMove]
  );

  const setAIDifficulty = useCallback((difficulty: BotDifficulty) => {
    setAIDifficultyState(difficulty);

    // Update spectator bots
    if (spectatorBotBlackRef.current) {
      spectatorBotBlackRef.current.setDifficulty(difficulty);
    }
    if (spectatorBotWhiteRef.current) {
      spectatorBotWhiteRef.current.setDifficulty(difficulty);
    }
  }, []);

  const setAIPlayer = useCallback(
    (player: 'W' | 'B') => {
      setAIPlayerState(player);
      setTimeout(() => checkAndMakeAIMove(), 500);
    },
    [checkAndMakeAIMove]
  );

  const setSpectatorMode = useCallback(
    (enabled: boolean) => {
      setSpectatorModeState(enabled);

      if (enabled) {
        setAIEnabledState(false);
        cancelPendingAIMove();

        spectatorBotBlackRef.current = new OthelloBot(aiDifficulty, 'B');
        spectatorBotWhiteRef.current = new OthelloBot(aiDifficulty, 'W');

        setTimeout(() => checkAndMakeAIMove(), 500);
      } else {
        spectatorBotBlackRef.current = null;
        spectatorBotWhiteRef.current = null;
        cancelPendingAIMove();
      }
    },
    [aiDifficulty, checkAndMakeAIMove, cancelPendingAIMove]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelPendingAIMove();
      aiManager.dispose();
    };
  }, [cancelPendingAIMove]);

  return {
    aiEnabled,
    aiDifficulty,
    aiPlayer,
    spectatorMode,
    thinkingState,
    setAIEnabled,
    setAIDifficulty,
    setAIPlayer,
    setSpectatorMode,
    checkAndMakeAIMove,
    cancelPendingAIMove,
  };
}
