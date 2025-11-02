import { describe, test, expect } from 'bun:test';
import { OthelloGameEngine } from './OthelloGameEngine';

describe('OthelloGameEngine', () => {
  test('initializes with correct starting state', () => {
    const engine = new OthelloGameEngine();
    const state = engine.getState();

    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.isGameOver).toBe(false);
    expect(state.moveHistory).toHaveLength(0);
  });

  test('initializes with player IDs', () => {
    const engine = new OthelloGameEngine('player1', 'player2');
    const state = engine.getState();

    expect(state.blackPlayerId).toBe('player1');
    expect(state.whitePlayerId).toBe('player2');
  });

  test('makeMove() successfully makes a valid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([3, 2]);

    expect(result).toBe(true);

    const state = engine.getState();
    expect(state.currentPlayer).toBe('W'); // Turn should switch
    expect(state.moveHistory).toHaveLength(1);
    expect(state.moveHistory[0]!.player).toBe('B');
    expect(state.moveHistory[0]!.coordinate).toEqual([3, 2]);
  });

  test('makeMove() rejects invalid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([0, 0]); // Invalid move

    expect(result).toBe(false);
    expect(engine.getState().moveHistory).toHaveLength(0);
  });

  test('emits move event on successful move', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('move', (event) => {
      const moveData = event.data as { move: any; state: any };
      expect(moveData.move.player).toBe('B');
      expect(moveData.move.coordinate).toEqual([3, 2]);
      done();
    });

    engine.makeMove([3, 2]);
  });

  test('emits invalidMove event on invalid move', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('invalidMove', (event) => {
      const invalidMoveData = event.data as { coordinate: any; error: string };
      expect(invalidMoveData.coordinate).toEqual([0, 0]);
      expect(invalidMoveData.error).toBeDefined();
      done();
    });

    engine.makeMove([0, 0]);
  });

  test('emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('stateChange', (event) => {
      const stateChangeData = event.data as { state: any; action?: string };
      expect(stateChangeData.state).toBeDefined();
      expect(stateChangeData.state.currentPlayer).toBe('W');
      done();
    });

    engine.makeMove([3, 2]);
  });

  test('getValidMoves() returns correct moves', () => {
    const engine = new OthelloGameEngine();
    const validMoves = engine.getValidMoves();

    expect(validMoves.length).toBeGreaterThan(0);
    expect(validMoves).toContainEqual([3, 2]);
    expect(validMoves).toContainEqual([2, 3]);
  });

  test('reset() resets the game to initial state', () => {
    const engine = new OthelloGameEngine();

    // Make some moves
    engine.makeMove([3, 2]);
    engine.makeMove([2, 2]);

    expect(engine.getState().moveHistory.length).toBeGreaterThan(0);

    // Reset
    engine.reset();

    const state = engine.getState();
    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.moveHistory).toHaveLength(0);
  });

  test('exportState() and importState() work correctly', () => {
    const engine1 = new OthelloGameEngine('player1', 'player2');

    // Make some moves
    engine1.makeMove([3, 2]);
    engine1.makeMove([2, 2]);

    // Export state
    const exportedState = engine1.exportState();

    // Create new engine and import state
    const engine2 = new OthelloGameEngine();
    engine2.importState(exportedState);

    // Verify states match
    const state1 = engine1.getState();
    const state2 = engine2.getState();

    expect(state2.currentPlayer).toBe(state1.currentPlayer);
    expect(state2.score).toEqual(state1.score);
    expect(state2.moveHistory.length).toBe(state1.moveHistory.length);
    expect(state2.blackPlayerId).toBe('player1');
    expect(state2.whitePlayerId).toBe('player2');
  });

  test('tracks move timestamps', () => {
    const engine = new OthelloGameEngine();
    const before = Date.now();

    engine.makeMove([3, 2]);

    const after = Date.now();
    const move = engine.getMoveHistory()[0]!;

    expect(move.timestamp).toBeGreaterThanOrEqual(before);
    expect(move.timestamp).toBeLessThanOrEqual(after);
  });

  test('records score after each move', () => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);

    const move = engine.getMoveHistory()[0]!;
    expect(move.scoreAfter).toBeDefined();
    expect(move.scoreAfter.black).toBeGreaterThan(0);
    expect(move.scoreAfter.white).toBeGreaterThan(0);
  });

  test('getPlayerId() returns correct player IDs', () => {
    const engine = new OthelloGameEngine('blackPlayer123', 'whitePlayer456');

    expect(engine.getPlayerId('B')).toBe('blackPlayer123');
    expect(engine.getPlayerId('W')).toBe('whitePlayer456');
  });

  test('event listeners can be removed with off()', () => {
    const engine = new OthelloGameEngine();
    let callCount = 0;

    const listener = () => {
      callCount++;
    };

    engine.on('move', listener);
    engine.makeMove([3, 2]);
    expect(callCount).toBe(1);

    engine.off('move', listener);
    engine.makeMove([2, 2]);
    expect(callCount).toBe(1); // Should not increment
  });

  test('game correctly identifies when it is over', () => {
    const engine = new OthelloGameEngine();

    // Create a completely filled board
    const fullBoard = [
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ];

    const gameOverEngine = new OthelloGameEngine(undefined, undefined, fullBoard as any);

    expect(gameOverEngine.isGameOver()).toBe(true);
    expect(gameOverEngine.getWinner()).toBe('B');
  });
});
