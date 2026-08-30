import { Board, getValidMoves, isGameOver, score, E, type Coordinate } from './index';
import { POSITION_WEIGHTS } from './positionWeights';

/** Exact endgame solve threshold (empty squares). */
export const EXACT_ENDGAME_EMPTIES = 10;

/** Scale for decisive terminal / exact scores so search prefers them over heuristics. */
export const TERMINAL_SCORE_SCALE = 10_000;

/**
 * Count empty squares on the board.
 */
export function countEmptySquares(board: Board): number {
  let empty = 0;
  for (let y = 0; y < board.tiles.length; y++) {
    const row = board.tiles[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (row[x] === E) empty++;
    }
  }
  return empty;
}

/**
 * Disc difference from `player`'s perspective (positive = ahead).
 */
export function discDifference(board: Board, player: 'B' | 'W'): number {
  const scores = score(board);
  return player === 'B' ? scores.black - scores.white : scores.white - scores.black;
}

/**
 * Exact terminal evaluation when the game is over (or both sides to move have no moves).
 */
export function exactTerminalScore(board: Board, player: 'B' | 'W'): number {
  const diff = discDifference(board, player);
  if (diff > 0) return TERMINAL_SCORE_SCALE + diff;
  if (diff < 0) return -TERMINAL_SCORE_SCALE + diff;
  return 0;
}

/**
 * Phase-aware static evaluation from `player`'s perspective.
 *
 * - Game over → exact disc outcome
 * - ≤ EXACT_ENDGAME_EMPTIES empties → disc count (search should deepen / solve)
 * - Late game → discs dominate
 * - Mid/early → position weights + mobility + light disc weight
 *
 * @param normalizeUi - When true, clamp roughly to [-64, 64] for the evaluation graph
 */
export function evaluateBoardForPlayer(
  board: Board,
  player: 'B' | 'W',
  options: { normalizeUi?: boolean } = {}
): number {
  if (isGameOver(board)) {
    const exact = exactTerminalScore(board, player);
    return options.normalizeUi ? Math.max(-64, Math.min(64, discDifference(board, player))) : exact;
  }

  const empties = countEmptySquares(board);
  const scores = score(board);
  const discValue = discDifference(board, player);

  if (empties <= EXACT_ENDGAME_EMPTIES) {
    // Prefer exact material; search uses higher depths here via iterative deepening
    const exactish = discValue * 100;
    return options.normalizeUi ? Math.max(-64, Math.min(64, discValue * 2)) : exactish;
  }

  const validMoves = getValidMoves(board);
  const originalPlayer = board.playerTurn;
  let opponentMoves: ReturnType<typeof getValidMoves>;
  try {
    board.playerTurn = board.playerTurn === 'B' ? 'W' : 'B';
    opponentMoves = getValidMoves(board);
  } finally {
    board.playerTurn = originalPlayer;
  }

  let positionValue = 0;
  const size = board.tiles.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = board.tiles[y]?.[x];
      const weight = POSITION_WEIGHTS[y]?.[x] ?? 0;
      if (tile === player) positionValue += weight;
      else if (tile !== E && tile !== undefined) positionValue -= weight;
    }
  }

  const mobilityRaw =
    board.playerTurn === player
      ? validMoves.length - opponentMoves.length
      : opponentMoves.length - validMoves.length;

  const totalPieces = scores.black + scores.white;
  let combined: number;

  if (totalPieces > 50 || empties <= 20) {
    // Late midgame / endgame: discs matter more
    combined = positionValue * 0.3 + mobilityRaw * 3 + discValue * 8;
  } else if (totalPieces < 20) {
    // Opening: mobility + position
    combined = positionValue + mobilityRaw * 6 + discValue * 0.25;
  } else {
    combined = positionValue + mobilityRaw * 5 + discValue * 1;
  }

  if (options.normalizeUi) {
    return Math.max(
      -64,
      Math.min(64, Math.round(positionValue / 10 + mobilityRaw * 3 + discValue * 0.5))
    );
  }

  return combined;
}

/**
 * Preferential move-order score using static features (corners first, X last).
 * Used by search; not a full evaluation.
 */
export function staticMoveOrderScore(move: Coordinate, board: Board, player: 'B' | 'W'): number {
  const [x, y] = move;
  const corners: Coordinate[] = [
    [0, 0],
    [0, 7],
    [7, 0],
    [7, 7],
  ];
  if (corners.some(([cx, cy]) => cx === x && cy === y)) return 1000;

  const xSquares: Coordinate[] = [
    [1, 1],
    [1, 6],
    [6, 1],
    [6, 6],
  ];
  if (xSquares.some(([xx, xy]) => xx === x && xy === y)) {
    const adj =
      x === 1 && y === 1
        ? ([0, 0] as Coordinate)
        : x === 1 && y === 6
          ? ([0, 7] as Coordinate)
          : x === 6 && y === 1
            ? ([7, 0] as Coordinate)
            : ([7, 7] as Coordinate);
    const [cx, cy] = adj;
    if (board.tiles[cy]?.[cx] === player) return 100;
    return -100;
  }

  return POSITION_WEIGHTS[y]?.[x] ?? 0;
}
