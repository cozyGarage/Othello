/**
 * Custom hooks for the Othello game
 *
 * These hooks extract reusable logic from OthelloGame component:
 * - useGameEngine: Engine initialization, events, core state
 * - useAIPlayer: Bot logic, spectator mode
 * - useTimeControl: Timer updates, warnings, persistence
 */

export { useGameEngine } from './useGameEngine';
export type { UseGameEngineConfig, UseGameEngineReturn, EvaluationPoint } from './useGameEngine';

export { useAIPlayer } from './useAIPlayer';
export type { UseAIPlayerConfig, UseAIPlayerReturn } from './useAIPlayer';

export { useTimeControl } from './useTimeControl';
export type { UseTimeControlConfig, UseTimeControlReturn } from './useTimeControl';

// Re-export existing hooks
export { useFlipAnimation } from './useFlipAnimation';
export { useScoreAnimation } from './useScoreAnimation';
