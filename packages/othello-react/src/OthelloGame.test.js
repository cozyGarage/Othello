import { describe, test, expect, beforeEach } from 'bun:test';
import { OthelloGameEngine } from 'othello-engine';

describe('OthelloGame Component Integration', () => {
  let engine;

  beforeEach(() => {
    engine = new OthelloGameEngine();
  });

  test('engine initializes with correct starting state', () => {
    const state = engine.getState();
    
    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.isGameOver).toBe(false);
    expect(state.moveHistory.length).toBe(0);
  });

  test('engine handles valid move correctly', () => {
    const result = engine.makeMove([3, 2]);
    
    expect(result).toBe(true);
    const state = engine.getState();
    expect(state.currentPlayer).toBe('W'); // Turn switched
    expect(state.moveHistory.length).toBe(1);
  });

  test('engine rejects invalid move', () => {
    const result = engine.makeMove([0, 0]);
    
    expect(result).toBe(false);
    expect(engine.getState().moveHistory.length).toBe(0);
  });

  test('engine tracks move history with timestamps', () => {
    engine.makeMove([3, 2]);
    const history = engine.getMoveHistory();
    
    expect(history.length).toBe(1);
    expect(history[0].player).toBe('B');
    expect(history[0].coordinate).toEqual([3, 2]);
    expect(history[0].timestamp).toBeGreaterThan(0);
    expect(history[0].scoreAfter).toBeDefined();
  });

  test('engine can be reset', () => {
    engine.makeMove([3, 2]);
    engine.makeMove([2, 2]);
    
    engine.reset();
    
    const state = engine.getState();
    expect(state.currentPlayer).toBe('B');
    expect(state.moveHistory.length).toBe(0);
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
  });

  test('engine exports and imports state correctly', () => {
    engine.makeMove([3, 2]);
    const exported = engine.exportState();
    
    const newEngine = new OthelloGameEngine();
    newEngine.importState(exported);
    
    const state1 = engine.getState();
    const state2 = newEngine.getState();
    
    expect(state2.currentPlayer).toBe(state1.currentPlayer);
    expect(state2.moveHistory.length).toBe(state1.moveHistory.length);
  });

  test('engine emits events on move', (done) => {
    let eventFired = false;
    
    engine.on('move', () => {
      eventFired = true;
      done();
    });
    
    engine.makeMove([3, 2]);
    
    setTimeout(() => {
      if (!eventFired) {
        throw new Error('Event was not fired');
      }
    }, 100);
  });

  test('annotated board shows valid moves', () => {
    const annotatedBoard = engine.getAnnotatedBoard();
    
    let validMoveCount = 0;
    annotatedBoard.tiles.forEach(row => {
      row.forEach(tile => {
        if (tile === 'P') validMoveCount++;
      });
    });
    
    expect(validMoveCount).toBeGreaterThan(0);
  });
});