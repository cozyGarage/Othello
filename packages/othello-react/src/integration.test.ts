import { describe, test, expect } from 'vitest';

/**
 * Integration Tests - React App Rendering
 * SKIPPED: Bun test runner doesn't provide jsdom environment.
 * These tests would work with vitest: `bunx vitest run`
 */
describe.skip('Integration Tests - React App Rendering', () => {
  test('should have global document available', () => {
    expect(document).toBeDefined();
  });
});

/**
 * Integration Tests - Game Engine Integration
 * Tests the engine functionality independent of the UI
 */
describe('Integration Tests - Game Engine Integration', () => {
  test('should create initial board state with engine', async () => {
    const { OthelloGameEngine, B } = await import('../../othello-engine/src/index.ts');

    const engine = new OthelloGameEngine();
    const state = engine.getState();

    expect(state.currentPlayer).toBe(B);
    expect(state.board.tiles.length).toBe(8);
    expect(state.board.tiles[0]?.length).toBe(8);
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
  });

  test('should get valid moves for initial position using engine', async () => {
    const { OthelloGameEngine } = await import('../../othello-engine/src/index.ts');

    const engine = new OthelloGameEngine();
    const validMoves = engine.getValidMoves();

    expect(validMoves.length).toBe(4);
  });

  test('should make a valid move and switch turns using engine', async () => {
    const { OthelloGameEngine, B, W } = await import('../../othello-engine/src/index.ts');

    const engine = new OthelloGameEngine();
    const initialState = engine.getState();

    expect(initialState.currentPlayer).toBe(B);
    engine.makeMove([2, 3]);

    const newState = engine.getState();
    expect(newState.currentPlayer).toBe(W);
    expect(newState.board.tiles[3]![2]).toBe(B);
  });

  test('should play a full game sequence with engine', async () => {
    const { OthelloGameEngine, B, W } = await import('../../othello-engine/src/index.ts');

    const engine = new OthelloGameEngine();

    // Make a few valid moves
    let state = engine.getState();
    expect(state.currentPlayer).toBe(B);
    const blackMoves = engine.getValidMoves();
    expect(blackMoves.length).toBeGreaterThan(0);
    engine.makeMove(blackMoves[0]!); // Black makes first valid move

    state = engine.getState();
    expect(state.currentPlayer).toBe(W);
    const whiteMoves = engine.getValidMoves();
    expect(whiteMoves.length).toBeGreaterThan(0);
    engine.makeMove(whiteMoves[0]!); // White makes first valid move

    state = engine.getState();
  });
});
