export { OthelloGameEngine } from './OthelloGameEngine';
export type { Move, GameState, GameEvent, GameEventType, MoveEventData, GameOverEventData, InvalidMoveEventData, StateChangeEventData, } from './OthelloGameEngine';
export { OthelloBot } from './OthelloBot';
export type { BotDifficulty } from './OthelloBot';
export type TileValue = 'W' | 'B' | 'E' | 'P';
export type Coordinate = [number, number];
export interface Board {
    playerTurn: 'W' | 'B';
    tiles: TileValue[][];
}
export interface Score {
    black: number;
    white: number;
}
export interface Direction {
    xMod: number;
    yMod: number;
}
export interface Directions {
    [key: string]: Direction;
}
export declare const W: 'W';
export declare const B: 'B';
export declare const E: 'E';
export declare const P: 'P';
export declare const createBoard: (tiles: TileValue[][]) => Board;
export declare const tile: (board: Board, [x, y]: Coordinate) => TileValue;
export declare const score: (board: Board) => Score;
export declare const hasAdjacentPiece: (board: Board, coord: Coordinate) => boolean;
export declare const takeTurn: (board: Board, coord: Coordinate) => void;
export declare const isValidMove: (board: Board, coord: Coordinate) => boolean;
export declare const getValidMoves: (board: Board) => Coordinate[];
export declare const isGameOver: (board: Board) => boolean;
export declare const getWinner: (board: Board) => "W" | "B" | null;
export declare const getAnnotatedBoard: (board: Board) => Board;
//# sourceMappingURL=index.d.ts.map