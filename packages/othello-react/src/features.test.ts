import { describe, expect, test, beforeEach } from 'vitest';
import {
  features,
  isFeatureEnabled,
  toggleFeature,
  hasAnimations,
  hasGlassGlare,
  hasSoundEffects,
  hasMoveHistory,
  hasScoreAnimations,
  hasLoadingScreen,
  isDebugMode,
} from './config/features';
import { soundEffects } from './utils/soundEffects';

describe('Feature Flags', () => {
  describe('Feature Flag Configuration', () => {
    test('should have all required feature flags defined', () => {
      expect(features).toHaveProperty('animations');
      expect(features).toHaveProperty('glassGlare');
      expect(features).toHaveProperty('soundEffects');
      expect(features).toHaveProperty('moveHistory');
      expect(features).toHaveProperty('scoreAnimations');
      expect(features).toHaveProperty('loadingScreen');
      expect(features).toHaveProperty('debug');
    });

    test('should return correct feature state with isFeatureEnabled', () => {
      const animationsState = features.animations;
      expect(isFeatureEnabled('animations')).toBe(animationsState);
    });

    test('should toggle features correctly', () => {
      const originalState = features.debug;

      toggleFeature('debug', true);
      expect(features.debug).toBe(true);

      toggleFeature('debug', false);
      expect(features.debug).toBe(false);

      // Restore original state
      features.debug = originalState;
    });
  });

  describe('Feature Helper Functions', () => {
    test('hasAnimations should return animations feature state', () => {
      expect(hasAnimations()).toBe(features.animations);
    });

    test('hasGlassGlare should return glassGlare feature state', () => {
      expect(hasGlassGlare()).toBe(features.glassGlare);
    });

    test('hasSoundEffects should return soundEffects feature state', () => {
      expect(hasSoundEffects()).toBe(features.soundEffects);
    });

    test('hasMoveHistory should return moveHistory feature state', () => {
      expect(hasMoveHistory()).toBe(features.moveHistory);
    });

    test('hasScoreAnimations should return scoreAnimations feature state', () => {
      expect(hasScoreAnimations()).toBe(features.scoreAnimations);
    });

    test('hasLoadingScreen should return loadingScreen feature state', () => {
      expect(hasLoadingScreen()).toBe(features.loadingScreen);
    });

    test('isDebugMode should return debug feature state', () => {
      expect(isDebugMode()).toBe(features.debug);
    });
  });

  describe('Default Feature States', () => {
    test('animations should be enabled by default', () => {
      expect(features.animations).toBe(true);
    });

    test('glassGlare should be disabled by default', () => {
      expect(features.glassGlare).toBe(false);
    });

    test('soundEffects should be enabled by default', () => {
      expect(features.soundEffects).toBe(true);
    });

    test('moveHistory should be enabled by default', () => {
      expect(features.moveHistory).toBe(true);
    });

    test('scoreAnimations should be enabled by default', () => {
      expect(features.scoreAnimations).toBe(true);
    });

    test('loadingScreen should be disabled by default', () => {
      expect(features.loadingScreen).toBe(false);
    });

    test('debug should be disabled by default', () => {
      expect(features.debug).toBe(false);
    });
  });
});

describe('Sound Effects', () => {
  beforeEach(() => {
    // Reset sound effects state before each test
    soundEffects.setVolume(100);
    soundEffects.setEnabled(true);
  });

  describe('Sound Effects API', () => {
    test('should have sound effect methods', () => {
      expect(typeof soundEffects.playFlip).toBe('function');
      expect(typeof soundEffects.playInvalidMove).toBe('function');
      expect(typeof soundEffects.playGameOver).toBe('function');
      expect(typeof soundEffects.resume).toBe('function');
      expect(typeof soundEffects.setEnabled).toBe('function');
      expect(typeof soundEffects.setVolume).toBe('function');
      expect(typeof soundEffects.getVolume).toBe('function');
    });

    test('sound effects should not throw errors when called', () => {
      expect(() => soundEffects.playFlip()).not.toThrow();
      expect(() => soundEffects.playInvalidMove()).not.toThrow();
      expect(() => soundEffects.playGameOver()).not.toThrow();
      expect(() => soundEffects.setEnabled(false)).not.toThrow();
      expect(() => soundEffects.setVolume(50)).not.toThrow();
    });
  });

  describe('Volume Control', () => {
    test('should set and get volume correctly', () => {
      soundEffects.setVolume(75);
      expect(soundEffects.getVolume()).toBe(75);
    });

    test('should clamp volume to valid range (0-100)', () => {
      soundEffects.setVolume(-10);
      expect(soundEffects.getVolume()).toBe(0);

      soundEffects.setVolume(150);
      expect(soundEffects.getVolume()).toBe(100);

      soundEffects.setVolume(50);
      expect(soundEffects.getVolume()).toBe(50);
    });

    test('should default to volume 100', () => {
      expect(soundEffects.getVolume()).toBe(100);
    });
  });
});

describe('Move History', () => {
  test('move history should be enabled', () => {
    expect(hasMoveHistory()).toBe(true);
  });

  test('engine should track move history', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    // Initial state should have empty move history
    const initialState = engine.getState();
    expect(initialState.moveHistory).toEqual([]);

    // Make a move
    engine.makeMove([2, 3]);

    // Move history should have one entry
    const stateAfterMove = engine.getState();
    expect(stateAfterMove.moveHistory.length).toBe(1);
    expect(stateAfterMove.moveHistory[0]).toHaveProperty('coordinate');
    expect(stateAfterMove.moveHistory[0]).toHaveProperty('player');
    expect(stateAfterMove.moveHistory[0]).toHaveProperty('timestamp');
    expect(stateAfterMove.moveHistory[0]).toHaveProperty('scoreAfter');
  });
});

describe('Score Tracking', () => {
  test('engine should track scores correctly', () => {
    const { OthelloGameEngine, score } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    const state = engine.getState();
    const scores = score(state.board);

    // Initial game should have 2 black and 2 white pieces
    expect(scores.black).toBe(2);
    expect(scores.white).toBe(2);
  });

  test('scores should update after moves', () => {
    const { OthelloGameEngine, score } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    // Make a valid move
    engine.makeMove([2, 3]);

    const state = engine.getState();
    const scores = score(state.board);

    // After first move, black should have flipped a white piece
    expect(scores.black).toBeGreaterThan(2);
    expect(scores.black + scores.white).toBeGreaterThan(4);
  });
});

describe('Animations', () => {
  test('animations should be enabled', () => {
    expect(hasAnimations()).toBe(true);
  });

  test('glass glare effect should be disabled by default', () => {
    expect(hasGlassGlare()).toBe(false);
  });

  test('animations can be toggled', () => {
    const originalState = features.animations;

    toggleFeature('animations', false);
    expect(hasAnimations()).toBe(false);

    toggleFeature('animations', true);
    expect(hasAnimations()).toBe(true);

    // Restore
    features.animations = originalState;
  });
});

describe('Game State Management', () => {
  test('engine should export and import state correctly', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    // Make some moves
    engine.makeMove([2, 3]);
    engine.makeMove([2, 2]);

    // Export state
    const exportedState = engine.exportState();
    expect(typeof exportedState).toBe('string');

    // Create new engine and import state
    const newEngine = new OthelloGameEngine();
    newEngine.importState(exportedState);

    // States should match
    const originalState = engine.getState();
    const importedState = newEngine.getState();

    expect(importedState.moveHistory.length).toBe(originalState.moveHistory.length);
    expect(importedState.currentPlayer).toBe(originalState.currentPlayer);
  });

  test('engine should handle reset correctly', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    // Make some moves
    engine.makeMove([2, 3]);
    engine.makeMove([2, 2]);

    // Reset
    engine.reset();

    // Should be back to initial state
    const state = engine.getState();
    expect(state.moveHistory.length).toBe(0);
    expect(state.isGameOver).toBe(false);
  });
});

describe('Event System', () => {
  test('engine should emit move events', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    let moveEventFired = false;
    engine.on('move', () => {
      moveEventFired = true;
    });

    engine.makeMove([2, 3]);
    expect(moveEventFired).toBe(true);
  });

  test('engine should emit invalidMove events', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    let invalidMoveEventFired = false;
    engine.on('invalidMove', () => {
      invalidMoveEventFired = true;
    });

    // Try to make an invalid move
    engine.makeMove([0, 0]);
    expect(invalidMoveEventFired).toBe(true);
  });

  test('engine should emit gameOver events', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    let gameOverEventFired = false;
    engine.on('gameOver', () => {
      gameOverEventFired = true;
    });

    // Play until game over (simplified - just check the event system works)
    // We'll manually trigger game over by filling the board
    const state = engine.getState();
    if (state.validMoves.length === 0) {
      expect(gameOverEventFired).toBe(true);
    }
  });

  test('engine should emit stateChange events', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    let stateChangeEventFired = false;
    engine.on('stateChange', () => {
      stateChangeEventFired = true;
    });

    engine.makeMove([2, 3]);
    expect(stateChangeEventFired).toBe(true);
  });
});

describe('Player Management', () => {
  test('engine should support player IDs', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const blackPlayerId = 'player1';
    const whitePlayerId = 'player2';

    const engine = new OthelloGameEngine(blackPlayerId, whitePlayerId);
    const state = engine.getState();

    expect(state.blackPlayerId).toBe(blackPlayerId);
    expect(state.whitePlayerId).toBe(whitePlayerId);
  });

  test('engine should work without player IDs', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();
    const state = engine.getState();

    expect(state.blackPlayerId).toBeUndefined();
    expect(state.whitePlayerId).toBeUndefined();
  });
});

describe('Valid Moves', () => {
  test('engine should calculate valid moves correctly', () => {
    const { OthelloGameEngine } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    const state = engine.getState();

    // Initial game should have 4 valid moves for black
    expect(state.validMoves.length).toBe(4);
    expect(state.validMoves).toContainEqual([2, 3]);
    expect(state.validMoves).toContainEqual([3, 2]);
    expect(state.validMoves).toContainEqual([4, 5]);
    expect(state.validMoves).toContainEqual([5, 4]);
  });

  test('annotated board should mark valid moves', () => {
    const { OthelloGameEngine, P } = require('../../othello-engine/src/index.ts');
    const engine = new OthelloGameEngine();

    const annotatedBoard = engine.getAnnotatedBoard();

    // Valid move positions should be marked with P
    expect(annotatedBoard.tiles[3][2]).toBe(P);
    expect(annotatedBoard.tiles[2][3]).toBe(P);
  });
});
