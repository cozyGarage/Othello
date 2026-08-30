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
 *
 * Timeouts always re-read the latest options so React state updates (AI on/off,
 * game over) are not frozen at schedule time.
 */
export class AIGameplayController {
  private spectatorBotBlack: OthelloBot | null = null;
  private spectatorBotWhite: OthelloBot | null = null;
  private botMoveTimeout: number | null = null;
  private calculating = false;
  private latestOptions: AIGameplayOptions | null = null;

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
    this.latestOptions = null;
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

  private isLiveGameOver(options: AIGameplayOptions): boolean {
    return options.gameOver || options.engine.getState().isGameOver;
  }

  checkAndMakeAIMove(options: AIGameplayOptions): void {
    this.latestOptions = options;

    if (this.isLiveGameOver(options) || this.calculating) return;

    const state = options.engine.getState();
    const currentPlayer = state.currentPlayer;

    if (options.spectatorMode) {
      const bot = currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;
      if (!bot) return;

      this.botMoveTimeout = window.setTimeout(() => {
        const opts = this.latestOptions;
        if (!opts || this.isLiveGameOver(opts)) return;

        const currentState = opts.engine.getState();
        const currentBot =
          currentState.currentPlayer === 'B' ? this.spectatorBotBlack : this.spectatorBotWhite;
        if (!currentBot) return;

        const move = currentBot.calculateMove(currentState.board);
        if (move) {
          opts.engine.makeMove(move);
          opts.onMovePlayed?.(move);
        }
      }, 1500);
      return;
    }

    if (!options.aiEnabled || currentPlayer !== options.aiPlayer) return;

    this.calculating = true;
    options.onThinkingChange?.({ isThinking: true, depth: 0, nodesSearched: 0, bestMove: null });

    this.botMoveTimeout = window.setTimeout(() => {
      const opts = this.latestOptions;
      if (!opts || !opts.aiEnabled || this.isLiveGameOver(opts)) {
        this.calculating = false;
        opts?.onThinkingChange?.(IDLE_AI_THINKING);
        return;
      }

      const currentState = opts.engine.getState();
      if (currentState.currentPlayer !== opts.aiPlayer) {
        this.calculating = false;
        opts.onThinkingChange?.(IDLE_AI_THINKING);
        return;
      }

      const moveHistory = opts.engine.getMoveHistory().map((m) => ({ coordinate: m.coordinate }));
      const { aiDifficulty, aiPlayer, onThinkingChange, onMovePlayed, engine } = opts;

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
          const live = this.latestOptions;
          if (
            result.move &&
            live &&
            live.aiEnabled &&
            !this.isLiveGameOver(live) &&
            live.engine.getState().currentPlayer === live.aiPlayer
          ) {
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
