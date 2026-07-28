/**
 * Opening Book for Othello
 *
 * Well-known openings in Othello with their best responses.
 * Move coordinates are in [col, row] format (0-indexed).
 * Row 0 is top, row 7 is bottom.
 *
 * Standard notation mapping:
 * - d3 = column d (index 3), row 3 (from bottom) = row index 5
 * - c4 = column c (index 2), row 4 (from bottom) = row index 4
 * - f5 = column f (index 5), row 5 (from bottom) = row index 3
 *
 * Major opening families:
 * 1. Diagonal Opening - d3 response (most common)
 * 2. Perpendicular Opening - f5, d6, c5... (popular among experts)
 * 3. Parallel Opening - generally weaker but can surprise
 */
export interface OpeningMove {
    move: [number, number];
    name?: string;
    children?: Record<string, OpeningMove>;
}
/**
 * Opening book data structure
 * Key format: move sequence as comma-separated notation (e.g., "d3,c3,c4")
 */
export interface OpeningBook {
    [sequence: string]: {
        bestMove: [number, number];
        name?: string;
        evaluation?: number;
    };
}
/**
 * Expanded Othello Opening Book
 *
 * Standard starting position has discs at:
 * - d4: White, e4: Black
 * - d5: Black, e5: White
 *
 * Black moves first. Initial legal moves for Black: c4, d3, e6, f5
 *
 * This book contains 40+ opening positions covering major lines.
 */
export declare const OPENING_BOOK: OpeningBook;
/**
 * Convert move coordinate to algebraic notation
 * [col, row] where row 0 = top → notation row 8
 */
export declare function moveToNotation(move: [number, number]): string;
/**
 * Convert algebraic notation to coordinate
 * d3 → [3, 5] (col d = 3, row 3 from bottom = row index 5)
 */
export declare function notationToMove(notation: string): [number, number];
/**
 * Build sequence key from move history
 */
export declare function buildSequenceKey(moves: Array<{
    coordinate: [number, number];
}>): string;
/**
 * Look up best move from opening book
 * @param moveHistory - Array of previous moves
 * @returns Best move coordinate or null if not in book
 */
export declare function lookupOpeningBook(moveHistory: Array<{
    coordinate: [number, number];
}>): [number, number] | null;
/**
 * Get opening name for current position
 */
export declare function getOpeningName(moveHistory: Array<{
    coordinate: [number, number];
}>): string | null;
/**
 * Get the number of positions in the opening book
 */
export declare function getOpeningBookSize(): number;
//# sourceMappingURL=openingBook.d.ts.map