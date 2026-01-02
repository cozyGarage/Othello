import { useState, useEffect, useRef, useCallback } from 'react';
import { OthelloBot, OthelloGameEngine, type BotDifficulty, type Coordinate } from 'othello-engine';

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

/**
 * Custom hook that encapsulates AI player logic.
 *
 * Handles:
 * - Bot initialization (single AI or spectator mode)
 * - Bot move calculation with delayed execution
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

  // Refs for bots and timeouts
  const botRef = useRef<OthelloBot | null>(null);
  const spectatorBotBlackRef = useRef<OthelloBot | null>(null);
  const spectatorBotWhiteRef = useRef<OthelloBot | null>(null);
  const botMoveTimeoutRef = useRef<number | null>(null);

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
  }, []);

  // Check and make AI move
  const checkAndMakeAIMove = useCallback(() => {
    if (gameOver) return;

    const state = engine.getState();
    const currentPlayer = state.currentPlayer;

    // Spectator mode: both players are AI
    if (spectatorMode) {
      const bot =
        currentPlayer === 'B' ? spectatorBotBlackRef.current : spectatorBotWhiteRef.current;

      if (!bot) return;

      // Add delay for better UX (longer for spectator mode so humans can follow)
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
      }, 1500); // 1.5 seconds for spectator mode
      return;
    }

    // Single AI mode
    if (!aiEnabled || !botRef.current) return;

    // Only make AI move if it's the AI's turn
    if (currentPlayer !== aiPlayer) return;

    // Add delay for better UX
    botMoveTimeoutRef.current = window.setTimeout(() => {
      if (!aiEnabled || !botRef.current || gameOver) return;

      const currentState = engine.getState();
      if (currentState.currentPlayer !== aiPlayer) return;

      const move = botRef.current.calculateMove(currentState.board);
      if (move) {
        engine.makeMove(move);
        onAIMoveRef.current?.(move);
      }
    }, 800);
  }, [engine, gameOver, aiEnabled, aiPlayer, spectatorMode]);

  // Actions
  const setAIEnabled = useCallback(
    (enabled: boolean) => {
      setAIEnabledState(enabled);

      if (enabled) {
        // Initialize bot
        botRef.current = new OthelloBot(aiDifficulty, aiPlayer);
        // Schedule AI move check
        setTimeout(() => checkAndMakeAIMove(), 500);
      } else {
        // Clean up
        botRef.current = null;
        cancelPendingAIMove();
      }
    },
    [aiDifficulty, aiPlayer, checkAndMakeAIMove, cancelPendingAIMove]
  );

  const setAIDifficulty = useCallback((difficulty: BotDifficulty) => {
    setAIDifficultyState(difficulty);

    // Update existing bot
    if (botRef.current) {
      botRef.current.setDifficulty(difficulty);
    }

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

      // Update existing bot
      if (botRef.current) {
        botRef.current.setPlayer(player);
      }

      // Check if AI should move immediately
      setTimeout(() => checkAndMakeAIMove(), 500);
    },
    [checkAndMakeAIMove]
  );

  const setSpectatorMode = useCallback(
    (enabled: boolean) => {
      setSpectatorModeState(enabled);

      if (enabled) {
        // Disable regular AI
        setAIEnabledState(false);
        botRef.current = null;

        // Initialize bots for both players
        spectatorBotBlackRef.current = new OthelloBot(aiDifficulty, 'B');
        spectatorBotWhiteRef.current = new OthelloBot(aiDifficulty, 'W');

        // Start AI vs AI game
        setTimeout(() => checkAndMakeAIMove(), 500);
      } else {
        // Clean up spectator bots
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
    };
  }, [cancelPendingAIMove]);

  return {
    aiEnabled,
    aiDifficulty,
    aiPlayer,
    spectatorMode,
    setAIEnabled,
    setAIDifficulty,
    setAIPlayer,
    setSpectatorMode,
    checkAndMakeAIMove,
    cancelPendingAIMove,
  };
}
