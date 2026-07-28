/**
 * Shared board position weights for static evaluation.
 * Used by the engine UI evaluator, AI search, and hint analysis.
 *
 * Layout is [row][col]. Coordinates elsewhere are [x, y] = [col, row].
 *
 * - Corners: +100 (stable)
 * - X-squares (diagonal to corners): -50 (dangerous)
 * - C-squares (adjacent to corners): -20
 * - Edges: +10
 * - Interior: -2 to +5
 */
export const POSITION_WEIGHTS = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100],
];
/** Corner coordinates as [x, y] = [col, row] */
export const CORNER_COORDINATES = [
    [0, 0],
    [0, 7],
    [7, 0],
    [7, 7],
];
/**
 * Look up the static weight for a board coordinate.
 * @param coord - [x, y] = [col, row]
 */
export function getPositionWeight(coord) {
    const [col, row] = coord;
    return POSITION_WEIGHTS[row]?.[col] ?? 0;
}
