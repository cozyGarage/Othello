import { createBoard, takeTurn, getValidMoves, isGameOver, getWinner, score, getAnnotatedBoard, B, W, E, } from './index';
import { TimeControlManager, } from './TimeControlManager';
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
export class OthelloGameEngine {
    /**
     * Creates a new Othello game engine
     * @param blackPlayerId - Optional ID for the black player
     * @param whitePlayerId - Optional ID for the white player
     * @param initialBoard - Optional initial board state (for loading saved games)
     * @param timeControlConfig - Optional time control configuration
     */
    constructor(blackPlayerId, whitePlayerId, initialBoard, timeControlConfig) {
        this.moveHistory = [];
        this.listeners = new Map();
        // Undo/Redo stacks
        this.undoStack = [];
        this.redoStack = [];
        this.blackPlayerId = blackPlayerId;
        this.whitePlayerId = whitePlayerId;
        // Store time control config for reset
        this.timeControlConfig = timeControlConfig;
        // Initialize time control if configured
        if (timeControlConfig) {
            this.timeControl = new TimeControlManager(timeControlConfig);
        }
        // Initialize with standard Othello starting position
        const startingBoard = initialBoard || [
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, W, B, E, E, E],
            [E, E, E, B, W, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
        ];
        this.board = createBoard(startingBoard);
        // Start black's clock if time control is enabled
        if (this.timeControl) {
            this.timeControl.startClock('B');
        }
    }
    /**
     * Create a deep clone of the board for snapshot
     */
    cloneBoard(board) {
        return {
            tiles: board.tiles.map((row) => [...row]),
            playerTurn: board.playerTurn,
        };
    }
    /**
     * Create a snapshot of the entire game state
     */
    createSnapshot() {
        return {
            board: this.cloneBoard(this.board),
            moveHistory: [...this.moveHistory],
            timeControlState: this.timeControl ? this.timeControl.exportState() : undefined,
        };
    }
    /**
     * Restore game state from a snapshot
     */
    restoreSnapshot(snapshot) {
        this.board.tiles = snapshot.board.tiles.map((row) => [...row]);
        this.board.playerTurn = snapshot.board.playerTurn;
        this.moveHistory = [...snapshot.moveHistory];
        // Restore time control state if available
        if (this.timeControl && snapshot.timeControlState) {
            this.timeControl.importState(snapshot.timeControlState);
        }
    }
    /**
     * Subscribe to game events
     * @param eventType - The type of event to listen for
     * @param listener - Callback function to handle the event
     */
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        // Avoid non-null assertion by ensuring the array exists and then pushing
        let list = this.listeners.get(eventType);
        if (!list) {
            list = [];
            this.listeners.set(eventType, list);
        }
        list.push(listener);
    }
    /**
     * Unsubscribe from game events
     * @param eventType - The type of event to stop listening for
     * @param listener - The callback function to remove
     */
    off(eventType, listener) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Emit an event to all registered listeners
     */
    emit(eventType, data) {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            listeners.forEach((listener) => listener({ type: eventType, data }));
        }
    }
    /**
     * Make a move on the board
     * @param coordinate - The [x, y] coordinate to place a piece
     * @returns true if the move was successful, false otherwise
     */
    makeMove(coordinate) {
        try {
            const currentPlayer = this.board.playerTurn;
            // Check for timeout if time control is enabled
            if (this.timeControl) {
                if (this.timeControl.isTimeOut(currentPlayer)) {
                    this.emit('invalidMove', {
                        coordinate,
                        error: `${currentPlayer === 'B' ? 'Black' : 'White'} ran out of time!`
                    });
                    // Emit game over due to timeout
                    const winner = currentPlayer === 'B' ? W : B;
                    this.emit('gameOver', { winner, state: this.getState() });
                    return false;
                }
            }
            // Save current state to undo stack BEFORE making the move
            this.undoStack.push(this.createSnapshot());
            // Clear redo stack when a new move is made
            this.redoStack = [];
            // Attempt the move
            takeTurn(this.board, coordinate);
            // Stop clock for current player and add increment
            if (this.timeControl) {
                this.timeControl.stopClock();
            }
            // Record the move in history
            const move = {
                player: currentPlayer,
                coordinate,
                timestamp: Date.now(),
                scoreAfter: score(this.board),
            };
            this.moveHistory.push(move);
            // Start clock for next player
            if (this.timeControl) {
                const nextPlayer = this.board.playerTurn;
                this.timeControl.startClock(nextPlayer);
            }
            // Emit events
            this.emit('move', { move, state: this.getState() });
            this.emit('stateChange', { state: this.getState() });
            // Check if game is over
            if (isGameOver(this.board)) {
                const winner = getWinner(this.board);
                // Stop time control when game ends
                if (this.timeControl) {
                    this.timeControl.stopClock();
                }
                this.emit('gameOver', { winner, state: this.getState() });
            }
            return true;
        }
        catch (error) {
            // Remove the snapshot we just added since move failed
            this.undoStack.pop();
            this.emit('invalidMove', { coordinate, error: error.message });
            return false;
        }
    }
    /**
     * Undo the last move
     * @returns true if undo was successful, false if nothing to undo
     */
    undo() {
        if (this.undoStack.length === 0) {
            return false;
        }
        // Pause time control during undo
        if (this.timeControl) {
            this.timeControl.pause();
        }
        // Save current state to redo stack
        this.redoStack.push(this.createSnapshot());
        // Restore previous state
        const previousState = this.undoStack.pop();
        if (previousState) {
            this.restoreSnapshot(previousState);
        }
        // Resume time control for current player
        if (this.timeControl && !isGameOver(this.board)) {
            this.timeControl.resume();
        }
        // Emit state change event
        this.emit('stateChange', { state: this.getState(), action: 'undo' });
        return true;
    }
    /**
     * Redo a previously undone move
     * @returns true if redo was successful, false if nothing to redo
     */
    redo() {
        if (this.redoStack.length === 0) {
            return false;
        }
        // Pause time control during redo
        if (this.timeControl) {
            this.timeControl.pause();
        }
        // Save current state to undo stack
        this.undoStack.push(this.createSnapshot());
        // Restore redo state
        const redoState = this.redoStack.pop();
        if (redoState) {
            this.restoreSnapshot(redoState);
        }
        // Resume time control for current player
        if (this.timeControl && !isGameOver(this.board)) {
            this.timeControl.resume();
        }
        // Emit state change event
        this.emit('stateChange', { state: this.getState(), action: 'redo' });
        return true;
    }
    /**
     * Check if undo is available
     * @returns true if there are moves to undo
     */
    canUndo() {
        return this.undoStack.length > 0;
    }
    /**
     * Check if redo is available
     * @returns true if there are moves to redo
     */
    canRedo() {
        return this.redoStack.length > 0;
    }
    /**
     * Get the current game state
     * @returns Complete game state including board, score, history, etc.
     */
    getState() {
        return {
            board: this.board,
            score: score(this.board),
            validMoves: getValidMoves(this.board),
            isGameOver: isGameOver(this.board),
            winner: isGameOver(this.board) ? getWinner(this.board) : null,
            moveHistory: [...this.moveHistory],
            currentPlayer: this.board.playerTurn,
            blackPlayerId: this.blackPlayerId,
            whitePlayerId: this.whitePlayerId,
        };
    }
    /**
     * Get the board with valid moves annotated
     * @returns Board with 'P' markers showing valid moves
     */
    getAnnotatedBoard() {
        return getAnnotatedBoard(this.board);
    }
    /**
     * Get the move history
     * @returns Array of all moves made in the game
     */
    getMoveHistory() {
        return [...this.moveHistory];
    }
    /**
     * Get the current score
     * @returns Current score for both players
     */
    getScore() {
        return score(this.board);
    }
    /**
     * Get all valid moves for the current player
     * @returns Array of valid coordinates
     */
    getValidMoves() {
        return getValidMoves(this.board);
    }
    /**
     * Check if the game is over
     * @returns true if the game has ended
     */
    isGameOver() {
        return isGameOver(this.board);
    }
    /**
     * Get the winner (only valid if game is over)
     * @returns 'W', 'B', or null for a tie
     */
    getWinner() {
        return isGameOver(this.board) ? getWinner(this.board) : null;
    }
    /**
     * Get remaining time for both players
     * @returns Object with black and white time remaining, or null if time control is disabled
     */
    getTimeRemaining() {
        return this.timeControl ? this.timeControl.getTimeRemaining() : null;
    }
    /**
     * Pause the time control
     * Useful for game pauses or when switching away from the game
     */
    pauseTime() {
        if (this.timeControl) {
            this.timeControl.pause();
        }
    }
    /**
     * Resume the time control after pausing
     */
    resumeTime() {
        if (this.timeControl && !isGameOver(this.board)) {
            this.timeControl.resume();
        }
    }
    /**
     * Check if time control is enabled for this game
     * @returns true if time control is active
     */
    hasTimeControl() {
        return !!this.timeControl;
    }
    /**
     * Reset the game to its initial state
     */
    reset() {
        const startingBoard = [
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, W, B, E, E, E],
            [E, E, E, B, W, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
            [E, E, E, E, E, E, E, E],
        ];
        this.board = createBoard(startingBoard);
        this.moveHistory = [];
        // Clear undo/redo stacks
        this.undoStack = [];
        this.redoStack = [];
        // Reset time control if enabled
        if (this.timeControlConfig) {
            this.timeControl = new TimeControlManager(this.timeControlConfig);
            this.timeControl.startClock('B'); // Start black's clock
        }
        this.emit('stateChange', { state: this.getState() });
    }
    /**
     * Get the player ID for a given color
     * @param color - 'W' or 'B'
     * @returns The player ID, or undefined if not set
     */
    getPlayerId(color) {
        return color === 'B' ? this.blackPlayerId : this.whitePlayerId;
    }
    /**
     * Export the game state as JSON (for saving/loading)
     * @returns JSON string of the complete game state
     */
    exportState() {
        return JSON.stringify({
            board: this.board,
            moveHistory: this.moveHistory,
            blackPlayerId: this.blackPlayerId,
            whitePlayerId: this.whitePlayerId,
        });
    }
    /**
     * Import a saved game state
     * @param stateJson - JSON string from exportState()
     */
    importState(stateJson) {
        const state = JSON.parse(stateJson);
        this.board = state.board;
        this.moveHistory = state.moveHistory;
        this.blackPlayerId = state.blackPlayerId;
        this.whitePlayerId = state.whitePlayerId;
        this.emit('stateChange', { state: this.getState() });
    }
}
