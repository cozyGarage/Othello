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
export interface TimeControlConfig {
    /** Initial time per player in milliseconds */
    initialTime: number;
    /** Time increment added after each move in milliseconds (0 = no increment) */
    increment: number;
    /** Optional delay before time starts counting (Bronstein delay) */
    delay?: number;
}
export interface PlayerTime {
    /** Time remaining for black player in milliseconds */
    black: number;
    /** Time remaining for white player in milliseconds */
    white: number;
}
export interface TimeControlState {
    config: TimeControlConfig;
    timeRemaining: PlayerTime;
    currentPlayer: 'B' | 'W' | null;
    isActive: boolean;
    isPaused: boolean;
    lastMoveTime: number | null;
}
export declare class TimeControlManager {
    private config;
    private timeRemaining;
    private currentPlayer;
    private isActive;
    private isPaused;
    private lastMoveTime;
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
    constructor(config: TimeControlConfig);
    /**
     * Starts the clock for the specified player
     *
     * @param player - Player whose clock should start ('B' or 'W')
     */
    startClock(player: 'B' | 'W'): void;
    /**
     * Stops the current player's clock and adds increment
     * Should be called when a move is made
     *
     * @returns The time that elapsed during this move
     */
    stopClock(): number;
    /**
     * Gets the current time remaining for both players
     * Accounts for elapsed time if a clock is currently running
     *
     * @returns Current time remaining for both players
     */
    getTimeRemaining(): PlayerTime;
    /**
     * Checks if the specified player has run out of time
     *
     * @param player - Player to check ('B' or 'W')
     * @returns true if player has no time remaining
     */
    isTimeOut(player: 'B' | 'W'): boolean;
    /**
     * Resets both clocks to initial time
     */
    reset(): void;
    /**
     * Pauses the clock (useful for undo/redo operations)
     * Preserves time state but stops time from decreasing
     */
    pause(): void;
    /**
     * Resumes the clock after being paused
     */
    resume(): void;
    /**
     * Exports the current time control state as JSON
     *
     * @returns JSON string of time control state
     */
    exportState(): string;
    /**
     * Imports a previously exported time control state
     *
     * @param stateJson - JSON string from exportState()
     */
    importState(stateJson: string): void;
    /**
     * Gets the configuration
     */
    getConfig(): TimeControlConfig;
    /**
     * Gets whether the clock is currently active
     */
    getIsActive(): boolean;
    /**
     * Gets whether the clock is paused
     */
    getIsPaused(): boolean;
    /**
     * Gets the current player whose clock is running
     */
    getCurrentPlayer(): 'B' | 'W' | null;
    /**
     * Manually sets time remaining (useful for testing or handicaps)
     *
     * @param player - Player to set time for
     * @param time - Time in milliseconds
     */
    setTimeRemaining(player: 'B' | 'W', time: number): void;
    /**
     * Gets elapsed time since last move started
     *
     * @private
     */
    private getElapsedTime;
}
//# sourceMappingURL=TimeControlManager.d.ts.map