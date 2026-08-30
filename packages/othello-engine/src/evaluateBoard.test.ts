import { describe, expect, test } from 'bun:test';
import { createBoard, E, B, W, createStartingTiles } from './index';
import {
  countEmptySquares,
  evaluateBoardForPlayer,
  exactTerminalScore,
  TERMINAL_SCORE_SCALE,
} from './evaluateBoard';

describe('evaluateBoard', () => {
  test('countEmptySquares on starting position is 60', () => {
    const board = createBoard(createStartingTiles());
    expect(countEmptySquares(board)).toBe(60);
  });

  test('exactTerminalScore rewards the leading side', () => {
    const board = createBoard([
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, E],
    ]);
    board.playerTurn = B;
    // Not necessarily game-over; just score the disc lead
    const black = exactTerminalScore(board, 'B');
    const white = exactTerminalScore(board, 'W');
    expect(black).toBeGreaterThan(0);
    expect(white).toBeLessThan(0);
    expect(Math.abs(black)).toBeGreaterThanOrEqual(TERMINAL_SCORE_SCALE - 64);
  });

  test('evaluateBoardForPlayer prefers corners for Black midgame', () => {
    const withCorner = createBoard([
      [B, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);
    const without = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, B, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);

    expect(evaluateBoardForPlayer(withCorner, 'B')).toBeGreaterThan(
      evaluateBoardForPlayer(without, 'B')
    );
  });

  test('normalizeUi clamps roughly to [-64, 64]', () => {
    const board = createBoard(createStartingTiles());
    const v = evaluateBoardForPlayer(board, 'B', { normalizeUi: true });
    expect(v).toBeGreaterThanOrEqual(-64);
    expect(v).toBeLessThanOrEqual(64);
  });
});
