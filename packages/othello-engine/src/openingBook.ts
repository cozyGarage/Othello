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
 *
 * Major opening families:
 * 1. Diagonal Opening (Tiger) - d3, c3, c4...
 * 2. Parallel Opening - c4, e3...
 * 3. Perpendicular Opening - f5, d6...
 */

export interface OpeningMove {
    move: [number, number]; // [col, row]
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
        evaluation?: number; // -64 to +64
    };
}

/**
 * Common Othello openings
 *
 * Standard starting position has discs at:
 * - d4: White, e4: Black
 * - d5: Black, e5: White
 *
 * Black moves first. Initial legal moves for Black: c4, d3, e6, f5
 */
export const OPENING_BOOK: OpeningBook = {
    // === FIRST MOVE OPTIONS ===
    // Empty = starting position, Black to move
    '': { bestMove: [3, 5], name: 'Diagonal Opening (d3)' }, // d3

    // === DIAGONAL OPENING (d3) ===
    'd3': { bestMove: [2, 5], name: 'Tiger' }, // c3
    'd3,c3': { bestMove: [2, 4], name: 'Tiger' }, // c4
    'd3,c3,c4': { bestMove: [2, 3], name: 'Tiger Line' }, // c5
    'd3,c3,c4,c5': { bestMove: [1, 5], name: 'Tiger Extension' }, // b3

    // === PARALLEL OPENING (c4) ===
    'c4': { bestMove: [4, 5], name: 'Parallel' }, // e3
    'c4,e3': { bestMove: [5, 4], name: 'Parallel Line' }, // f4
    'c4,e3,f4': { bestMove: [2, 5], name: 'Parallel Response' }, // c3

    // === PERPENDICULAR OPENING (f5) ===
    'f5': { bestMove: [3, 2], name: 'Perpendicular' }, // d6
    'f5,d6': { bestMove: [2, 5], name: 'Perpendicular Line' }, // c3

    // === RABBIT OPENING ===
    'd3,c5': { bestMove: [5, 2], name: 'Rabbit' }, // f6
    'd3,c5,f6': { bestMove: [4, 2], name: 'Rabbit Line' }, // e6

    // === COW OPENING ===
    'd3,c5,d6': { bestMove: [5, 3], name: 'Cow' }, // f5

    // === SNAKE OPENING ===
    'd3,c3,c4,e3': { bestMove: [3, 6], name: 'Snake' }, // d2

    // === ROSE OPENING ===
    'c4,c5': { bestMove: [4, 5], name: 'Rose' }, // e3
    'c4,c5,e3': { bestMove: [4, 2], name: 'Rose Line' }, // e6

    // === HEATH OPENING ===
    'c4,c3': { bestMove: [3, 5], name: 'Heath' }, // d3
    'c4,c3,d3': { bestMove: [2, 3], name: 'Heath Line' }, // c5

    // === SHAMAN OPENING ===
    'd3,e3': { bestMove: [5, 3], name: 'Shaman/Chimney' }, // f5
    'd3,e3,f5': { bestMove: [5, 2], name: 'Shaman Line' }, // f6
};

/**
 * Convert move coordinate to algebraic notation
 * [col, row] where row 0 = top → notation row 8
 */
export function moveToNotation(move: [number, number]): string {
    const [col, row] = move;
    const colLetter = String.fromCharCode(97 + col); // a-h
    const rowNumber = 8 - row; // row 0 = 8, row 7 = 1
    return `${colLetter}${rowNumber}`;
}

/**
 * Convert algebraic notation to coordinate
 * d3 → [3, 5] (col d = 3, row 3 from bottom = row index 5)
 */
export function notationToMove(notation: string): [number, number] {
    const col = notation.charCodeAt(0) - 97; // a=0, b=1, ...
    const row = 8 - parseInt(notation[1], 10); // 8→0, 7→1, ... 1→7
    return [col, row];
}

/**
 * Build sequence key from move history
 */
export function buildSequenceKey(moves: Array<{ coordinate: [number, number] }>): string {
    return moves.map((m) => moveToNotation(m.coordinate)).join(',');
}

/**
 * Look up best move from opening book
 * @param moveHistory - Array of previous moves
 * @returns Best move coordinate or null if not in book
 */
export function lookupOpeningBook(
    moveHistory: Array<{ coordinate: [number, number] }>
): [number, number] | null {
    const key = buildSequenceKey(moveHistory);
    const entry = OPENING_BOOK[key];

    if (entry) {
        return entry.bestMove;
    }

    return null;
}

/**
 * Get opening name for current position
 */
export function getOpeningName(moveHistory: Array<{ coordinate: [number, number] }>): string | null {
    const key = buildSequenceKey(moveHistory);
    const entry = OPENING_BOOK[key];
    return entry?.name || null;
}
