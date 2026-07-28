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
  clearSavedTimeState,
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
  engine: OthelloGameEngine;
  board: BoardType;
  moveHistory: Move[];
  lastMove: Coordinate | null;
  gameOver: boolean;
  evaluationHistory: EvaluationPoint[];
  timeRemaining: PlayerTime | null;
  timeControlEnabled: boolean;
  selectedTimePreset: string;
  makeMove: (coord: Coordinate) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  reset: () => void;
  setTimeControlEnabled: (enabled: boolean, config?: TimeControlConfig) => void;
  setTimePreset: (presetId: string) => void;
  pauseTime: () => void;
  resumeTime: () => void;
  setGameOver: (value: boolean) => void;
  setMoveHistory: (moves: Move[]) => void;
  setLastMove: (move: Coordinate | null) => void;
  setEvaluationHistory: (history: EvaluationPoint[]) => void;
  addEvaluationPoint: (point: EvaluationPoint) => void;
  setTimeRemaining: (time: PlayerTime | null) => void;
}

function resolveInitialTimeConfig(): TimeControlConfig | undefined {
  const savedTimeControlEnabled = getTimeControlEnabled();
  if (!savedTimeControlEnabled) return undefined;

  const savedTimePreset = getSelectedTimePreset();
  const savedCustomConfig = getCustomTimeConfig();
  if (savedTimePreset === 'custom') {
    return {
      initialTime: (savedCustomConfig?.initialMinutes ?? 5) * 60 * 1000,
      increment: (savedCustomConfig?.incrementSeconds ?? 0) * 1000,
    };
  }
  const preset = getPresetById(savedTimePreset) || getDefaultPreset();
  return preset.config;
}

/**
 * Encapsulates engine lifecycle + event bridge.
 * Aligned with audit behavior: does not restore orphaned clock-only state.
 */
export function useGameEngine(config: UseGameEngineConfig = {}): UseGameEngineReturn {
  const { onMove, onInvalidMove, onGameOver, onStateChange } = config;
  const engineRef = useRef<OthelloGameEngine | null>(null);

  if (!engineRef.current) {
    // Clock-only saves are unsafe without a matching board snapshot
    clearSavedTimeState();
    engineRef.current = new OthelloGameEngine(
      undefined,
      undefined,
      undefined,
      resolveInitialTimeConfig()
    );

    if (typeof window !== 'undefined') {
      (window as { engine?: OthelloGameEngine }).engine = engineRef.current;
    }
  }

  const engine = engineRef.current;

  const [board, setBoard] = useState<BoardType>(() => engine.getState().board);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Coordinate | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationPoint[]>([
    { move: 0, evaluation: 0 },
  ]);
  const [timeRemaining, setTimeRemaining] = useState<PlayerTime | null>(null);
  const [timeControlEnabled, setTimeControlEnabledState] = useState(getTimeControlEnabled);
  const [selectedTimePreset, setSelectedTimePresetState] = useState(getSelectedTimePreset);

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

  useEffect(() => {
    const handleMoveEvent = (event: GameEvent) => {
      const { move, state } = event.data as MoveEventData;
      const history = engine.getMoveHistory();
      const passedOpponent = state.currentPlayer === move.player;

      setBoard(state.board);
      setMoveHistory(history);
      setLastMove(move.coordinate);

      const evaluation = engine.evaluatePosition();
      const newEvalPoint = { move: history.length, evaluation };
      // Slice so undo+branch overwrites future evaluation points
      setEvaluationHistory((prev) => [...prev.slice(0, history.length), newEvalPoint]);
      onMoveRef.current?.(move, passedOpponent);
    };

    const handleInvalidMoveEvent = (event: GameEvent) => {
      const { error } = event.data as InvalidMoveEventData;
      onInvalidMoveRef.current?.(error);
    };

    const handleGameOverEvent = (event: GameEvent) => {
      const { winner } = event.data as GameOverEventData;
      const time = engine.getTimeRemaining();
      const isTimeout =
        time && ((winner === W && time.black <= 0) || (winner === B && time.white <= 0));
      setGameOver(true);
      onGameOverRef.current?.(winner, isTimeout ?? false);
    };

    const handleStateChangeEvent = (event: GameEvent) => {
      const { state } = event.data as StateChangeEventData;
      setBoard(state.board);
      setTimeRemaining(engine.getTimeRemaining());
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

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as { engine?: OthelloGameEngine }).engine;
      }
    };
  }, []);

  const makeMove = useCallback(
    (coord: Coordinate) => {
      if (!gameOver) engine.makeMove(coord);
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
      setEvaluationHistory((prev) => prev.slice(0, history.length + 1));
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
      const evaluation = engine.evaluatePosition();
      setEvaluationHistory((prev) => {
        if (prev.length > history.length) return prev;
        return [...prev, { move: history.length, evaluation }];
      });
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
    setTimeRemaining(engine.getTimeRemaining());
  }, [engine]);

  const setTimeControlEnabled = useCallback(
    (enabled: boolean, config?: TimeControlConfig) => {
      setTimeControlEnabledState(enabled);
      engine.configureTimeControl(enabled ? (config ?? resolveInitialTimeConfig() ?? null) : null);
      setTimeRemaining(engine.getTimeRemaining());
    },
    [engine]
  );

  const setTimePreset = useCallback((presetId: string) => {
    setSelectedTimePresetState(presetId);
  }, []);

  const pauseTime = useCallback(() => {
    if (engine.hasTimeControl()) engine.pauseTime();
  }, [engine]);

  const resumeTime = useCallback(() => {
    if (engine.hasTimeControl()) engine.resumeTime();
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
    setTimeRemaining,
  };
}
