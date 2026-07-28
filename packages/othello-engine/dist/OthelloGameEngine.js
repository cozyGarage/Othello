import { createBoard, createStartingTiles, takeTurn, getValidMoves, isGameOver, getWinner, score, getAnnotatedBoard, B, W, } from './index';
import { TimeControlManager } from './TimeControlManager';
import { POSITION_WEIGHTS } from './positionWeights';
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
    constructor(blackPlayerId, whitePlayerId, initialBoard, timeControlConfig, initialPlayerTurn = B) {
        this.moveHistory = [];
        this.listeners = new Map();
        // Undo/Redo stacks
        this.undoStack = [];
        this.redoStack = [];
        /** True once a timeout loss has been declared (board may still look unfinished) */
        this.timeoutDeclared = false;
        this.blackPlayerId = blackPlayerId;
        this.whitePlayerId = whitePlayerId;
        // Store time control config for reset
        this.timeControlConfig = timeControlConfig;
        // Initialize time control if configured
        if (timeControlConfig) {
            this.timeControl = new TimeControlManager(timeControlConfig);
        }
        // Initialize with standard Othello starting position
        const startingBoard = initialBoard || createStartingTiles();
        this.board = createBoard(startingBoard, initialPlayerTurn);
        // Start the current player's clock if time control is enabled
        if (this.timeControl) {
            this.timeControl.startClock(initialPlayerTurn);
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
                    this.handleTimeoutLoss(currentPlayer);
                    this.emit('invalidMove', {
                        coordinate,
                        error: `${currentPlayer === 'B' ? 'Black' : 'White'} ran out of time!`,
                    });
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
    evaluatePosition() {
        const currentScore = score(this.board);
        const validMoves = getValidMoves(this.board);
        // Switch player temporarily to check opponent mobility
        const originalPlayer = this.board.playerTurn;
        this.board.playerTurn = this.board.playerTurn === 'B' ? 'W' : 'B';
        const opponentMoves = getValidMoves(this.board);
        this.board.playerTurn = originalPlayer;
        // Position value based on strategic importance (from Black's perspective)
        let positionValue = 0;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const row = this.board.tiles[y];
                const tile = row ? row[x] : undefined;
                const weightRow = POSITION_WEIGHTS[y];
                const weight = weightRow ? weightRow[x] : 0;
                if (tile === B) {
                    positionValue += weight ?? 0;
                }
                else if (tile === W) {
                    positionValue -= weight ?? 0;
                }
            }
        }
        // Mobility value (more moves = better)
        const myMoves = this.board.playerTurn === 'B' ? validMoves.length : opponentMoves.length;
        const theirMoves = this.board.playerTurn === 'B' ? opponentMoves.length : validMoves.length;
        const mobilityValue = (myMoves - theirMoves) * 3;
        // Simple disc difference
        const discDiff = currentScore.black - currentScore.white;
        // Combine: position is most important early, disc count matters more late game
        const totalPieces = currentScore.black + currentScore.white;
        const isEndgame = totalPieces > 50;
        if (isEndgame) {
            // In endgame, actual disc count matters more
            return Math.max(-64, Math.min(64, discDiff * 2));
        }
        // Normalize to -64 to +64 range
        // Position weight ranges from about -800 to +800, scale it down
        const normalizedEval = positionValue / 10 + mobilityValue + discDiff * 0.5;
        return Math.max(-64, Math.min(64, Math.round(normalizedEval)));
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
     * Attach, replace, or remove time control without recreating the engine.
     * Preserves the current board and move history.
     *
     * @param config - Time control config, or null/undefined to disable clocks
     */
    configureTimeControl(config) {
        this.timeoutDeclared = false;
        this.timeControlConfig = config ?? undefined;
        if (config) {
            this.timeControl = new TimeControlManager(config);
            if (!isGameOver(this.board)) {
                this.timeControl.startClock(this.board.playerTurn);
            }
        }
        else {
            this.timeControl = undefined;
        }
        this.emit('stateChange', { state: this.getState() });
    }
    /**
     * Restore time state (for page refresh recovery)
     * @param blackTime - Time remaining for black in milliseconds
     * @param whiteTime - Time remaining for white in milliseconds
     * @param currentPlayer - Current player whose clock should be running
     */
    restoreTimeState(blackTime, whiteTime, currentPlayer) {
        if (!this.timeControl)
            return;
        this.timeControl.setTimeRemaining('B', blackTime);
        this.timeControl.setTimeRemaining('W', whiteTime);
        this.timeControl.startClock(currentPlayer);
    }
    /**
     * If the active player's clock has expired, end the game on timeout.
     * Safe to call from UI tick intervals; no-ops when already over or time remains.
     * @returns true if a timeout loss was declared
     */
    checkTimeout() {
        if (!this.timeControl || this.timeoutDeclared || isGameOver(this.board)) {
            return false;
        }
        const currentPlayer = this.board.playerTurn;
        if (!this.timeControl.isTimeOut(currentPlayer)) {
            return false;
        }
        this.handleTimeoutLoss(currentPlayer);
        return true;
    }
    /**
     * Stop clocks and emit gameOver for a timeout loss by the given player.
     */
    handleTimeoutLoss(timedOutPlayer) {
        if (this.timeoutDeclared) {
            return;
        }
        this.timeoutDeclared = true;
        if (this.timeControl) {
            this.timeControl.stopClock();
        }
        const winner = timedOutPlayer === 'B' ? W : B;
        this.emit('gameOver', { winner, state: this.getState() });
    }
    /**
     * Reset the game to its initial state
     */
    reset() {
        this.board = createBoard(createStartingTiles());
        this.moveHistory = [];
        this.timeoutDeclared = false;
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
     * @throws Error if JSON is invalid or board shape is illegal
     */
    importState(stateJson) {
        let state;
        try {
            state = JSON.parse(stateJson);
        }
        catch {
            throw new Error('Invalid game state: malformed JSON');
        }
        if (!state || typeof state !== 'object') {
            throw new Error('Invalid game state: expected an object');
        }
        const parsed = state;
        if (!this.isValidImportedBoard(parsed.board)) {
            throw new Error('Invalid game state: board must be an 8x8 grid with B/W/E tiles');
        }
        if (parsed.moveHistory !== undefined && !Array.isArray(parsed.moveHistory)) {
            throw new Error('Invalid game state: moveHistory must be an array');
        }
        this.board = {
            playerTurn: parsed.board.playerTurn,
            tiles: parsed.board.tiles.map((row) => [...row]),
        };
        this.moveHistory = Array.isArray(parsed.moveHistory) ? parsed.moveHistory : [];
        this.blackPlayerId =
            typeof parsed.blackPlayerId === 'string' ? parsed.blackPlayerId : undefined;
        this.whitePlayerId =
            typeof parsed.whitePlayerId === 'string' ? parsed.whitePlayerId : undefined;
        this.undoStack = [];
        this.redoStack = [];
        this.timeoutDeclared = false;
        this.emit('stateChange', { state: this.getState() });
    }
    isValidImportedBoard(board) {
        if (!board || (board.playerTurn !== 'B' && board.playerTurn !== 'W')) {
            return false;
        }
        if (!Array.isArray(board.tiles) || board.tiles.length !== 8) {
            return false;
        }
        const validTiles = new Set(['B', 'W', 'E']);
        return board.tiles.every((row) => Array.isArray(row) &&
            row.length === 8 &&
            row.every((cell) => typeof cell === 'string' && validTiles.has(cell)));
    }
}
