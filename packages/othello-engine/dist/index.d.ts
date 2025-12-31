/**
 * Othello Engine - Core Game Logic
 *
 * This module provides the foundational game logic for Othello/Reversi,
 * including board representation, move validation, and game state management.
 *
 * @module othello-engine
 */
export { OthelloGameEngine } from './OthelloGameEngine';
export type { Move, GameState, GameEvent, GameEventType, MoveEventData, GameOverEventData, InvalidMoveEventData, StateChangeEventData, } from './OthelloGameEngine';
export { OthelloBot } from './OthelloBot';
export type { BotDifficulty } from './OthelloBot';
export { TimeControlManager } from './TimeControlManager';
export type { TimeControlConfig, PlayerTime, TimeControlState } from './TimeControlManager';
/**
 * Tile value types
 * - 'W': White disc
 * - 'B': Black disc
 * - 'E': Empty cell
 * - 'P': Possible move (for UI annotation)
 */
export type TileValue = 'W' | 'B' | 'E' | 'P';
/**
 * Board coordinate as [x, y] where x is column (0-7) and y is row (0-7)
 */
export type Coordinate = [number, number];
/**
 * Game board state
 */
export interface Board {
    /** Current player's turn */
    playerTurn: 'W' | 'B';
    /** 8x8 grid of tile values */
    tiles: TileValue[][];
}
/**
 * Score for both players
 */
export interface Score {
    /** Number of black discs on the board */
    black: number;
    /** Number of white discs on the board */
    white: number;
}
/**
 * Direction modifier for checking adjacent tiles
 */
export interface Direction {
    /** X-axis modifier (-1, 0, or 1) */
    xMod: number;
    /** Y-axis modifier (-1, 0, or 1) */
    yMod: number;
}
/**
 * Map of direction names to direction modifiers
 */
export interface Directions {
    [key: string]: Direction;
}
/** White player/disc constant */
export declare const W: 'W';
/** Black player/disc constant */
export declare const B: 'B';
/** Empty cell constant */
export declare const E: 'E';
/** Possible move annotation constant (for UI) */
export declare const P: 'P';
/**
 * Creates a new game board with the specified tiles
 *
 * @param tiles - 8x8 grid of tile values
 * @returns Board object with Black player starting first
 *
 * @example
 * ```typescript
 * const board = createBoard([
 *   [E, E, E, E, E, E, E, E],
 *   // ... remaining rows
 * ]);
 * ```
 */
export declare const createBoard: (tiles: TileValue[][]) => Board;
/**
 * Gets the tile value at a specific coordinate
 *
 * @param board - Game board
 * @param coordinate - [x, y] position to check
 * @returns Tile value at the coordinate
 * @throws Error if coordinate is out of bounds
 *
 * @example
 * ```typescript
 * const value = tile(board, [3, 3]); // 'W' or 'B' or 'E'
 * ```
 */
export declare const tile: (board: Board, [x, y]: Coordinate) => TileValue;
/**
 * Calculates the current score (disc count) for both players
 *
 * @param board - Game board to score
 * @returns Object with black and white disc counts
 *
 * @example
 * ```typescript
 * const { black, white } = score(board);
 * console.log(`Black: ${black}, White: ${white}`);
 * ```
 */
export declare const score: (board: Board) => Score;
/**
 * Checks if a coordinate has at least one adjacent piece (not empty)
 * Used as an optimization to quickly reject impossible moves
 *
 * @param board - Game board
 * @param coord - [x, y] position to check
 * @returns true if at least one adjacent cell contains a disc
 *
 * @example
 * ```typescript
 * if (!hasAdjacentPiece(board, [3, 2])) {
 *   // This move can't be valid (no pieces nearby)
 * }
 * ```
 */
export declare const hasAdjacentPiece: (board: Board, coord: Coordinate) => boolean;
/**
 * Executes a move on the board
 *
 * This is the core game logic function that:
 * 1. Places a piece at the specified coordinate
 * 2. Flips all opponent pieces in valid directions
 * 3. Switches to the next player
 * 4. Handles auto-pass if next player has no valid moves
 *
 * @param board - Game board (mutated in place)
 * @param coord - [x, y] coordinate to place piece
 * @throws Error if coordinate is occupied or move doesn't flip any pieces
 *
 * @example
 * ```typescript
 * try {
 *   takeTurn(board, [2, 3]);
 *   console.log('Move successful');
 * } catch (error) {
 *   console.error('Invalid move:', error.message);
 * }
 * ```
 */
export declare const takeTurn: (board: Board, coord: Coordinate) => void;
/**
 * Result of a move operation
 */
export interface MoveResult {
    /** New board state after the move */
    board: Board;
    /** Whether the move was successful */
    success: boolean;
}
/**
 * Executes a move and returns a new board (immutable version)
 *
 * Unlike `takeTurn`, this function does not mutate the input board.
 * Instead, it creates a copy and applies the move.
 *
 * @param board - Original game board (not modified)
 * @param coord - [x, y] coordinate to place piece
 * @returns MoveResult with new board and success status, or null if invalid move
 *
 * @example
 * ```typescript
 * const result = move(board, [2, 3]);
 * if (result) {
 *   console.log('New board:', result.board);
 * } else {
 *   console.log('Invalid move');
 * }
 * ```
 */
export declare const move: (board: Board, coord: Coordinate) => MoveResult | null;
/**
 * Checks if a move is valid for the current player
 *
 * A move is valid if:
 * 1. The target cell is empty
 * 2. The move flips at least one opponent piece
 *
 * @param board - Game board
 * @param coord - [x, y] coordinate to check
 * @returns true if the move is valid for the current player
 *
 * @example
 * ```typescript
 * if (isValidMove(board, [2, 3])) {
 *   takeTurn(board, [2, 3]);
 * }
 * ```
 */
export declare const isValidMove: (board: Board, coord: Coordinate) => boolean;
/**
 * Gets all valid moves for the current player
 *
 * Scans the entire board and returns coordinates of all cells
 * where the current player can make a valid move.
 *
 * @param board - Game board
 * @returns Array of [x, y] coordinates representing valid moves
 *
 * @example
 * ```typescript
 * const moves = getValidMoves(board);
 * console.log(`Current player has ${moves.length} valid moves`);
 * moves.forEach(([x, y]) => {
 *   console.log(`Valid move at (${x}, ${y})`);
 * });
 * ```
 */
export declare const getValidMoves: (board: Board) => Coordinate[];
/**
 * Checks if the game is over
 *
 * Game ends when:
 * 1. The board is completely full, OR
 * 2. Both players have no valid moves
 *
 * @param board - Game board
 * @returns true if the game has ended
 *
 * @example
 * ```typescript
 * if (isGameOver(board)) {
 *   const winner = getWinner(board);
 *   console.log(winner ? `${winner} wins!` : 'Tie game!');
 * }
 * ```
 */
export declare const isGameOver: (board: Board) => boolean;
/**
 * Determines the winner of the game
 *
 * @param board - Game board
 * @returns 'B' if black wins, 'W' if white wins, or null for a tie
 *
 * @example
 * ```typescript
 * const winner = getWinner(board);
 * if (winner === B) {
 *   console.log('Black wins!');
 * } else if (winner === W) {
 *   console.log('White wins!');
 * } else {
 *   console.log('Tie game!');
 * }
 * ```
 */
export declare const getWinner: (board: Board) => "W" | "B" | null;
/**
 * Creates a copy of the board with valid moves annotated as 'P'
 *
 * Useful for UI to display possible move indicators without
 * modifying the actual game state.
 *
 * @param board - Game board
 * @returns New board with valid moves marked as 'P'
 *
 * @example
 * ```typescript
 * const annotated = getAnnotatedBoard(board);
 * // Use annotated board for rendering UI hints
 * // Original board remains unchanged
 * ```
 */
export declare const getAnnotatedBoard: (board: Board) => Board;
//# sourceMappingURL=index.d.ts.map