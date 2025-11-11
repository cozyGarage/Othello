import { describe, test, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe.skip('Integration Tests - React App Rendering', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeAll(() => {
    // Create a DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable',
    });

    document = dom.window.document;
    window = dom.window as unknown as Window & typeof globalThis;

    // Set up global objects for React
    (global as any).document = document;
    (global as any).window = window;
    (global as any).navigator = window.navigator;
  });

  test('should have a root element', () => {
    const root = document.getElementById('root');
    expect(root).not.toBeNull();
  });

  test('root element should be a div', () => {
    const root = document.getElementById('root');
    expect(root?.tagName).toBe('DIV');
  });
});

describe.skip('Integration Tests - Game Engine Integration', () => {
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
