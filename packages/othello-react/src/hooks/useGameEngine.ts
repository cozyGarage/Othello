import { useState, useEffect, useRef, useCallback } from 'react';
import {
  OthelloGameEngine,
  type Board as BoardType,
  type Coordinate,
  type GameEvent,
  type Move,
  type MoveEventData,
  type InvalidMoveEventData,
  type GameOverEventData,
  type StateChangeEventData,
  type PlayerTime,
  type TimeControlConfig,
  B,
  W,
} from 'othello-engine';
import { getDefaultPreset, getPresetById } from '../config/timePresets';
import {
  getTimeControlEnabled,
  getSelectedTimePreset,
  getCustomTimeConfig,
  getSavedTimeState,
} from '../utils/timePreferences';

/**
 * Evaluation point for the graph
 */
export interface EvaluationPoint {
  move: number;
  evaluation: number;
}

/**
 * Configuration for the useGameEngine hook
 */
export interface UseGameEngineConfig {
  onMove?: (move: Move, passedOpponent: boolean) => void;
  onInvalidMove?: (error: string) => void;
  onGameOver?: (winner: 'B' | 'W' | null, isTimeout: boolean) => void;
  onStateChange?: () => void;
}

/**
 * Return type for useGameEngine hook
 */
export interface UseGameEngineReturn {
  // Engine instance
  engine: OthelloGameEngine;

  // Core state
  board: BoardType;
  moveHistory: Move[];
  lastMove: Coordinate | null;
  gameOver: boolean;

  // Evaluation tracking
  evaluationHistory: EvaluationPoint[];

  // Time control
  timeRemaining: PlayerTime | null;
  timeControlEnabled: boolean;
  selectedTimePreset: string;

  // Actions
  makeMove: (coord: Coordinate) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;

  // Time control actions
  setTimeControlEnabled: (enabled: boolean, config?: TimeControlConfig) => void;
  setTimePreset: (presetId: string) => void;
  pauseTime: () => void;
  resumeTime: () => void;

  // State management
  setGameOver: (value: boolean) => void;
  setMoveHistory: (moves: Move[]) => void;
  setLastMove: (move: Coordinate | null) => void;
  setEvaluationHistory: (history: EvaluationPoint[]) => void;
  addEvaluationPoint: (point: EvaluationPoint) => void;
}

/**
 * Custom hook that encapsulates the Othello game engine logic.
 *
 * Handles:
 * - Engine initialization with time control config
 * - Event listeners (move, invalidMove, gameOver, stateChange)
 * - Time state restoration from localStorage
 * - Core state: board, moveHistory, gameOver, lastMove
 */
export function useGameEngine(config: UseGameEngineConfig = {}): UseGameEngineReturn {
  const { onMove, onInvalidMove, onGameOver, onStateChange } = config;

  // Refs for mutable values
  const engineRef = useRef<OthelloGameEngine | null>(null);

  // Initialize engine on first render
  if (!engineRef.current) {
    // Load time control preferences from localStorage
    const savedTimeControlEnabled = getTimeControlEnabled();
    const savedTimePreset = getSelectedTimePreset();
    const savedCustomConfig = getCustomTimeConfig();
    const customInitialMinutes = savedCustomConfig?.initialMinutes ?? 5;
    const customIncrementSeconds = savedCustomConfig?.incrementSeconds ?? 0;

    // Determine the time config to use
    let timeConfig: TimeControlConfig | undefined;
    if (savedTimeControlEnabled) {
      if (savedTimePreset === 'custom') {
        timeConfig = {
          initialTime: customInitialMinutes * 60 * 1000,
          increment: customIncrementSeconds * 1000,
        };
      } else {
        const preset = getPresetById(savedTimePreset) || getDefaultPreset();
        timeConfig = preset.config;
      }
    }

    // Create the engine
    engineRef.current = new OthelloGameEngine(undefined, undefined, undefined, timeConfig);

    // Restore saved time state if applicable
    const savedTimeState = getSavedTimeState();
    if (savedTimeControlEnabled && savedTimeState && savedTimeState.presetId === savedTimePreset) {
      const engineWithRestore = engineRef.current as OthelloGameEngine & {
        restoreTimeState?: (blackTime: number, whiteTime: number, currentPlayer: 'B' | 'W') => void;
      };
      engineWithRestore.restoreTimeState?.(
        savedTimeState.blackTime,
        savedTimeState.whiteTime,
        savedTimeState.currentPlayer
      );
    }

    // Expose engine to window for console testing (42 School requirement)
    if (typeof window !== 'undefined') {
      (window as { engine?: OthelloGameEngine }).engine = engineRef.current;
    }
  }

  const engine = engineRef.current!;

  // State
  const [board, setBoard] = useState<BoardType>(() => engine.getState().board);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Coordinate | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationPoint[]>([
    { move: 0, evaluation: 0 },
  ]);
  const [timeRemaining] = useState<PlayerTime | null>(() => {
    const savedTimeState = getSavedTimeState();
    const savedTimeControlEnabled = getTimeControlEnabled();
    const savedTimePreset = getSelectedTimePreset();
    if (savedTimeControlEnabled && savedTimeState && savedTimeState.presetId === savedTimePreset) {
      return {
        black: savedTimeState.blackTime,
        white: savedTimeState.whiteTime,
      };
    }
    return null;
  });
  const [timeControlEnabled, setTimeControlEnabledState] = useState(getTimeControlEnabled);
  const [selectedTimePreset, setSelectedTimePresetState] = useState(getSelectedTimePreset);

  // Event handlers (using refs to avoid stale closures)
  const onMoveRef = useRef(onMove);
  const onInvalidMoveRef = useRef(onInvalidMove);
  const onGameOverRef = useRef(onGameOver);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    onMoveRef.current = onMove;
    onInvalidMoveRef.current = onInvalidMove;
    onGameOverRef.current = onGameOver;
    onStateChangeRef.current = onStateChange;
  });

  // Subscribe to engine events
  useEffect(() => {
    const handleMoveEvent = (event: GameEvent) => {
      const { move, state } = event.data as MoveEventData;
      const history = engine.getMoveHistory();

      // Check if opponent had to pass (same player moves again)
      const passedOpponent = state.currentPlayer === move.player;

      // Update state
      setBoard(state.board);
      setMoveHistory(history);
      setLastMove(move.coordinate);

      // Add evaluation point
      const evaluation = engine.evaluatePosition();
      setEvaluationHistory((prev) => [...prev, { move: history.length, evaluation }]);

      // Notify callback
      onMoveRef.current?.(move, passedOpponent);
    };

    const handleInvalidMoveEvent = (event: GameEvent) => {
      const { error } = event.data as InvalidMoveEventData;
      onInvalidMoveRef.current?.(error);
    };

    const handleGameOverEvent = (event: GameEvent) => {
      const { winner } = event.data as GameOverEventData;

      // Check if game ended due to timeout
      const time = engine.getTimeRemaining();
      const isTimeout =
        time && ((winner === W && time.black <= 0) || (winner === B && time.white <= 0));

      setGameOver(true);
      onGameOverRef.current?.(winner, isTimeout ?? false);
    };

    const handleStateChangeEvent = (event: GameEvent) => {
      const { state } = event.data as StateChangeEventData;
      setBoard(state.board);
      onStateChangeRef.current?.();
    };

    engine.on('move', handleMoveEvent);
    engine.on('invalidMove', handleInvalidMoveEvent);
    engine.on('gameOver', handleGameOverEvent);
    engine.on('stateChange', handleStateChangeEvent);

    return () => {
      engine.off('move', handleMoveEvent);
      engine.off('invalidMove', handleInvalidMoveEvent);
      engine.off('gameOver', handleGameOverEvent);
      engine.off('stateChange', handleStateChangeEvent);
    };
  }, [engine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as { engine?: OthelloGameEngine }).engine;
      }
    };
  }, []);

  // Actions
  const makeMove = useCallback(
    (coord: Coordinate) => {
      if (!gameOver) {
        engine.makeMove(coord);
      }
    },
    [engine, gameOver]
  );

  const undo = useCallback(() => {
    const success = engine.undo();
    if (success) {
      const state = engine.getState();
      const history = state.moveHistory;
      setBoard(state.board);
      setMoveHistory(history);
      setLastMove(history.length > 0 ? (history[history.length - 1]?.coordinate ?? null) : null);
      setGameOver(false);
    }
    return success;
  }, [engine]);

  const redo = useCallback(() => {
    const success = engine.redo();
    if (success) {
      const state = engine.getState();
      const history = state.moveHistory;
      setBoard(state.board);
      setMoveHistory(history);
      setLastMove(history.length > 0 ? (history[history.length - 1]?.coordinate ?? null) : null);
      setGameOver(state.isGameOver);
    }
    return success;
  }, [engine]);

  const canUndo = useCallback(() => engine.canUndo(), [engine]);
  const canRedo = useCallback(() => engine.canRedo(), [engine]);

  const reset = useCallback(() => {
    engine.reset();
    const initialState = engine.getState();
    setBoard(initialState.board);
    setMoveHistory([]);
    setLastMove(null);
    setGameOver(false);
    setEvaluationHistory([{ move: 0, evaluation: 0 }]);
  }, [engine]);

  const setTimeControlEnabled = useCallback((enabled: boolean, _config?: TimeControlConfig) => {
    setTimeControlEnabledState(enabled);
    // Note: Engine recreation would be handled by the parent component
    // The _config parameter is available for future use
  }, []);

  const setTimePreset = useCallback((presetId: string) => {
    setSelectedTimePresetState(presetId);
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

  const addEvaluationPoint = useCallback((point: EvaluationPoint) => {
    setEvaluationHistory((prev) => [...prev, point]);
  }, []);

  return {
    engine,
    board,
    moveHistory,
    lastMove,
    gameOver,
    evaluationHistory,
    timeRemaining,
    timeControlEnabled,
    selectedTimePreset,
    makeMove,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    setTimeControlEnabled,
    setTimePreset,
    pauseTime,
    resumeTime,
    setGameOver,
    setMoveHistory,
    setLastMove,
    setEvaluationHistory,
    addEvaluationPoint,
  };
}
