import { Board, Coordinate } from './index';
/**
 * AI difficulty levels for the Othello bot
 * - easy: Random valid move selection
 * - medium: Greedy algorithm (maximizes immediate flips)
 * - hard: Minimax with alpha-beta pruning, move ordering, and transposition table
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';
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
 * **Hard**: Minimax with alpha-beta pruning + optimizations
 * - Move ordering (corners first, X-squares last)
 * - Transposition table (caches evaluated positions)
 * - Looks ahead 5 moves (depth 5)
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
export declare class OthelloBot {
    private difficulty;
    private player;
    private transpositionTable;
    private nodesSearched;
    private useOpeningBook;
    private moveHistory;
    private searchDepth;
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
    constructor(difficulty?: BotDifficulty, player?: 'W' | 'B');
    /**
     * Gets the current difficulty level
     *
     * @returns The bot's difficulty setting
     */
    getDifficulty(): BotDifficulty;
    /**
     * Changes the difficulty level
     *
     * @param difficulty - New difficulty level
     */
    setDifficulty(difficulty: BotDifficulty): void;
    /**
     * Gets which player (color) the bot controls
     *
     * @returns 'W' for White or 'B' for Black
     */
    getPlayer(): 'W' | 'B';
    /**
     * Changes which player the bot controls
     *
     * @param player - Player color ('W' or 'B')
     */
    setPlayer(player: 'W' | 'B'): void;
    /**
     * Gets the number of nodes searched in the last calculation
     * Useful for performance analysis
     *
     * @returns Number of positions evaluated
     */
    getNodesSearched(): number;
    /**
     * Sets the minimax search depth (for hard difficulty)
     * Higher depth = stronger play but slower computation
     *
     * @param depth - Search depth (1-12)
     */
    setSearchDepth(depth: number): void;
    /**
     * Gets the current search depth
     */
    getSearchDepth(): number;
    /**
     * Clears the transposition table
     * Call this when starting a new game
     */
    clearTranspositionTable(): void;
    /**
     * Gets the current transposition table size
     *
     * @returns Number of cached positions
     */
    getTranspositionTableSize(): number;
    /**
     * Calculates the best move for the current board state
     *
     * Uses the appropriate algorithm based on difficulty:
     * - Easy: Random selection
     * - Medium: Greedy (maximize immediate flips)
     * - Hard: Minimax with alpha-beta pruning, move ordering, and transposition table
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
    calculateMove(board: Board, moveHistory?: Array<{
        coordinate: Coordinate;
    }>): Coordinate | null;
    /**
     * Enable or disable opening book usage
     */
    setUseOpeningBook(use: boolean): void;
    /**
     * Check if opening book is enabled
     */
    isOpeningBookEnabled(): boolean;
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
    private getRandomMove;
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
    private getGreedyMove;
    /**
     * Hard difficulty: Minimax algorithm with alpha-beta pruning
     *
     * Looks ahead 5 moves and uses position-based evaluation.
     * Includes move ordering and transposition table for efficiency.
     *
     * Strategy:
     * 1. Order moves by strategic value (corners first, X-squares last)
     * 2. Check transposition table for cached evaluations
     * 3. Search game tree to depth 5
     * 4. Evaluate positions using:
     *    - Position weights (corners valuable, C/X squares dangerous)
     *    - Mobility (more available moves is better)
     *    - Disc count
     * 5. Use alpha-beta pruning to skip unnecessary branches
     * 6. Cache results in transposition table
     * 7. Choose move leading to best evaluated position
     *
     * @param board - Current game board
     * @param validMoves - Array of valid move coordinates
     * @returns Move with highest minimax evaluation
     * @throws Error if no valid moves available
     * @private
     */
    private getMinimaxMove;
    /**
     * Orders moves by strategic priority for better alpha-beta pruning
     *
     * Move ordering is critical for alpha-beta efficiency:
     * - Best moves first = more pruning = faster search
     * - Can improve search speed by 10-100x
     *
     * Priority order:
     * 1. Corners (highest value, always good)
     * 2. Edges (stable positions)
     * 3. Interior moves (neutral)
     * 4. C-squares (dangerous, but sometimes necessary)
     * 5. X-squares (most dangerous, avoid if possible)
     *
     * @param moves - Unordered array of valid moves
     * @param board - Current board state for context
     * @returns Moves sorted by strategic priority
     * @private
     */
    private orderMoves;
    /**
     * Calculates a priority score for move ordering
     *
     * Higher scores = searched first = better pruning if good move
     *
     * @param move - Move to score
     * @param board - Current board state
     * @returns Priority score (higher = search first)
     * @private
     */
    private getMoveOrderScore;
    /**
     * Checks if a move is a corner position
     * @private
     */
    private isCorner;
    /**
     * Checks if a move is an X-square (diagonal to corner)
     * @private
     */
    private isXSquare;
    /**
     * Checks if a move is a C-square (adjacent to corner on edge)
     * @private
     */
    private isCSquare;
    /**
     * Checks if a move is on an edge (excluding corners and C-squares)
     * @private
     */
    private isEdge;
    /**
     * Gets the corner adjacent to an X-square
     * @private
     */
    private getAdjacentCorner;
    /**
     * Gets the corner adjacent to a C-square
     * @private
     */
    private getAdjacentCornerForC;
    /**
     * Generates a hash key for the board state
     *
     * Used for transposition table lookup.
     * Format: string of 64 characters (E/B/W) + player turn
     *
     * @param board - Board to hash
     * @returns Unique string key for this position
     * @private
     */
    private getBoardHash;
    /**
     * Minimax with transposition table lookup
     *
     * Enhanced minimax that:
     * 1. Checks transposition table before searching
     * 2. Stores results after searching
     * 3. Uses move ordering for better pruning
     *
     * @param board - Current board state
     * @param depth - Remaining search depth
     * @param alpha - Alpha bound for pruning
     * @param beta - Beta bound for pruning
     * @param isMaximizing - Whether current player is maximizing
     * @returns Evaluated score for this position
     * @private
     */
    private minimaxWithTT;
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
    private evaluateScore;
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
    private evaluatePosition;
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
    private cloneBoard;
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
    private simulateMove;
}
//# sourceMappingURL=OthelloBot.d.ts.map