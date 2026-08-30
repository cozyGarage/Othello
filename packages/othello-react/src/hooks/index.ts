/**
 * Custom Hooks
 *
 * Core gameplay hooks (useGameEngine / useAIPlayer / useTimeControl) stay in
 * sync with OthelloGame audit behavior and share AIGameplayController.
 */

export { useGameEngine } from './useGameEngine';
export type { UseGameEngineConfig, UseGameEngineReturn, EvaluationPoint } from './useGameEngine';

export { useAIPlayer } from './useAIPlayer';
export type { UseAIPlayerConfig, UseAIPlayerReturn } from './useAIPlayer';

export { useTimeControl } from './useTimeControl';
export type { UseTimeControlConfig, UseTimeControlReturn } from './useTimeControl';

export { useGameShortcuts } from './useGameShortcuts';
export type { GameShortcutHandlers } from './useGameShortcuts';

export { useHints } from './useHints';

export { useGameOverlays } from './useGameOverlays';
