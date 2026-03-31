/**
 * AIManager — Manages AI computation via Web Worker
 *
 * Provides a Promise-based API for AI move calculation.
 * Falls back to synchronous main-thread computation if Workers are unavailable.
 */

import { OthelloBot, type Board, type Coordinate, type BotDifficulty } from 'othello-engine';
import type { AIWorkerRequest, AIWorkerResponse } from '../workers/ai.worker';

export interface AIThinkingState {
  isThinking: boolean;
  depth: number;
  nodesSearched: number;
  bestMove: Coordinate | null;
}

export interface AICalculationResult {
  move: Coordinate | null;
  nodesSearched: number;
  depthReached: number;
  timeMs: number;
}

type ProgressCallback = (state: AIThinkingState) => void;

export class AIManager {
  private worker: Worker | null = null;
  private workerSupported: boolean;
  private pendingReject: ((reason: Error) => void) | null = null;

  constructor() {
    this.workerSupported = typeof Worker !== 'undefined';
  }

  private createWorker(): Worker {
    return new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
      type: 'module',
    });
  }

  /**
   * Calculate the best move for the given board state.
   * Runs in a Web Worker if available, otherwise falls back to synchronous.
   */
  async calculateMove(
    board: Board,
    difficulty: BotDifficulty,
    player: 'W' | 'B',
    moveHistory?: Array<{ coordinate: Coordinate }>,
    onProgress?: ProgressCallback,
    timeLimit?: number
  ): Promise<AICalculationResult> {
    // Cancel any previous calculation
    this.cancel();

    if (!this.workerSupported) {
      return this.calculateSync(board, difficulty, player, moveHistory);
    }

    return new Promise<AICalculationResult>((resolve, reject) => {
      this.pendingReject = reject;

      try {
        this.worker = this.createWorker();
      } catch {
        // Worker creation failed, fall back
        this.pendingReject = null;
        resolve(this.calculateSync(board, difficulty, player, moveHistory));
        return;
      }

      this.worker.onmessage = (e: MessageEvent<AIWorkerResponse>) => {
        const data = e.data;

        if (data.type === 'progress') {
          onProgress?.({
            isThinking: true,
            depth: data.depth,
            nodesSearched: data.nodesSearched,
            bestMove: data.bestMove,
          });
        } else if (data.type === 'result') {
          this.cleanup();
          resolve({
            move: data.move,
            nodesSearched: data.nodesSearched,
            depthReached: data.depthReached,
            timeMs: data.timeMs,
          });
        } else if (data.type === 'error') {
          this.cleanup();
          reject(new Error(data.message));
        }
      };

      this.worker.onerror = () => {
        this.cleanup();
        // Fall back to synchronous on worker error
        resolve(this.calculateSync(board, difficulty, player, moveHistory));
      };

      const request: AIWorkerRequest = {
        type: 'calculate',
        board,
        difficulty,
        player,
        moveHistory,
        timeLimit,
      };
      this.worker.postMessage(request);
    });
  }

  /**
   * Synchronous fallback when Workers are unavailable.
   */
  private calculateSync(
    board: Board,
    difficulty: BotDifficulty,
    player: 'W' | 'B',
    moveHistory?: Array<{ coordinate: Coordinate }>
  ): AICalculationResult {
    const start = performance.now();
    const bot = new OthelloBot(difficulty, player);
    const move = bot.calculateMove(board, moveHistory);
    const elapsed = performance.now() - start;

    return {
      move,
      nodesSearched: bot.getNodesSearched(),
      depthReached: difficulty === 'hard' ? bot.getSearchDepth() : difficulty === 'medium' ? 1 : 0,
      timeMs: Math.round(elapsed),
    };
  }

  /**
   * Cancel any in-progress calculation.
   */
  cancel(): void {
    if (this.pendingReject) {
      this.pendingReject = null;
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingReject = null;
  }

  /**
   * Clean up resources. Call when done with the manager.
   */
  dispose(): void {
    this.cancel();
  }
}

/** Singleton instance */
export const aiManager = new AIManager();
