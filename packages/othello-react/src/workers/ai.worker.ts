/**
 * AI Web Worker
 *
 * Runs OthelloBot calculations off the main thread so the UI stays responsive.
 * For hard difficulty, uses iterative deepening: searches depth 1, 2, 3...
 * up to a time limit, posting progress updates after each depth completes.
 *
 * Messages IN:  { type: 'calculate', board, difficulty, player, moveHistory, timeLimit }
 * Messages OUT: { type: 'progress', depth, nodesSearched, bestMove }
 *               { type: 'result', move, nodesSearched, depthReached, timeMs }
 *               { type: 'error', message }
 */

import {
  OthelloBot,
  type Board,
  type Coordinate,
  type BotDifficulty,
  getValidMoves,
} from 'othello-engine';

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

    // For easy/medium, just calculate directly — no iterative deepening needed
    if (difficulty !== 'hard') {
      const bot = new OthelloBot(difficulty, player);
      const move = bot.calculateMove(board, moveHistory);
      const elapsed = performance.now() - startTime;

      self.postMessage({
        type: 'result',
        move,
        nodesSearched: bot.getNodesSearched(),
        depthReached: difficulty === 'easy' ? 0 : 1,
        timeMs: Math.round(elapsed),
      } satisfies AIWorkerResult);
      return;
    }

    // Hard mode: iterative deepening with time limit
    const limit = timeLimit ?? 3000;
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) {
      self.postMessage({
        type: 'result',
        move: null,
        nodesSearched: 0,
        depthReached: 0,
        timeMs: 0,
      } satisfies AIWorkerResult);
      return;
    }

    // If only one valid move, return it immediately
    if (validMoves.length === 1) {
      self.postMessage({
        type: 'result',
        move: validMoves[0] ?? null,
        nodesSearched: 1,
        depthReached: 0,
        timeMs: Math.round(performance.now() - startTime),
      } satisfies AIWorkerResult);
      return;
    }

    let bestMove: Coordinate | null = null;
    let totalNodes = 0;
    let depthReached = 0;
    const maxDepth = 10;

    // Iterative deepening: search depth 1, then 2, then 3... up to time limit
    for (let depth = 1; depth <= maxDepth; depth++) {
      const elapsed = performance.now() - startTime;
      if (elapsed > limit * 0.8) break; // Leave 20% margin

      const bot = new OthelloBot('hard', player);
      bot.setSearchDepth(depth);
      bot.clearTranspositionTable();

      const move = bot.calculateMove(board, moveHistory);

      if (move) {
        bestMove = move;
        totalNodes += bot.getNodesSearched();
        depthReached = depth;
      }

      // Post progress after each depth
      self.postMessage({
        type: 'progress',
        depth,
        nodesSearched: totalNodes,
        bestMove,
      } satisfies AIWorkerProgress);

      // If the search at this depth was very fast, we can go deeper
      // If it took a significant chunk of time, the next depth will likely exceed the limit
      const depthTime = performance.now() - startTime;
      if (depthTime > limit * 0.5 && depth >= 5) break;
    }

    const elapsed = performance.now() - startTime;
    self.postMessage({
      type: 'result',
      move: bestMove,
      nodesSearched: totalNodes,
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
