import { Board, Coordinate, getValidMoves, score, E } from './index';

/**
 * AI difficulty levels for the Othello bot
 * - easy: Random valid move selection
 * - medium: Greedy algorithm (maximizes immediate flips)
 * - hard: Minimax with alpha-beta pruning and position evaluation
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Position evaluation weights for the Minimax algorithm
 *
 * Strategic values for each board position:
 * - Corners (100): Most valuable, cannot be flipped
 * - Edge C-squares (-50): Dangerous, often lead to losing corners
 * - Edge X-squares (-20): Dangerous, adjacent to corners
 * - Edges (10): Moderately valuable, hard to flip
 * - Interior (-1 to 5): Less valuable, easily flipped
 *
 * This heuristic guides the AI towards strong positions and
 * away from weak ones during lookahead search.
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
 * Provides three difficulty levels with different strategies:
 *
 * **Easy**: Random selection from valid moves
 * - Unpredictable
 * - No strategic thinking
 * - Good for beginners
 *
 * **Medium**: Greedy algorithm
 * - Maximizes immediate disc flips
 * - Deterministic (same board → same move)
 * - Challenging for casual players
 *
 * **Hard**: Minimax with alpha-beta pruning
 * - Looks ahead 4 moves (depth 4)
 * - Position-based evaluation (corners valuable)
 * - Considers mobility (number of available moves)
 * - Should defeat most human players
 *
 * @example
 * ```typescript
 * // Create a hard AI playing as White
 * const bot = new OthelloBot('hard', 'W');
 *
 * // Get the AI's move
 * const move = bot.calculateMove(board);
 * if (move) {
 *   engine.makeMove(move);
 * }
 * ```
 */
export class OthelloBot {
  private difficulty: BotDifficulty;
  private player: 'W' | 'B';

  /**
   * Creates a new AI bot
   *
   * @param difficulty - AI difficulty level (easy/medium/hard)
   * @param player - Which color the bot plays as ('W' for White, 'B' for Black)
   *
   * @example
   * ```typescript
   * const easyBot = new OthelloBot('easy', 'W');
   * const hardBot = new OthelloBot('hard', 'B');
   * ```
   */
  constructor(difficulty: BotDifficulty = 'medium', player: 'W' | 'B' = 'W') {
    this.difficulty = difficulty;
    this.player = player;
  }

  /**
   * Gets the current difficulty level
   *
   * @returns The bot's difficulty setting
   */
  public getDifficulty(): BotDifficulty {
    return this.difficulty;
  }

  /**
   * Changes the difficulty level
   *
   * @param difficulty - New difficulty level
   */
  public setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Gets which player (color) the bot controls
   *
   * @returns 'W' for White or 'B' for Black
   */
  public getPlayer(): 'W' | 'B' {
    return this.player;
  }

  /**
   * Changes which player the bot controls
   *
   * @param player - Player color ('W' or 'B')
   */
  public setPlayer(player: 'W' | 'B'): void {
    this.player = player;
  }

  /**
   * Calculates the best move for the current board state
   *
   * Uses the appropriate algorithm based on difficulty:
   * - Easy: Random selection
   * - Medium: Greedy (maximize immediate flips)
   * - Hard: Minimax with alpha-beta pruning (depth 4)
   *
   * @param board - Current game board state
   * @returns Best move coordinate [x, y], or null if no valid moves exist
   *
   * @example
   * ```typescript
   * const bot = new OthelloBot('hard', 'W');
   * const move = bot.calculateMove(board);
   *
   * if (move) {
   *   const [x, y] = move;
   *   console.log(`AI chooses to play at (${x}, ${y})`);
   * } else {
   *   console.log('AI has no valid moves');
   * }
   * ```
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
   * Easy difficulty: Randomly selects from valid moves
   *
   * Provides unpredictable play with no strategic thinking.
   * Good for beginners to practice against.
   *
   * @param validMoves - Array of valid move coordinates
   * @returns Randomly selected move
   * @throws Error if no valid moves available
   * @private
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
   *
   * Selects the move that maximizes immediate disc flips.
   * Deterministic - always chooses the same move for the same board state.
   *
   * Strategy:
   * 1. Try each valid move
   * 2. Count resulting disc difference
   * 3. Choose move with highest immediate score gain
   *
   * @param board - Current game board
   * @param validMoves - Array of valid move coordinates
   * @returns Move that maximizes immediate score
   * @throws Error if no valid moves available
   * @private
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
   * Hard difficulty: Minimax algorithm with alpha-beta pruning
   *
   * Looks ahead 4 moves and uses position-based evaluation.
   * Considers both strategic position values and mobility (available moves).
   *
   * Strategy:
   * 1. Search game tree to depth 4
   * 2. Evaluate positions using:
   *    - Position weights (corners valuable, C/X squares dangerous)
   *    - Mobility (more available moves is better)
   *    - Disc count
   * 3. Use alpha-beta pruning to skip unnecessary branches
   * 4. Choose move leading to best evaluated position
   *
   * @param board - Current game board
   * @param validMoves - Array of valid move coordinates
   * @returns Move with highest minimax evaluation
   * @throws Error if no valid moves available
   * @private
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
   *
   * Recursively explores the game tree to find the best move.
   * Uses alpha-beta pruning to eliminate branches that cannot
   * affect the final decision, significantly improving performance.
   *
   * @param board - Current board state
   * @param depth - Remaining search depth (decreases with recursion)
   * @param alpha - Best score for maximizing player (pruning lower bound)
   * @param beta - Best score for minimizing player (pruning upper bound)
   * @param isMaximizing - true if maximizing player's turn, false for minimizing
   * @returns Evaluated score for this board position
   * @private
   *
   * Time complexity: O(b^d) where b is branching factor (~10) and d is depth (4)
   * Alpha-beta pruning can reduce this to O(b^(d/2)) in best case
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
   * Evaluates board position using only disc count
   *
   * Simple heuristic for greedy algorithm:
   * Returns positive if bot is winning, negative if losing.
   *
   * @param board - Board to evaluate
   * @returns Score difference from bot's perspective
   * @private
   */
  private evaluateScore(board: Board): number {
    const scores = score(board);
    return this.player === 'B' ? scores.black - scores.white : scores.white - scores.black;
  }

  /**
   * Evaluates board position using multiple heuristics
   *
   * Comprehensive evaluation for minimax algorithm combining:
   * 1. **Position Value**: Strategic importance of occupied squares
   *    - Corners: +100 (most valuable)
   *    - C-squares: -50 (dangerous, lead to losing corners)
   *    - Edges: +10 (stable)
   *    - Interior: -1 to +5 (less important)
   *
   * 2. **Mobility**: Number of available moves (×5 weight)
   *    - More moves = better position
   *    - Restricting opponent is valuable
   *
   * 3. **Disc Count**: Simple disc difference
   *    - Secondary consideration (can mislead early game)
   *
   * @param board - Board to evaluate
   * @returns Weighted score from bot's perspective
   * @private
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
   * Creates a deep copy of the board
   *
   * Necessary for lookahead search to avoid mutating the actual game state.
   * Copies both the tile array and the playerTurn property.
   *
   * @param board - Board to clone
   * @returns New board with copied state
   * @private
   */
  private cloneBoard(board: Board): Board {
    return {
      tiles: board.tiles.map((row) => [...row]),
      playerTurn: board.playerTurn,
    };
  }

  /**
   * Simulates a move on the board (mutates the board in place)
   *
   * Efficient move simulation for lookahead search.
   * Does NOT validate the move - assumes it's valid.
   *
   * Steps:
   * 1. Place piece at coordinate
   * 2. Check all 8 directions for opponent pieces to flip
   * 3. Flip captured pieces
   * 4. Switch to opponent's turn
   *
   * @param board - Board to modify (mutated in place)
   * @param coord - [x, y] coordinate for the move
   * @private
   *
   * Note: This is a simplified, optimized version used only for
   * AI lookahead. Does not emit events or update history.
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
      let nx = x + dx!;
      let ny = y + dy!;

      // Collect opponent pieces in this direction
      while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const targetRow = board.tiles[ny];
        const targetTile = targetRow ? targetRow[nx] : undefined;

        if (targetTile !== opponent) break;

        toFlip.push([nx, ny]);
        nx += dx!;
        ny += dy!;
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
