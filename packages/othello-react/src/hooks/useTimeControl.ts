import { useState, useEffect, useRef, useCallback } from 'react';
import { OthelloGameEngine, type PlayerTime, type TimeControlConfig } from 'othello-engine';
import { getDefaultPreset, getPresetById } from '../config/timePresets';
import {
  getTimeControlEnabled,
  setTimeControlEnabled as persistTimeControlEnabled,
  getSelectedTimePreset,
  setSelectedTimePreset as persistSelectedTimePreset,
  setMuteTimeSounds as persistMuteTimeSounds,
  getCustomTimeConfig,
  setCustomTimeConfig as persistCustomTimeConfig,
  saveTimeState,
  clearSavedTimeState,
} from '../utils/timePreferences';

/**
 * Configuration for the useTimeControl hook
 */
export interface UseTimeControlConfig {
  /** The game engine instance */
  engine: OthelloGameEngine;
  /** Whether the game is over */
  gameOver: boolean;
  /** Callback when time warning should be played */
  onTimeWarning?: (player: 'B' | 'W') => void;
  /** Callback when time runs out */
  onTimeout?: (player: 'B' | 'W') => void;
}

/**
 * Return type for useTimeControl hook
 */
export interface UseTimeControlReturn {
  // Time state
  timeRemaining: PlayerTime | null;
  timeControlEnabled: boolean;
  selectedTimePreset: string;
  customInitialMinutes: number;
  customIncrementSeconds: number;

  // Warning tracking
  blackTimeWarningPlayed: boolean;
  whiteTimeWarningPlayed: boolean;

  // Actions
  setTimeControlEnabled: (enabled: boolean) => void;
  setTimePreset: (presetId: string) => void;
  setCustomTime: (initialMinutes: number, incrementSeconds: number) => void;
  setMuteTimeSounds: (muted: boolean) => void;
  pauseTime: () => void;
  resumeTime: () => void;
  resetTimeWarnings: () => void;

  // Engine recreation helpers
  getTimeConfig: () => TimeControlConfig | undefined;
}

/** Low time warning threshold in milliseconds */
const LOW_TIME_THRESHOLD = 10000; // 10 seconds

/**
 * Custom hook that encapsulates time control logic.
 *
 * Handles:
 * - Time update interval (100ms ticks)
 * - Low time warnings
 * - Time state persistence to localStorage
 * - Pause/resume during settings
 */
export function useTimeControl(config: UseTimeControlConfig): UseTimeControlReturn {
  const { engine, gameOver, onTimeWarning, onTimeout } = config;

  // Load initial values from localStorage
  const savedCustomConfig = getCustomTimeConfig();

  // State
  const [timeRemaining, setTimeRemaining] = useState<PlayerTime | null>(null);
  const [timeControlEnabled, setTimeControlEnabledState] = useState(getTimeControlEnabled);
  const [selectedTimePreset, setSelectedTimePresetState] = useState(getSelectedTimePreset);
  const [customInitialMinutes, setCustomInitialMinutes] = useState(
    savedCustomConfig?.initialMinutes ?? 5
  );
  const [customIncrementSeconds, setCustomIncrementSeconds] = useState(
    savedCustomConfig?.incrementSeconds ?? 0
  );
  const [blackTimeWarningPlayed, setBlackTimeWarningPlayed] = useState(false);
  const [whiteTimeWarningPlayed, setWhiteTimeWarningPlayed] = useState(false);

  // Refs for callbacks
  const onTimeWarningRef = useRef(onTimeWarning);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeWarningRef.current = onTimeWarning;
    onTimeoutRef.current = onTimeout;
  });

  // Time update interval
  useEffect(() => {
    if (!engine.hasTimeControl() || gameOver) {
      return;
    }

    const interval = window.setInterval(() => {
      const time = engine.getTimeRemaining();
      setTimeRemaining(time);

      // Save time state periodically for refresh recovery
      const state = engine.getState();
      if (time && !state.isGameOver) {
        saveTimeState({
          blackTime: time.black,
          whiteTime: time.white,
          currentPlayer: state.currentPlayer,
          presetId: selectedTimePreset,
        });
      }

      // Check for low time warnings
      if (time) {
        // Black player warning
        if (time.black < LOW_TIME_THRESHOLD && time.black > 0 && !blackTimeWarningPlayed) {
          onTimeWarningRef.current?.('B');
          setBlackTimeWarningPlayed(true);
        }

        // White player warning
        if (time.white < LOW_TIME_THRESHOLD && time.white > 0 && !whiteTimeWarningPlayed) {
          onTimeWarningRef.current?.('W');
          setWhiteTimeWarningPlayed(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [engine, gameOver, selectedTimePreset, blackTimeWarningPlayed, whiteTimeWarningPlayed]);

  // Get time config based on current settings
  const getTimeConfig = useCallback((): TimeControlConfig | undefined => {
    if (!timeControlEnabled) return undefined;

    if (selectedTimePreset === 'custom') {
      return {
        initialTime: customInitialMinutes * 60 * 1000,
        increment: customIncrementSeconds * 1000,
      };
    }

    const preset = getPresetById(selectedTimePreset) || getDefaultPreset();
    return preset.config;
  }, [timeControlEnabled, selectedTimePreset, customInitialMinutes, customIncrementSeconds]);

  // Actions
  const setTimeControlEnabled = useCallback((enabled: boolean) => {
    setTimeControlEnabledState(enabled);
    persistTimeControlEnabled(enabled);
    clearSavedTimeState();

    if (!enabled) {
      setTimeRemaining(null);
    }
  }, []);

  const setTimePreset = useCallback((presetId: string) => {
    setSelectedTimePresetState(presetId);
    persistSelectedTimePreset(presetId);
    clearSavedTimeState();
  }, []);

  const setCustomTime = useCallback((initialMinutes: number, incrementSeconds: number) => {
    setCustomInitialMinutes(initialMinutes);
    setCustomIncrementSeconds(incrementSeconds);
    persistCustomTimeConfig({ initialMinutes, incrementSeconds });
    clearSavedTimeState();
  }, []);

  const setMuteTimeSounds = useCallback((muted: boolean) => {
    persistMuteTimeSounds(muted);
  }, []);

  const pauseTime = useCallback(() => {
    if (engine.hasTimeControl()) {
      engine.pauseTime();
    }
  }, [engine]);

  const resumeTime = useCallback(() => {
    if (engine.hasTimeControl()) {
      engine.resumeTime();
    }
  }, [engine]);

  const resetTimeWarnings = useCallback(() => {
    setBlackTimeWarningPlayed(false);
    setWhiteTimeWarningPlayed(false);
  }, []);

  return {
    timeRemaining,
    timeControlEnabled,
    selectedTimePreset,
    customInitialMinutes,
    customIncrementSeconds,
    blackTimeWarningPlayed,
    whiteTimeWarningPlayed,
    setTimeControlEnabled,
    setTimePreset,
    setCustomTime,
    setMuteTimeSounds,
    pauseTime,
    resumeTime,
    resetTimeWarnings,
    getTimeConfig,
  };
}
