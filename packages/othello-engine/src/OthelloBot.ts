import { Board, Coordinate, getValidMoves, score, E } from './index';

/**
 * AI difficulty levels
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Position evaluation weights for the Minimax algorithm
 */
const POSITION_WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
];

/**
 * OthelloBot - AI opponent for Othello game
 *
 * Provides three difficulty levels:
 * - Easy: Random valid move selection
 * - Medium: Greedy algorithm (maximizes immediate score)
 * - Hard: Minimax with alpha-beta pruning and position evaluation
 */
export class OthelloBot {
  private difficulty: BotDifficulty;
  private player: 'W' | 'B';

  /**
   * Create a new bot
   * @param difficulty - AI difficulty level
   * @param player - Which player the bot controls ('W' or 'B')
   */
  constructor(difficulty: BotDifficulty = 'medium', player: 'W' | 'B' = 'W') {
    this.difficulty = difficulty;
    this.player = player;
  }

  /**
   * Get the difficulty level
   */
  public getDifficulty(): BotDifficulty {
    return this.difficulty;
  }

  /**
   * Set the difficulty level
   */
  public setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Get which player the bot controls
   */
  public getPlayer(): 'W' | 'B' {
    return this.player;
  }

  /**
   * Set which player the bot controls
   */
  public setPlayer(player: 'W' | 'B'): void {
    this.player = player;
  }

  /**
   * Calculate the best move for the current board state
   * @param board - Current game board
   * @returns Best move coordinate, or null if no valid moves
   */
  public calculateMove(board: Board): Coordinate | null {
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) {
      return null;
    }

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(validMoves);
      case 'medium':
        return this.getGreedyMove(board, validMoves);
      case 'hard':
        return this.getMinimaxMove(board, validMoves);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  /**
   * Easy difficulty: Random move selection
   */
  private getRandomMove(validMoves: Coordinate[]): Coordinate {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const move = validMoves[randomIndex];
    if (!move) {
      throw new Error('No valid moves available');
    }
    return move;
  }

  /**
   * Medium difficulty: Greedy algorithm
   * Selects the move that maximizes immediate score gain
   */
  private getGreedyMove(board: Board, validMoves: Coordinate[]): Coordinate {
    const firstMove = validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    let bestMove = firstMove;
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);

      const moveScore = this.evaluateScore(clonedBoard);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Hard difficulty: Minimax with alpha-beta pruning
   * Looks ahead several moves and uses position evaluation
   */
  private getMinimaxMove(board: Board, validMoves: Coordinate[]): Coordinate {
    const depth = 4; // Look ahead 4 moves
    const firstMove = validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    let bestMove = firstMove;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of validMoves) {
      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);

      const moveScore = this.minimax(clonedBoard, depth - 1, alpha, beta, false);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }

      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   * @param board - Current board state
   * @param depth - Remaining search depth
   * @param alpha - Alpha value for pruning
   * @param beta - Beta value for pruning
   * @param isMaximizing - Whether this is a maximizing or minimizing node
   */
  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const validMoves = getValidMoves(board);

    // Terminal conditions
    if (depth === 0 || validMoves.length === 0) {
      return this.evaluatePosition(board);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;

      for (const move of validMoves) {
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);

        const evaluation = this.minimax(clonedBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }

      return maxEval;
    } else {
      let minEval = Infinity;

      for (const move of validMoves) {
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);

        const evaluation = this.minimax(clonedBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }

      return minEval;
    }
  }

  /**
   * Evaluate position using disc count only (for greedy algorithm)
   */
  private evaluateScore(board: Board): number {
    const scores = score(board);
    return this.player === 'B' ? scores.black - scores.white : scores.white - scores.black;
  }

  /**
   * Evaluate position using multiple heuristics (for minimax)
   * Combines disc count, position weights, and mobility
   */
  private evaluatePosition(board: Board): number {
    const scores = score(board);
    const validMoves = getValidMoves(board);

    // Switch player to check opponent mobility
    const originalPlayer = board.playerTurn;
    board.playerTurn = board.playerTurn === 'B' ? 'W' : 'B';
    const opponentMoves = getValidMoves(board);
    board.playerTurn = originalPlayer;

    // Position value based on strategic importance
    let positionValue = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const row = board.tiles[y];
        const tile = row ? row[x] : undefined;
        const weightRow = POSITION_WEIGHTS[y];
        const weight = weightRow ? weightRow[x] : 0;

        if (tile === this.player) {
          positionValue += weight ?? 0;
        } else if (tile !== E && tile !== undefined) {
          positionValue -= weight ?? 0;
        }
      }
    }

    // Mobility value (more moves is better)
    const mobilityValue =
      board.playerTurn === this.player
        ? (validMoves.length - opponentMoves.length) * 5
        : (opponentMoves.length - validMoves.length) * 5;

    // Disc count value
    const discValue =
      this.player === 'B' ? scores.black - scores.white : scores.white - scores.black;

    // Weighted combination of all factors
    return positionValue + mobilityValue + discValue;
  }

  /**
   * Deep clone a board
   */
  private cloneBoard(board: Board): Board {
    return {
      tiles: board.tiles.map((row) => [...row]),
      playerTurn: board.playerTurn,
    };
  }

  /**
   * Simulate a move on a board (mutates the board)
   * This is a simplified version that doesn't validate
   */
  private simulateMove(board: Board, coord: Coordinate): void {
    const [x, y] = coord;
    const row = board.tiles[y];
    if (!row) return;

    row[x] = board.playerTurn;

    // Flip pieces in all 8 directions
    const directions = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    const currentPlayer = board.playerTurn;
    const opponent = currentPlayer === 'B' ? 'W' : 'B';

    for (const [dx, dy] of directions) {
      const toFlip: Coordinate[] = [];
      let nx = x + dx;
      let ny = y + dy;

      // Collect opponent pieces in this direction
      while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const targetRow = board.tiles[ny];
        const targetTile = targetRow ? targetRow[nx] : undefined;

        if (targetTile !== opponent) break;

        toFlip.push([nx, ny]);
        nx += dx;
        ny += dy;
      }

      // If we end on our own piece, flip all collected pieces
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const endRow = board.tiles[ny];
        const endTile = endRow ? endRow[nx] : undefined;

        if (endTile === currentPlayer && toFlip.length > 0) {
          for (const [fx, fy] of toFlip) {
            const flipRow = board.tiles[fy];
            if (flipRow) {
              flipRow[fx] = currentPlayer;
            }
          }
        }
      }
    }

    // Switch player
    board.playerTurn = opponent;
  }
}
