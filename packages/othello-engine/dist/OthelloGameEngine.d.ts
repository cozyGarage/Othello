import { Board, Coordinate, TileValue, Score } from './index';
/**
 * Represents a single move in the game
 */
export interface Move {
    player: 'W' | 'B';
    coordinate: Coordinate;
    timestamp: number;
    scoreAfter: Score;
}
/**
 * Represents the current state of the game
 */
export interface GameState {
    board: Board;
    score: Score;
    validMoves: Coordinate[];
    isGameOver: boolean;
    winner: 'W' | 'B' | null;
    moveHistory: Move[];
    currentPlayer: 'W' | 'B';
    blackPlayerId?: string;
    whitePlayerId?: string;
}
/**
 * Event types that the engine can emit
 */
export type GameEventType = 'move' | 'gameOver' | 'invalidMove' | 'stateChange';
export interface GameEvent {
    type: GameEventType;
    data: any;
}
type EventListener = (event: GameEvent) => void;
export declare class OthelloGameEngine {
    private board;
    private moveHistory;
    private listeners;
    private blackPlayerId?;
    private whitePlayerId?;
    private undoStack;
    private redoStack;
    /**
     * Creates a new Othello game engine
     * @param blackPlayerId - Optional ID for the black player
     * @param whitePlayerId - Optional ID for the white player
     * @param initialBoard - Optional initial board state (for loading saved games)
     */
    constructor(blackPlayerId?: string, whitePlayerId?: string, initialBoard?: TileValue[][]);
    /**
     * Create a deep clone of the board for snapshot
     */
    private cloneBoard;
    /**
     * Create a snapshot of the entire game state
     */
    private createSnapshot;
    /**
     * Restore game state from a snapshot
     */
    private restoreSnapshot;
    /**
     * Subscribe to game events
     * @param eventType - The type of event to listen for
     * @param listener - Callback function to handle the event
     */
    on(eventType: GameEventType, listener: EventListener): void;
    /**
     * Unsubscribe from game events
     * @param eventType - The type of event to stop listening for
     * @param listener - The callback function to remove
     */
    off(eventType: GameEventType, listener: EventListener): void;
    /**
     * Emit an event to all registered listeners
     */
    private emit;
    /**
     * Make a move on the board
     * @param coordinate - The [x, y] coordinate to place a piece
     * @returns true if the move was successful, false otherwise
     */
    makeMove(coordinate: Coordinate): boolean;
    /**
     * Undo the last move
     * @returns true if undo was successful, false if nothing to undo
     */
    undo(): boolean;
    /**
     * Redo a previously undone move
     * @returns true if redo was successful, false if nothing to redo
     */
    redo(): boolean;
    /**
     * Check if undo is available
     * @returns true if there are moves to undo
     */
    canUndo(): boolean;
    /**
     * Check if redo is available
     * @returns true if there are moves to redo
     */
    canRedo(): boolean;
    /**
     * Get the current game state
     * @returns Complete game state including board, score, history, etc.
     */
    getState(): GameState;
    /**
     * Get the board with valid moves annotated
     * @returns Board with 'P' markers showing valid moves
     */
    getAnnotatedBoard(): Board;
    /**
     * Get the move history
     * @returns Array of all moves made in the game
     */
    getMoveHistory(): Move[];
    /**
     * Get the current score
     * @returns Current score for both players
     */
    getScore(): Score;
    /**
     * Get all valid moves for the current player
     * @returns Array of valid coordinates
     */
    getValidMoves(): Coordinate[];
    /**
     * Check if the game is over
     * @returns true if the game has ended
     */
    isGameOver(): boolean;
    /**
     * Get the winner (only valid if game is over)
     * @returns 'W', 'B', or null for a tie
     */
    getWinner(): 'W' | 'B' | null;
    /**
     * Reset the game to its initial state
     */
    reset(): void;
    /**
     * Get the player ID for a given color
     * @param color - 'W' or 'B'
     * @returns The player ID, or undefined if not set
     */
    getPlayerId(color: 'W' | 'B'): string | undefined;
    /**
     * Export the game state as JSON (for saving/loading)
     * @returns JSON string of the complete game state
     */
    exportState(): string;
    /**
     * Import a saved game state
     * @param stateJson - JSON string from exportState()
     */
    importState(stateJson: string): void;
}
export {};
//# sourceMappingURL=OthelloGameEngine.d.ts.map