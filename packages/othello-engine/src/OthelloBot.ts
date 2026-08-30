import { Board, Coordinate, getValidMoves, takeTurn, E } from './index';
import { lookupOpeningBook } from './openingBook';
import { CORNER_COORDINATES } from './positionWeights';
import {
  countEmptySquares,
  evaluateBoardForPlayer,
  exactTerminalScore,
  EXACT_ENDGAME_EMPTIES,
  staticMoveOrderScore,
} from './evaluateBoard';

/**
 * AI difficulty levels for the Othello bot
 * - easy: Random valid move selection
 * - medium: 1-ply weighted positional evaluation
 * - hard: Iterative-deepening minimax with αβ, TT, and time budget
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';

const CORNERS: Coordinate[] = CORNER_COORDINATES.map(([x, y]) => [x, y] as Coordinate);

interface TranspositionEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
  bestMove?: Coordinate;
}

const MAX_TT_SIZE = 100000;

export interface CalculateMoveOptions {
  /** Soft time budget in ms for hard search (enables iterative deepening) */
  timeLimitMs?: number;
  /** Optional progress callback after each completed ID depth */
  onDepthComplete?: (info: { depth: number; bestMove: Coordinate; nodesSearched: number }) => void;
}

/**
 * OthelloBot — AI opponent with easy / medium / hard strategies.
 */
export class OthelloBot {
  private difficulty: BotDifficulty;
  private player: 'W' | 'B';
  private transpositionTable: Map<string, TranspositionEntry>;
  private nodesSearched: number = 0;
  private useOpeningBook: boolean = true;
  private moveHistory: Array<{ coordinate: Coordinate }> = [];
  private searchDepth: number = 5;
  private searchDeadline: number | null = null;
  private searchAborted = false;

  constructor(difficulty: BotDifficulty = 'medium', player: 'W' | 'B' = 'W') {
    this.difficulty = difficulty;
    this.player = player;
    this.transpositionTable = new Map();
  }

  public getDifficulty(): BotDifficulty {
    return this.difficulty;
  }

  public setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
  }

  public getPlayer(): 'W' | 'B' {
    return this.player;
  }

  public setPlayer(player: 'W' | 'B'): void {
    this.player = player;
  }

  public getNodesSearched(): number {
    return this.nodesSearched;
  }

  public setSearchDepth(depth: number): void {
    this.searchDepth = Math.max(1, Math.min(12, depth));
  }

  public getSearchDepth(): number {
    return this.searchDepth;
  }

  public clearTranspositionTable(): void {
    this.transpositionTable.clear();
  }

  public getTranspositionTableSize(): number {
    return this.transpositionTable.size;
  }

  public setUseOpeningBook(use: boolean): void {
    this.useOpeningBook = use;
  }

  public isOpeningBookEnabled(): boolean {
    return this.useOpeningBook;
  }

  /**
   * Calculates the best move for the current board state.
   *
   * @param board - Current game board
   * @param moveHistory - Optional history for opening-book lookup
   * @param options - Optional time limit / progress for hard ID search
   */
  public calculateMove(
    board: Board,
    moveHistory?: Array<{ coordinate: Coordinate }>,
    options?: CalculateMoveOptions
  ): Coordinate | null {
    this.nodesSearched = 0;
    this.searchAborted = false;
    this.searchDeadline = null;

    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) {
      return null;
    }

    if (moveHistory) {
      this.moveHistory = moveHistory;
    }

    if (this.useOpeningBook && this.difficulty === 'hard' && this.moveHistory.length < 12) {
      const bookMove = lookupOpeningBook(this.moveHistory);
      if (bookMove) {
        const isValid = validMoves.some((m) => m[0] === bookMove[0] && m[1] === bookMove[1]);
        if (isValid) {
          return bookMove;
        }
      }
    }

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(validMoves);
      case 'medium':
        return this.getWeightedOnePlyMove(board, validMoves);
      case 'hard':
        return this.getHardMove(board, validMoves, options);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  private getRandomMove(validMoves: Coordinate[]): Coordinate {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const move = validMoves[randomIndex];
    if (!move) {
      throw new Error('No valid moves available');
    }
    return move;
  }

  /**
   * Medium: pick the move with the best 1-ply weighted evaluation (not raw flips).
   */
  private getWeightedOnePlyMove(board: Board, validMoves: Coordinate[]): Coordinate {
    const firstMove = validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    let bestMove = firstMove;
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);
      const moveScore = evaluateBoardForPlayer(clonedBoard, this.player);
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getHardMove(
    board: Board,
    validMoves: Coordinate[],
    options?: CalculateMoveOptions
  ): Coordinate {
    const only = validMoves[0];
    if (validMoves.length === 1 && only) {
      return only;
    }

    const timeLimit = options?.timeLimitMs;
    if (timeLimit && timeLimit > 0) {
      return this.iterativeDeepeningSearch(board, validMoves, timeLimit, options?.onDepthComplete);
    }

    return this.searchRoot(board, validMoves, this.searchDepth);
  }

  private iterativeDeepeningSearch(
    board: Board,
    validMoves: Coordinate[],
    timeLimitMs: number,
    onDepthComplete?: CalculateMoveOptions['onDepthComplete']
  ): Coordinate {
    const start = Date.now();
    this.searchDeadline = start + timeLimitMs;
    const empties = countEmptySquares(board);
    const maxDepth = empties <= EXACT_ENDGAME_EMPTIES ? Math.min(12, empties + 2) : 10;

    const ordered = this.orderMoves(validMoves, board);
    let bestMove = ordered[0] ?? validMoves[0];
    if (!bestMove) {
      throw new Error('No valid moves available');
    }
    let completedDepth = 0;

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (Date.now() - start >= timeLimitMs * 0.95) break;

      this.searchAborted = false;
      const move = this.searchRoot(board, validMoves, depth);

      if (!this.searchAborted || completedDepth === 0) {
        bestMove = move;
        completedDepth = depth;
        onDepthComplete?.({
          depth,
          bestMove,
          nodesSearched: this.nodesSearched,
        });
      }

      // If we nearly used the budget, stop before exploding the next ply
      if (Date.now() - start > timeLimitMs * 0.7 && depth >= 4) break;
    }

    this.searchDeadline = null;
    this.searchAborted = false;
    return bestMove;
  }

  private searchRoot(board: Board, validMoves: Coordinate[], depth: number): Coordinate {
    const orderedMoves = this.orderMoves(validMoves, board);
    const firstMove = orderedMoves[0] ?? validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    let bestMove = firstMove;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of orderedMoves) {
      if (this.shouldAbort()) break;

      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);

      const moveScore = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }

      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }

  private shouldAbort(): boolean {
    if (this.searchDeadline !== null && Date.now() >= this.searchDeadline) {
      this.searchAborted = true;
      return true;
    }
    return false;
  }

  private orderMoves(moves: Coordinate[], board: Board): Coordinate[] {
    const hash = this.getBoardHash(board);
    const ttBest = this.transpositionTable.get(hash)?.bestMove;

    const scored = moves.map((move) => ({
      move,
      score:
        (ttBest && move[0] === ttBest[0] && move[1] === ttBest[1] ? 10_000 : 0) +
        staticMoveOrderScore(move, board, this.player) +
        this.getMoveOrderScore(move, board),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.move);
  }

  private getMoveOrderScore(move: Coordinate, board: Board): number {
    // Extra corner / X / C nuance beyond staticMoveOrderScore
    if (this.isCorner(move)) return 50;

    if (this.isXSquare(move)) {
      const adjacentCorner = this.getAdjacentCorner(move);
      if (adjacentCorner) {
        const [cx, cy] = adjacentCorner;
        if (board.tiles[cy]?.[cx] === this.player) return 20;
      }
      return -20;
    }

    if (this.isCSquare(move)) {
      const adjacentCorner = this.getAdjacentCornerForC(move);
      if (adjacentCorner) {
        const [cx, cy] = adjacentCorner;
        if (board.tiles[cy]?.[cx] === this.player) return 10;
      }
      return -10;
    }

    return 0;
  }

  private isCorner(move: Coordinate): boolean {
    return CORNERS.some(([cx, cy]) => move[0] === cx && move[1] === cy);
  }

  private isXSquare(move: Coordinate): boolean {
    return (
      (move[0] === 1 && move[1] === 1) ||
      (move[0] === 1 && move[1] === 6) ||
      (move[0] === 6 && move[1] === 1) ||
      (move[0] === 6 && move[1] === 6)
    );
  }

  private isCSquare(move: Coordinate): boolean {
    const [x, y] = move;
    return (
      (x === 0 && y === 1) ||
      (x === 1 && y === 0) ||
      (x === 0 && y === 6) ||
      (x === 1 && y === 7) ||
      (x === 6 && y === 0) ||
      (x === 7 && y === 1) ||
      (x === 6 && y === 7) ||
      (x === 7 && y === 6)
    );
  }

  private getAdjacentCorner(xSquare: Coordinate): Coordinate | null {
    const [x, y] = xSquare;
    if (x === 1 && y === 1) return [0, 0];
    if (x === 1 && y === 6) return [0, 7];
    if (x === 6 && y === 1) return [7, 0];
    if (x === 6 && y === 6) return [7, 7];
    return null;
  }

  private getAdjacentCornerForC(cSquare: Coordinate): Coordinate | null {
    const [x, y] = cSquare;
    if ((x === 0 && y === 1) || (x === 1 && y === 0)) return [0, 0];
    if ((x === 0 && y === 6) || (x === 1 && y === 7)) return [0, 7];
    if ((x === 6 && y === 0) || (x === 7 && y === 1)) return [7, 0];
    if ((x === 6 && y === 7) || (x === 7 && y === 6)) return [7, 7];
    return null;
  }

  private getBoardHash(board: Board): string {
    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        hash += board.tiles[y]?.[x] ?? E;
      }
    }
    return hash + board.playerTurn;
  }

  private minimaxWithTT(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    this.nodesSearched++;

    if (this.shouldAbort()) {
      return evaluateBoardForPlayer(board, this.player);
    }

    const hash = this.getBoardHash(board);
    const ttEntry = this.transpositionTable.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'exact') return ttEntry.score;
      if (ttEntry.flag === 'lower') alpha = Math.max(alpha, ttEntry.score);
      else if (ttEntry.flag === 'upper') beta = Math.min(beta, ttEntry.score);
      if (alpha >= beta) return ttEntry.score;
    }

    const validMoves = getValidMoves(board);

    // Terminal: game over or no moves at this node
    if (validMoves.length === 0) {
      // Pass already handled in simulateMove; empty moves ⇒ evaluate terminal/heuristic
      return exactTerminalScore(board, this.player);
    }

    if (depth === 0) {
      return evaluateBoardForPlayer(board, this.player);
    }

    const orderedMoves = this.orderMoves(validMoves, board);
    const originalAlpha = alpha;
    let bestScore: number;
    let bestMove: Coordinate | undefined;

    if (isMaximizing) {
      bestScore = -Infinity;
      for (const move of orderedMoves) {
        if (this.shouldAbort()) break;
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);
        const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);
        if (evaluation > bestScore) {
          bestScore = evaluation;
          bestMove = move;
        }
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    } else {
      bestScore = Infinity;
      for (const move of orderedMoves) {
        if (this.shouldAbort()) break;
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);
        const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, true);
        if (evaluation < bestScore) {
          bestScore = evaluation;
          bestMove = move;
        }
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }

    if (!this.searchAborted && this.transpositionTable.size < MAX_TT_SIZE) {
      let flag: 'exact' | 'lower' | 'upper';
      if (bestScore <= originalAlpha) flag = 'upper';
      else if (bestScore >= beta) flag = 'lower';
      else flag = 'exact';

      this.transpositionTable.set(hash, {
        depth,
        score: bestScore,
        flag,
        bestMove,
      });
    }

    return bestScore;
  }

  private cloneBoard(board: Board): Board {
    return {
      tiles: board.tiles.map((row) => [...row]),
      playerTurn: board.playerTurn,
    };
  }

  /**
   * Apply a known-valid move using shared engine rules (pass handling included).
   */
  private simulateMove(board: Board, coord: Coordinate): void {
    takeTurn(board, coord);
  }
}
