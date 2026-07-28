import { OthelloBot, OthelloGameEngine, type BotDifficulty, type Coordinate } from 'othello-engine';
import { aiManager, type AIThinkingState } from '../utils/aiManager';

export const IDLE_AI_THINKING: AIThinkingState = {
  isThinking: false,
  depth: 0,
  nodesSearched: 0,
  bestMove: null,
};

export interface AIGameplayOptions {
  engine: OthelloGameEngine;
  gameOver: boolean;
  aiEnabled: boolean;
  aiPlayer: 'W' | 'B';
  aiDifficulty: BotDifficulty;
  spectatorMode: boolean;
  onThinkingChange?: (state: AIThinkingState) => void;
  onMovePlayed?: (move: Coordinate) => void;
}

/**
 * Owns spectator bots, pending timeouts, and AIManager calls.
 * Extracted from OthelloGame so AI orchestration is not embedded in the UI class.
 */
export class AIGameplayController {
  private spectatorBotBlack: OthelloBot | null = null;
  private spectatorBotWhite: OthelloBot | null = null;
  private botMoveTimeout: number | null = null;
  private calculating = false;

  cancel(): void {
    if (this.botMoveTimeout !== null) {
      clearTimeout(this.botMoveTimeout);
      this.botMoveTimeout = null;
    }
    aiManager.cancel();
    this.calculating = false;
  }

  dispose(): void {
    this.cancel();
    this.spectatorBotBlack = null;
    this.spectatorBotWhite = null;
    aiManager.dispose();
  }

  setSpectatorBots(enabled: boolean, difficulty: BotDifficulty): void {
    if (enabled) {
      this.spectatorBotBlack = new OthelloBot(difficulty, 'B');
      this.spectatorBotWhite = new OthelloBot(difficulty, 'W');
    } else {
      this.spectatorBotBlack = null;
      this.spectatorBotWhite = null;
    }
  }

  updateSpectatorDifficulty(difficulty: BotDifficulty): void {
    this.spectatorBotBlack?.setDifficulty(difficulty);
    this.spectatorBotWhite?.setDifficulty(difficulty);
  }

  checkAndMakeAIMove(options: AIGameplayOptions): void {
    const {
      engine,
      gameOver,
      aiEnabled,
      aiPlayer,
      aiDifficulty,
      spectatorMode,
      onThinkingChange,
      onMovePlayed,
    } = options;

    if (gameOver || this.calculating) return;

    const state = engine.getState();
    const currentPlayer = state.currentPlayer;

    if (spectatorMode) {
      const bot = currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;
      if (!bot) return;

      this.botMoveTimeout = window.setTimeout(() => {
        if (gameOver) return;
        const currentState = engine.getState();
        const currentBot =
          currentState.currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;
        if (!currentBot) return;

        const move = currentBot.calculateMove(currentState.board);
        if (move) {
          engine.makeMove(move);
          onMovePlayed?.(move);
        }
      }, 1500);
      return;
    }

    if (!aiEnabled || currentPlayer !== aiPlayer) return;

    this.calculating = true;
    onThinkingChange?.({ isThinking: true, depth: 0, nodesSearched: 0, bestMove: null });

    this.botMoveTimeout = window.setTimeout(() => {
      if (!aiEnabled || gameOver) {
        this.calculating = false;
        onThinkingChange?.(IDLE_AI_THINKING);
        return;
      }

      const currentState = engine.getState();
      if (currentState.currentPlayer !== aiPlayer) {
        this.calculating = false;
        onThinkingChange?.(IDLE_AI_THINKING);
        return;
      }

      const moveHistory = engine.getMoveHistory().map((m) => ({ coordinate: m.coordinate }));

      aiManager
        .calculateMove(
          currentState.board,
          aiDifficulty,
          aiPlayer,
          moveHistory,
          (progress) => onThinkingChange?.(progress),
          aiDifficulty === 'hard' ? 3000 : undefined
        )
        .then((result) => {
          this.calculating = false;
          onThinkingChange?.(IDLE_AI_THINKING);
          if (result.move && !gameOver) {
            engine.makeMove(result.move);
            onMovePlayed?.(result.move);
          }
        })
        .catch(() => {
          this.calculating = false;
          onThinkingChange?.(IDLE_AI_THINKING);
        });
    }, 300);
  }
}
