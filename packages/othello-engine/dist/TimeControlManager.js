/**
 * TimeControlManager
 *
 * Manages chess-style time controls for Othello games
 * Supports:
 * - Initial time allocation per player
 * - Time increment after each move (Fischer time)
 * - Accurate time tracking using Date.now()
 * - Pause/resume for undo/redo operations
 * - State serialization for game persistence
 */
export class TimeControlManager {
    /**
     * Creates a new time control manager
     *
     * @param config - Time control configuration
     *
     * @example
     * ```typescript
     * // 3 minute blitz with 2 second increment
     * const timeControl = new TimeControlManager({
     *   initialTime: 180000,
     *   increment: 2000
     * });
     * ```
     */
    constructor(config) {
        this.currentPlayer = null;
        this.isActive = false;
        this.isPaused = false;
        this.lastMoveTime = null;
        this.config = config;
        this.timeRemaining = {
            black: config.initialTime,
            white: config.initialTime,
        };
    }
    /**
     * Starts the clock for the specified player
     *
     * @param player - Player whose clock should start ('B' or 'W')
     */
    startClock(player) {
        if (this.isPaused) {
            return;
        }
        // Stop previous player's clock if active
        if (this.isActive && this.currentPlayer) {
            this.stopClock();
        }
        this.currentPlayer = player;
        this.isActive = true;
        this.lastMoveTime = Date.now();
    }
    /**
     * Stops the current player's clock and adds increment
     * Should be called when a move is made
     *
     * @returns The time that elapsed during this move
     */
    stopClock() {
        if (!this.isActive || !this.currentPlayer || !this.lastMoveTime) {
            return 0;
        }
        const elapsed = this.getElapsedTime();
        // Deduct elapsed time from current player
        if (this.currentPlayer === 'B') {
            this.timeRemaining.black = Math.max(0, this.timeRemaining.black - elapsed);
        }
        else {
            this.timeRemaining.white = Math.max(0, this.timeRemaining.white - elapsed);
        }
        // Add increment if configured
        if (this.config.increment > 0) {
            if (this.currentPlayer === 'B') {
                this.timeRemaining.black += this.config.increment;
            }
            else {
                this.timeRemaining.white += this.config.increment;
            }
        }
        this.isActive = false;
        this.lastMoveTime = null;
        return elapsed;
    }
    /**
     * Gets the current time remaining for both players
     * Accounts for elapsed time if a clock is currently running
     *
     * @returns Current time remaining for both players
     */
    getTimeRemaining() {
        const elapsed = this.isActive && !this.isPaused ? this.getElapsedTime() : 0;
        return {
            black: this.currentPlayer === 'B'
                ? Math.max(0, this.timeRemaining.black - elapsed)
                : this.timeRemaining.black,
            white: this.currentPlayer === 'W'
                ? Math.max(0, this.timeRemaining.white - elapsed)
                : this.timeRemaining.white,
        };
    }
    /**
     * Checks if the specified player has run out of time
     *
     * @param player - Player to check ('B' or 'W')
     * @returns true if player has no time remaining
     */
    isTimeOut(player) {
        const time = this.getTimeRemaining();
        return player === 'B' ? time.black <= 0 : time.white <= 0;
    }
    /**
     * Resets both clocks to initial time
     */
    reset() {
        this.timeRemaining = {
            black: this.config.initialTime,
            white: this.config.initialTime,
        };
        this.currentPlayer = null;
        this.isActive = false;
        this.isPaused = false;
        this.lastMoveTime = null;
    }
    /**
     * Pauses the clock (useful for undo/redo operations)
     * Preserves time state but stops time from decreasing
     */
    pause() {
        if (!this.isActive || this.isPaused) {
            return;
        }
        // Deduct elapsed time before pausing
        const elapsed = this.getElapsedTime();
        if (this.currentPlayer === 'B') {
            this.timeRemaining.black = Math.max(0, this.timeRemaining.black - elapsed);
        }
        else if (this.currentPlayer === 'W') {
            this.timeRemaining.white = Math.max(0, this.timeRemaining.white - elapsed);
        }
        this.isPaused = true;
        this.lastMoveTime = null;
    }
    /**
     * Resumes the clock after being paused
     */
    resume() {
        if (!this.isPaused) {
            return;
        }
        this.isPaused = false;
        if (this.isActive && this.currentPlayer) {
            this.lastMoveTime = Date.now();
        }
    }
    /**
     * Exports the current time control state as JSON
     *
     * @returns JSON string of time control state
     */
    exportState() {
        // Pause to get accurate time
        const wasPaused = this.isPaused;
        if (this.isActive && !this.isPaused) {
            this.pause();
        }
        const state = {
            config: this.config,
            timeRemaining: { ...this.timeRemaining },
            currentPlayer: this.currentPlayer,
            isActive: this.isActive,
            isPaused: this.isPaused,
            lastMoveTime: this.lastMoveTime,
        };
        // Resume if it wasn't paused before
        if (this.isActive && !wasPaused) {
            this.resume();
        }
        return JSON.stringify(state);
    }
    /**
     * Imports a previously exported time control state
     *
     * @param stateJson - JSON string from exportState()
     */
    importState(stateJson) {
        const state = JSON.parse(stateJson);
        this.config = state.config;
        this.timeRemaining = state.timeRemaining;
        this.currentPlayer = state.currentPlayer;
        this.isActive = state.isActive;
        this.isPaused = state.isPaused;
        this.lastMoveTime = state.lastMoveTime;
        // If clock was active and not paused, restart timing from now
        if (this.isActive && !this.isPaused) {
            this.lastMoveTime = Date.now();
        }
    }
    /**
     * Gets the configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Gets whether the clock is currently active
     */
    getIsActive() {
        return this.isActive;
    }
    /**
     * Gets whether the clock is paused
     */
    getIsPaused() {
        return this.isPaused;
    }
    /**
     * Gets the current player whose clock is running
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    /**
     * Manually sets time remaining (useful for testing or handicaps)
     *
     * @param player - Player to set time for
     * @param time - Time in milliseconds
     */
    setTimeRemaining(player, time) {
        if (player === 'B') {
            this.timeRemaining.black = Math.max(0, time);
        }
        else {
            this.timeRemaining.white = Math.max(0, time);
        }
    }
    /**
     * Gets elapsed time since last move started
     *
     * @private
     */
    getElapsedTime() {
        if (!this.lastMoveTime || this.isPaused) {
            return 0;
        }
        const raw = Date.now() - this.lastMoveTime;
        // Bronstein delay: time below the delay does not count against the player
        const delay = this.config.delay ?? 0;
        return Math.max(0, raw - delay);
    }
}
