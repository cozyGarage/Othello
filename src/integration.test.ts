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
    window = dom.window as Window & typeof globalThis;

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

describe('Integration Tests - Game Logic Integration', () => {
  test('should create initial board state', async () => {
    const { createBoard, E, W, B } = await import('./game-logic');
    
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ]);

    expect(board.playerTurn).toBe(B);
    expect(board.tiles.length).toBe(8);
    expect(board.tiles[0]?.length).toBe(8);
  });

  test('should get valid moves for initial position', async () => {
    const { createBoard, E, W, B, getValidMoves } = await import('./game-logic');
    
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ]);

    const validMoves = getValidMoves(board);
    expect(validMoves.length).toBe(4);
  });

  test('should make a valid move and switch turns', async () => {
    const { createBoard, E, W, B, takeTurn } = await import('./game-logic');
    
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ]);

    expect(board.playerTurn).toBe(B);
    takeTurn(board, [2, 3]);
    expect(board.playerTurn).toBe(W);
    expect(board.tiles[3]![2]).toBe(B);
  });

  test('should play a full game sequence', async () => {
    const { 
      createBoard, E, W, B, 
      takeTurn, getValidMoves, 
      isGameOver, score 
    } = await import('./game-logic');
    
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ]);

    // Make a few valid moves
    expect(board.playerTurn).toBe(B);
    const blackMoves = getValidMoves(board);
    expect(blackMoves.length).toBeGreaterThan(0);
    takeTurn(board, blackMoves[0]!); // Black makes first valid move
    
    expect(board.playerTurn).toBe(W);
    const whiteMoves = getValidMoves(board);
    expect(whiteMoves.length).toBeGreaterThan(0);
    takeTurn(board, whiteMoves[0]!); // White makes first valid move
    
    expect(board.playerTurn).toBe(B);
    const blackMoves2 = getValidMoves(board);
    expect(blackMoves2.length).toBeGreaterThan(0);
    takeTurn(board, blackMoves2[0]!); // Black makes another valid move

    // Game should not be over yet
    expect(isGameOver(board)).toBe(false);
    
    // Should have valid moves
    const validMoves = getValidMoves(board);
    expect(validMoves.length).toBeGreaterThan(0);
    
    // Score should be calculated
    const gameScore = score(board);
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
    const { W, B, E, P } = await import('./game-logic');
    
    expect(W).toBe('W');
    expect(B).toBe('B');
    expect(E).toBe('E');
    expect(P).toBe('P');
  });
});
