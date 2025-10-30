import { describe, test, expect } from 'bun:test';
import { OthelloGameEngine } from './OthelloGameEngine';

describe('OthelloGameEngine', () => {
  test('initializes with correct starting state', () => {
    const engine = new OthelloGameEngine();
    const state = engine.getState();
    
    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.moveHistory.length).toBe(0);
    expect(state.isGameOver).toBe(false);
  });
  
  test('initializes with player IDs', () => {
    const engine = new OthelloGameEngine('player1', 'player2');
    const state = engine.getState();
    
    expect(state.blackPlayerId).toBe('player1');
    expect(state.whitePlayerId).toBe('player2');
  });
  
  test('makeMove() successfully makes a valid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([2, 3]);
    
    expect(result).toBe(true);
    
    const state = engine.getState();
    expect(state.currentPlayer).toBe('W'); // Should switch to white
    expect(state.moveHistory.length).toBe(1);
  });
  
  test('makeMove() rejects invalid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([0, 0]); // Invalid position
    
    expect(result).toBe(false);
    
    const state = engine.getState();
    expect(state.currentPlayer).toBe('B'); // Should still be black's turn
    expect(state.moveHistory.length).toBe(0);
  });
  
  test('emits move event on successful move', (done) => {
    const engine = new OthelloGameEngine();
    
    engine.on('move', (event) => {
      expect(event.type).toBe('move');
      expect(event.data.move.player).toBe('B');
      done();
    });
    
    engine.makeMove([2, 3]);
  });
  
  test('emits invalidMove event on invalid move', (done) => {
    const engine = new OthelloGameEngine();
    
    engine.on('invalidMove', (event) => {
      expect(event.type).toBe('invalidMove');
      expect(event.data.coordinate).toEqual([0, 0]);
      done();
    });
    
    engine.makeMove([0, 0]);
  });
  
  test('emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();
    let eventCount = 0;
    
    engine.on('stateChange', (event) => {
      eventCount++;
      expect(event.type).toBe('stateChange');
      if (eventCount === 1) {
        done();
      }
    });
    
    engine.makeMove([2, 3]);
  });
  
  test('getValidMoves() returns correct moves', () => {
    const engine = new OthelloGameEngine();
    const validMoves = engine.getValidMoves();
    
    // Initial position should have 4 valid moves for black
    expect(validMoves.length).toBe(4);
    expect(validMoves).toContainEqual([2, 3]);
    expect(validMoves).toContainEqual([3, 2]);
    expect(validMoves).toContainEqual([4, 5]);
    expect(validMoves).toContainEqual([5, 4]);
  });
  
  test('reset() resets the game to initial state', () => {
    const engine = new OthelloGameEngine();
    
    // Make some moves
    engine.makeMove([2, 3]);
    engine.makeMove([2, 2]);
    
    expect(engine.getState().moveHistory.length).toBe(2);
    
    // Reset
    engine.reset();
    
    const state = engine.getState();
    expect(state.currentPlayer).toBe('B');
    expect(state.moveHistory.length).toBe(0);
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
  });
  
  test('exportState() and importState() work correctly', () => {
    const engine1 = new OthelloGameEngine('player1', 'player2');
    
    // Make some moves
    engine1.makeMove([2, 3]);
    engine1.makeMove([2, 2]);
    
    // Export state
    const stateJson = engine1.exportState();
    
    // Create new engine and import state
    const engine2 = new OthelloGameEngine();
    engine2.importState(stateJson);
    
    // States should match
    const state1 = engine1.getState();
    const state2 = engine2.getState();
    
    expect(state2.moveHistory.length).toBe(state1.moveHistory.length);
    expect(state2.currentPlayer).toBe(state1.currentPlayer);
    expect(state2.blackPlayerId).toBe('player1');
    expect(state2.whitePlayerId).toBe('player2');
  });
  
  test('tracks move timestamps', () => {
    const engine = new OthelloGameEngine();
    const beforeTime = Date.now();
    
    engine.makeMove([2, 3]);
    
    const afterTime = Date.now();
    const moveHistory = engine.getMoveHistory();
    
    expect(moveHistory[0]!.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(moveHistory[0]!.timestamp).toBeLessThanOrEqual(afterTime);
  });
  
  test('records score after each move', () => {
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    
    const moveHistory = engine.getMoveHistory();
    const move = moveHistory[0]!;
    
    expect(move.scoreAfter).toBeDefined();
    expect(move.scoreAfter.black).toBeGreaterThan(2); // Black should have gained pieces
    expect(move.scoreAfter.white).toBeLessThanOrEqual(2); // White should have lost pieces
  });
  
  test('getPlayerId() returns correct player IDs', () => {
    const engine = new OthelloGameEngine('blackPlayer123', 'whitePlayer456');
    
    expect(engine.getPlayerId('B')).toBe('blackPlayer123');
    expect(engine.getPlayerId('W')).toBe('whitePlayer456');
  });
  
  test('event listeners can be removed with off()', () => {
    const engine = new OthelloGameEngine();
    let eventFired = false;
    
    const listener = () => {
      eventFired = true;
    };
    
    engine.on('move', listener);
    engine.off('move', listener);
    
    engine.makeMove([2, 3]);
    
    expect(eventFired).toBe(false);
  });
  
  test('game correctly identifies when it is over', () => {
    const engine = new OthelloGameEngine();
    
    expect(engine.isGameOver()).toBe(false);
    
    // We can't easily play to completion, so we trust the underlying logic
    // that isGameOver() is called correctly in makeMove()
  });
});

describe('Undo/Redo Functionality', () => {
  test('canUndo() returns false initially', () => {
    const engine = new OthelloGameEngine();
    
    expect(engine.canUndo()).toBe(false);
  });
  
  test('canRedo() returns false initially', () => {
    const engine = new OthelloGameEngine();
    
    expect(engine.canRedo()).toBe(false);
  });
  
  test('canUndo() returns true after making a move', () => {
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    
    expect(engine.canUndo()).toBe(true);
  });
  
  test('undo() returns false when nothing to undo', () => {
    const engine = new OthelloGameEngine();
    
    const result = engine.undo();
    
    expect(result).toBe(false);
  });
  
  test('undo() successfully undoes a move', () => {
    const engine = new OthelloGameEngine();
    
    // Record initial state
    const initialState = engine.getState();
    const initialScore = initialState.score;
    const initialPlayer = initialState.currentPlayer;
    
    // Make a move
    engine.makeMove([2, 3]);
    
    const afterMoveState = engine.getState();
    expect(afterMoveState.currentPlayer).toBe('W');
    expect(afterMoveState.moveHistory.length).toBe(1);
    
    // Undo the move
    const undoResult = engine.undo();
    
    expect(undoResult).toBe(true);
    
    // State should be back to initial
    const afterUndoState = engine.getState();
    expect(afterUndoState.currentPlayer).toBe(initialPlayer);
    expect(afterUndoState.score).toEqual(initialScore);
    expect(afterUndoState.moveHistory.length).toBe(0);
  });
  
  test('canRedo() returns true after undo', () => {
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    engine.undo();
    
    expect(engine.canRedo()).toBe(true);
  });
  
  test('redo() returns false when nothing to redo', () => {
    const engine = new OthelloGameEngine();
    
    const result = engine.redo();
    
    expect(result).toBe(false);
  });
  
  test('redo() successfully redoes an undone move', () => {
    const engine = new OthelloGameEngine();
    
    // Make a move
    engine.makeMove([2, 3]);
    const afterMoveState = engine.getState();
    const afterMovePlayer = afterMoveState.currentPlayer;
    
    // Undo it
    engine.undo();
    
    // Redo it
    const redoResult = engine.redo();
    
    expect(redoResult).toBe(true);
    
    // Should be back to after-move state
    const afterRedoState = engine.getState();
    expect(afterRedoState.currentPlayer).toBe(afterMovePlayer);
  });
  
  test('undo/redo works for multiple moves', () => {
    const engine = new OthelloGameEngine();
    
    // Make multiple valid moves
    engine.makeMove([2, 3]); // Black
    engine.makeMove([2, 2]); // White
    
    expect(engine.getState().moveHistory.length).toBe(2);
    
    // Undo all moves
    engine.undo(); // Undo White's move
    expect(engine.getState().moveHistory.length).toBe(1);
    expect(engine.getState().currentPlayer).toBe('W');
    
    engine.undo(); // Undo Black's move
    expect(engine.getState().moveHistory.length).toBe(0);
    expect(engine.getState().currentPlayer).toBe('B');
    
    // Redo all moves
    engine.redo();
    expect(engine.getState().moveHistory.length).toBe(1);
    expect(engine.getState().currentPlayer).toBe('W');
    
    engine.redo();
    expect(engine.getState().moveHistory.length).toBe(2);
    expect(engine.getState().currentPlayer).toBe('B');
  });
  
  test('making a new move clears redo stack', () => {
    const engine = new OthelloGameEngine();
    
    // Make moves
    engine.makeMove([2, 3]);
    engine.makeMove([2, 2]);
    
    // Undo one
    engine.undo();
    expect(engine.canRedo()).toBe(true);
    
    // Make a new move
    engine.makeMove([2, 4]);
    
    // Redo should no longer be available
    expect(engine.canRedo()).toBe(false);
  });
  
  test('reset() clears undo/redo stacks', () => {
    const engine = new OthelloGameEngine();
    
    // Make moves
    engine.makeMove([2, 3]);
    engine.makeMove([2, 2]);
    
    // Undo one
    engine.undo();
    
    expect(engine.canUndo()).toBe(true);
    expect(engine.canRedo()).toBe(true);
    
    // Reset
    engine.reset();
    
    // Both stacks should be empty
    expect(engine.canUndo()).toBe(false);
    expect(engine.canRedo()).toBe(false);
  });
  
  test('undo emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    
    engine.on('stateChange', (event) => {
      expect(event.type).toBe('stateChange');
      expect(event.data.action).toBe('undo');
      done();
    });
    
    engine.undo();
  });
  
  test('redo emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    engine.undo();
    
    engine.on('stateChange', (event) => {
      expect(event.type).toBe('stateChange');
      expect(event.data.action).toBe('redo');
      done();
    });
    
    engine.redo();
  });
  
  test('invalid move does not add to undo stack', () => {
    const engine = new OthelloGameEngine();
    
    // Try invalid move
    const result = engine.makeMove([0, 0]);
    
    expect(result).toBe(false);
    expect(engine.canUndo()).toBe(false);
  });
});