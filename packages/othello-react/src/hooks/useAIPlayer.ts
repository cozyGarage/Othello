import { useState, useEffect, useCallback } from 'react';
import { OthelloGameEngine, type BotDifficulty, type Coordinate } from 'othello-engine';
import { type AIThinkingState } from '../utils/aiManager';
import { AIGameplayController, IDLE_AI_THINKING } from '../services/aiGameplay';

/**
 * Configuration for the useAIPlayer hook
 */
export interface UseAIPlayerConfig {
  engine: OthelloGameEngine;
  gameOver: boolean;
  onAIMove?: (move: Coordinate) => void;
}

/**
 * Return type for useAIPlayer hook
 */
export interface UseAIPlayerReturn {
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'W' | 'B';
  spectatorMode: boolean;
  thinkingState: AIThinkingState;
  setAIEnabled: (enabled: boolean) => void;
  setAIDifficulty: (difficulty: BotDifficulty) => void;
  setAIPlayer: (player: 'W' | 'B') => void;
  setSpectatorMode: (enabled: boolean) => void;
  checkAndMakeAIMove: () => void;
  cancelPendingAIMove: () => void;
}

/**
 * AI / spectator orchestration via shared AIGameplayController.
 */
export function useAIPlayer(config: UseAIPlayerConfig): UseAIPlayerReturn {
  const { engine, gameOver, onAIMove } = config;

  const [controller] = useState(() => new AIGameplayController());
  const [aiEnabled, setAIEnabledState] = useState(false);
  const [aiDifficulty, setAIDifficultyState] = useState<BotDifficulty>('medium');
  const [aiPlayer, setAIPlayerState] = useState<'W' | 'B'>('W');
  const [spectatorMode, setSpectatorModeState] = useState(false);
  const [thinkingState, setThinkingState] = useState<AIThinkingState>(IDLE_AI_THINKING);

  const cancelPendingAIMove = useCallback(() => {
    controller.cancel();
    setThinkingState(IDLE_AI_THINKING);
  }, [controller]);

  const checkAndMakeAIMove = useCallback(() => {
    controller.checkAndMakeAIMove({
      engine,
      gameOver,
      aiEnabled,
      aiPlayer,
      aiDifficulty,
      spectatorMode,
      onThinkingChange: setThinkingState,
      onMovePlayed: onAIMove,
    });
  }, [controller, engine, gameOver, aiEnabled, aiPlayer, aiDifficulty, spectatorMode, onAIMove]);

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

  const setAIDifficulty = useCallback(
    (difficulty: BotDifficulty) => {
      setAIDifficultyState(difficulty);
      controller.updateSpectatorDifficulty(difficulty);
    },
    [controller]
  );

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
        controller.setSpectatorBots(true, aiDifficulty);
        setTimeout(() => checkAndMakeAIMove(), 500);
      } else {
        controller.setSpectatorBots(false, aiDifficulty);
        cancelPendingAIMove();
      }
    },
    [aiDifficulty, checkAndMakeAIMove, cancelPendingAIMove, controller]
  );

  useEffect(() => {
    return () => {
      controller.dispose();
    };
  }, [controller]);

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
