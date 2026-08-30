/**
 * AI Web Worker
 *
 * Runs OthelloBot calculations off the main thread so the UI stays responsive.
 * Hard difficulty uses the bot's built-in iterative deepening + time budget.
 *
 * Messages IN:  { type: 'calculate', board, difficulty, player, moveHistory, timeLimit }
 * Messages OUT: { type: 'progress', depth, nodesSearched, bestMove }
 *               { type: 'result', move, nodesSearched, depthReached, timeMs }
 *               { type: 'error', message }
 */

import { OthelloBot, type Board, type Coordinate, type BotDifficulty } from 'othello-engine';

export interface AIWorkerRequest {
  type: 'calculate';
  board: Board;
  difficulty: BotDifficulty;
  player: 'W' | 'B';
  moveHistory?: Array<{ coordinate: Coordinate }>;
  timeLimit?: number; // ms, default 3000 for hard
}

export interface AIWorkerProgress {
  type: 'progress';
  depth: number;
  nodesSearched: number;
  bestMove: Coordinate | null;
}

export interface AIWorkerResult {
  type: 'result';
  move: Coordinate | null;
  nodesSearched: number;
  depthReached: number;
  timeMs: number;
}

export interface AIWorkerError {
  type: 'error';
  message: string;
}

export type AIWorkerResponse = AIWorkerProgress | AIWorkerResult | AIWorkerError;

self.onmessage = (e: MessageEvent<AIWorkerRequest>) => {
  const { board, difficulty, player, moveHistory, timeLimit } = e.data;

  try {
    const startTime = performance.now();
    const bot = new OthelloBot(difficulty, player);
    let depthReached = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 0;

    const move =
      difficulty === 'hard'
        ? bot.calculateMove(board, moveHistory, {
            timeLimitMs: timeLimit ?? 3000,
            onDepthComplete: ({ depth, bestMove, nodesSearched }) => {
              depthReached = depth;
              self.postMessage({
                type: 'progress',
                depth,
                nodesSearched,
                bestMove,
              } satisfies AIWorkerProgress);
            },
          })
        : bot.calculateMove(board, moveHistory);

    if (difficulty === 'hard' && depthReached === 0 && move) {
      depthReached = bot.getSearchDepth();
    }

    const elapsed = performance.now() - startTime;
    self.postMessage({
      type: 'result',
      move,
      nodesSearched: bot.getNodesSearched(),
      depthReached,
      timeMs: Math.round(elapsed),
    } satisfies AIWorkerResult);
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown AI error',
    } satisfies AIWorkerError);
  }
};
