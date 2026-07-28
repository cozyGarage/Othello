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
export declare const POSITION_WEIGHTS: ReadonlyArray<ReadonlyArray<number>>;
/** Corner coordinates as [x, y] = [col, row] */
export declare const CORNER_COORDINATES: ReadonlyArray<readonly [number, number]>;
/**
 * Look up the static weight for a board coordinate.
 * @param coord - [x, y] = [col, row]
 */
export declare function getPositionWeight(coord: readonly [number, number]): number;
//# sourceMappingURL=positionWeights.d.ts.map