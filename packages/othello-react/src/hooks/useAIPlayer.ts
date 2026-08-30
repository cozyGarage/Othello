import { useState, useEffect, useCallback, useRef } from 'react';
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
 * Kick timers always cancel previous schedules and read live hook state via refs.
 */
export function useAIPlayer(config: UseAIPlayerConfig): UseAIPlayerReturn {
  const { engine, gameOver, onAIMove } = config;

  const [controller] = useState(() => new AIGameplayController());
  const [aiEnabled, setAIEnabledState] = useState(false);
  const [aiDifficulty, setAIDifficultyState] = useState<BotDifficulty>('medium');
  const [aiPlayer, setAIPlayerState] = useState<'W' | 'B'>('W');
  const [spectatorMode, setSpectatorModeState] = useState(false);
  const [thinkingState, setThinkingState] = useState<AIThinkingState>(IDLE_AI_THINKING);

  const kickTimeoutRef = useRef<number | null>(null);
  const liveRef = useRef({
    engine,
    gameOver,
    aiEnabled,
    aiPlayer,
    aiDifficulty,
    spectatorMode,
    onAIMove,
  });
  liveRef.current = {
    engine,
    gameOver,
    aiEnabled,
    aiPlayer,
    aiDifficulty,
    spectatorMode,
    onAIMove,
  };

  const clearKickTimeout = useCallback(() => {
    if (kickTimeoutRef.current !== null) {
      clearTimeout(kickTimeoutRef.current);
      kickTimeoutRef.current = null;
    }
  }, []);

  const cancelPendingAIMove = useCallback(() => {
    clearKickTimeout();
    controller.cancel();
    setThinkingState(IDLE_AI_THINKING);
  }, [controller, clearKickTimeout]);

  const checkAndMakeAIMove = useCallback(() => {
    const live = liveRef.current;
    controller.checkAndMakeAIMove({
      engine: live.engine,
      gameOver: live.gameOver,
      aiEnabled: live.aiEnabled,
      aiPlayer: live.aiPlayer,
      aiDifficulty: live.aiDifficulty,
      spectatorMode: live.spectatorMode,
      onThinkingChange: setThinkingState,
      onMovePlayed: live.onAIMove,
    });
  }, [controller]);

  const scheduleAICheck = useCallback(
    (delayMs: number) => {
      clearKickTimeout();
      kickTimeoutRef.current = window.setTimeout(() => {
        kickTimeoutRef.current = null;
        checkAndMakeAIMove();
      }, delayMs);
    },
    [checkAndMakeAIMove, clearKickTimeout]
  );

  const setAIEnabled = useCallback(
    (enabled: boolean) => {
      setAIEnabledState(enabled);
      liveRef.current.aiEnabled = enabled;
      if (enabled) {
        scheduleAICheck(500);
      } else {
        cancelPendingAIMove();
      }
    },
    [scheduleAICheck, cancelPendingAIMove]
  );

  const setAIDifficulty = useCallback(
    (difficulty: BotDifficulty) => {
      setAIDifficultyState(difficulty);
      liveRef.current.aiDifficulty = difficulty;
      controller.updateSpectatorDifficulty(difficulty);
    },
    [controller]
  );

  const setAIPlayer = useCallback(
    (player: 'W' | 'B') => {
      setAIPlayerState(player);
      liveRef.current.aiPlayer = player;
      scheduleAICheck(500);
    },
    [scheduleAICheck]
  );

  const setSpectatorMode = useCallback(
    (enabled: boolean) => {
      setSpectatorModeState(enabled);
      liveRef.current.spectatorMode = enabled;
      if (enabled) {
        setAIEnabledState(false);
        liveRef.current.aiEnabled = false;
        cancelPendingAIMove();
        controller.setSpectatorBots(true, liveRef.current.aiDifficulty);
        scheduleAICheck(500);
      } else {
        controller.setSpectatorBots(false, liveRef.current.aiDifficulty);
        cancelPendingAIMove();
      }
    },
    [scheduleAICheck, cancelPendingAIMove, controller]
  );

  useEffect(() => {
    return () => {
      clearKickTimeout();
      controller.dispose();
    };
  }, [controller, clearKickTimeout]);

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
