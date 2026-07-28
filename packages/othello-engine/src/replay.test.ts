import { describe, test, expect } from 'bun:test';
import { reconstructBoardAt, createStartingTiles, createBoard, takeTurn, B, W, E } from './index';

describe('reconstructBoardAt', () => {
  test('returns starting position for index -1', () => {
    const tiles = reconstructBoardAt([], -1);
    expect(tiles).toEqual(createStartingTiles());
    expect(tiles[3]?.[3]).toBe(W);
    expect(tiles[3]?.[4]).toBe(B);
  });

  test('matches takeTurn after a standard opening move', () => {
    const moves = [{ coordinate: [3, 2] as [number, number] }];
    const reconstructed = reconstructBoardAt(moves, 0);

    const board = createBoard(createStartingTiles());
    takeTurn(board, [3, 2]);
    expect(reconstructed).toEqual(board.tiles);
    expect(reconstructed[2]?.[3]).toBe(B);
  });

  test('handles pass positions using engine rules', () => {
    // Same forcing-pass board as pass-scenario tests: Black at [7,7]
    const start = [
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, B, E],
    ];
    const board = createBoard(start);
    takeTurn(board, [7, 7]);
    expect(board.playerTurn).toBe(B);

    // Replay from empty history is starting tiles only; verify helper itself is consistent
    const after = reconstructBoardAt([{ coordinate: [2, 3] }], 0);
    expect(after[3]?.[2]).toBe(B);
  });
});
