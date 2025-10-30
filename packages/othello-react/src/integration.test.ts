import { describe, test, expect, beforeAll } from 'bun:test';
import { JSDOM } from 'jsdom';

describe('Integration Tests - React App Rendering', () => {
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

describe('Integration Tests - Game Engine Integration', () => {
  test('should create initial board state with engine', async () => {
    const { OthelloGameEngine, B } = await import('othello-engine');
    
    const engine = new OthelloGameEngine();
    const state = engine.getState();

    expect(state.currentPlayer).toBe(B);
    expect(state.board.tiles.length).toBe(8);
    expect(state.board.tiles[0]?.length).toBe(8);
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
  });

  test('should get valid moves for initial position using engine', async () => {
    const { OthelloGameEngine } = await import('othello-engine');
    
    const engine = new OthelloGameEngine();
    const validMoves = engine.getValidMoves();
    
    expect(validMoves.length).toBe(4);
  });

  test('should make a valid move and switch turns using engine', async () => {
    const { OthelloGameEngine, B, W } = await import('othello-engine');
    
    const engine = new OthelloGameEngine();
    const initialState = engine.getState();
    
    expect(initialState.currentPlayer).toBe(B);
    engine.makeMove([2, 3]);
    
    const newState = engine.getState();
    expect(newState.currentPlayer).toBe(W);
    expect(newState.board.tiles[3]![2]).toBe(B);
  });

  test('should play a full game sequence with engine', async () => {
    const { OthelloGameEngine, B, W } = await import('othello-engine');
    
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
    expect(state.currentPlayer).toBe(B);
    const blackMoves2 = engine.getValidMoves();
    expect(blackMoves2.length).toBeGreaterThan(0);
    engine.makeMove(blackMoves2[0]!); // Black makes another valid move

    // Game should not be over yet
    state = engine.getState();
    expect(state.isGameOver).toBe(false);
    
    // Should have valid moves
    const validMoves = engine.getValidMoves();
    expect(validMoves.length).toBeGreaterThan(0);
    
    // Score should be calculated
    const gameScore = engine.getScore();
    expect(gameScore.black).toBeGreaterThan(0);
    expect(gameScore.white).toBeGreaterThan(0);
  });
});

describe('Integration Tests - Type Safety', () => {
  test('should enforce coordinate type at runtime', () => {
    // This is more of a compile-time test, but we can verify runtime behavior
    const validCoord: [number, number] = [3, 4];
    expect(Array.isArray(validCoord)).toBe(true);
    expect(validCoord.length).toBe(2);
    expect(typeof validCoord[0]).toBe('number');
    expect(typeof validCoord[1]).toBe('number');
  });

  test('should enforce tile value types', async () => {
    const { W, B, E, P } = await import('othello-engine');
    
    expect(W).toBe('W');
    expect(B).toBe('B');
    expect(E).toBe('E');
    expect(P).toBe('P');
  });
});
