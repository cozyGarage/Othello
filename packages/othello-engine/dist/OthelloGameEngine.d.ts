import { Board, Coordinate, TileValue, Score } from './index';
import { TimeControlConfig, PlayerTime } from './TimeControlManager';
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
export type Player = 'W' | 'B';
export type GameEventType = 'move' | 'gameOver' | 'invalidMove' | 'stateChange';
export interface MoveEventData {
    move: Move;
    state: GameState;
}
export interface GameOverEventData {
    winner: Player | null;
    state: GameState;
}
export interface InvalidMoveEventData {
    coordinate: Coordinate;
    error: string;
}
export interface StateChangeEventData {
    state: GameState;
    action?: 'undo' | 'redo';
}
export type GameEventData = MoveEventData | GameOverEventData | InvalidMoveEventData | StateChangeEventData;
export interface GameEvent {
    type: GameEventType;
    data: GameEventData;
}
type EventListener = (event: GameEvent) => void;
/**
 * OthelloGameEngine - A framework-agnostic game engine for Othello/Reversi
 *
 * This class provides a complete implementation of Othello game logic with:
 * - Move validation and execution
 * - Game state management
 * - Move history tracking
 * - Undo/Redo functionality
 * - Event-driven architecture for UI integration
 * - Player management
 * - Game serialization/deserialization
 *
 * @example
 * ```typescript
 * const engine = new OthelloGameEngine('player1', 'player2');
 *
 * // Listen for game events
 * engine.on('move', (event) => {
 *   console.log('Move made:', event.data.move);
 * });
 *
 * // Make a move
 * const success = engine.makeMove([3, 2]);
 * ```
 */
export declare class OthelloGameEngine {
    private board;
    private moveHistory;
    private listeners;
    private blackPlayerId?;
    private whitePlayerId?;
    private timeControl?;
    private timeControlConfig?;
    private undoStack;
    private redoStack;
    /**
     * Creates a new Othello game engine
     * @param blackPlayerId - Optional ID for the black player
     * @param whitePlayerId - Optional ID for the white player
     * @param initialBoard - Optional initial board state (for loading saved games)
     * @param timeControlConfig - Optional time control configuration
     */
    constructor(blackPlayerId?: string, whitePlayerId?: string, initialBoard?: TileValue[][], timeControlConfig?: TimeControlConfig);
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
     * Evaluate the current board position for the Egaroucid-style graph
     * Returns a value from -64 to +64 representing disc advantage
     * Positive = Black advantage, Negative = White advantage
     *
     * Uses a weighted evaluation combining:
     * - Position value (corner control, edge stability)
     * - Mobility (available moves)
     * - Disc count
     *
     * @returns Evaluation score normalized to approximate disc difference
     */
    evaluatePosition(): number;
    /**
     * Get remaining time for both players
     * @returns Object with black and white time remaining, or null if time control is disabled
     */
    getTimeRemaining(): PlayerTime | null;
    /**
     * Pause the time control
     * Useful for game pauses or when switching away from the game
     */
    pauseTime(): void;
    /**
     * Resume the time control after pausing
     */
    resumeTime(): void;
    /**
     * Check if time control is enabled for this game
     * @returns true if time control is active
     */
    hasTimeControl(): boolean;
    /**
     * Restore time state (for page refresh recovery)
     * @param blackTime - Time remaining for black in milliseconds
     * @param whiteTime - Time remaining for white in milliseconds
     * @param currentPlayer - Current player whose clock should be running
     */
    restoreTimeState(blackTime: number, whiteTime: number, currentPlayer: 'B' | 'W'): void;
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