import { Board, Coordinate } from './index';
/**
 * AI difficulty levels for the Othello bot
 * - easy: Random valid move selection
 * - medium: 1-ply weighted positional evaluation
 * - hard: Iterative-deepening minimax with αβ, TT, and time budget
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';
export interface CalculateMoveOptions {
    /** Soft time budget in ms for hard search (enables iterative deepening) */
    timeLimitMs?: number;
    /** Optional progress callback after each completed ID depth */
    onDepthComplete?: (info: {
        depth: number;
        bestMove: Coordinate;
        nodesSearched: number;
    }) => void;
}
/**
 * OthelloBot — AI opponent with easy / medium / hard strategies.
 */
export declare class OthelloBot {
    private difficulty;
    private player;
    private transpositionTable;
    private nodesSearched;
    private useOpeningBook;
    private moveHistory;
    private searchDepth;
    private searchDeadline;
    private searchAborted;
    constructor(difficulty?: BotDifficulty, player?: 'W' | 'B');
    getDifficulty(): BotDifficulty;
    setDifficulty(difficulty: BotDifficulty): void;
    getPlayer(): 'W' | 'B';
    setPlayer(player: 'W' | 'B'): void;
    getNodesSearched(): number;
    setSearchDepth(depth: number): void;
    getSearchDepth(): number;
    clearTranspositionTable(): void;
    getTranspositionTableSize(): number;
    setUseOpeningBook(use: boolean): void;
    isOpeningBookEnabled(): boolean;
    /**
     * Calculates the best move for the current board state.
     *
     * @param board - Current game board
     * @param moveHistory - Optional history for opening-book lookup
     * @param options - Optional time limit / progress for hard ID search
     */
    calculateMove(board: Board, moveHistory?: Array<{
        coordinate: Coordinate;
    }>, options?: CalculateMoveOptions): Coordinate | null;
    private getRandomMove;
    /**
     * Medium: pick the move with the best 1-ply weighted evaluation (not raw flips).
     */
    private getWeightedOnePlyMove;
    private getHardMove;
    private iterativeDeepeningSearch;
    private searchRoot;
    private shouldAbort;
    private orderMoves;
    private getMoveOrderScore;
    private isCorner;
    private isXSquare;
    private isCSquare;
    private getAdjacentCorner;
    private getAdjacentCornerForC;
    private getBoardHash;
    private minimaxWithTT;
    private cloneBoard;
    /**
     * Apply a known-valid move using shared engine rules (pass handling included).
     */
    private simulateMove;
}
//# sourceMappingURL=OthelloBot.d.ts.map