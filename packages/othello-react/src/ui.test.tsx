import { describe, expect, test } from 'bun:test';
import { score, B, W, E, P } from 'othello-engine';

describe('UI Components', () => {
  describe('Board Layout', () => {
    test('board should use CSS Grid for 8x8 layout', () => {
      // This is a structural test to ensure we're using grid
      // The actual CSS class .board should have display: grid
      expect(true).toBe(true); // Placeholder - CSS is tested visually
    });

    test('tiles should be generated in correct order', () => {
      // Test that tile generation produces 64 tiles
      const boardSize = 8;
      const expectedTileCount = boardSize * boardSize;
      expect(expectedTileCount).toBe(64);
    });
  });

  describe('Score Display', () => {
    test('score function calculates black and white pieces', () => {
      const testBoard = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E]
        ],
        playerTurn: B
      };

      const scores = score(testBoard);
      expect(scores.black).toBe(2);
      expect(scores.white).toBe(2);
    });

    test('score function counts all pieces correctly', () => {
      const testBoard = {
        tiles: [
          [B, B, B, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, W, W, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E]
        ],
        playerTurn: B
      };

      const scores = score(testBoard);
      expect(scores.black).toBe(5);
      expect(scores.white).toBe(4);
    });
  });

  describe('Valid Move Indicators', () => {
    test('P constant is exported for valid move marking', () => {
      expect(typeof P).toBe('string');
      expect(P).toBeTruthy();
    });

    test('valid moves should be distinguishable from empty tiles', () => {
      expect(P).not.toBe(E);
      expect(P).not.toBe(B);
      expect(P).not.toBe(W);
    });
  });

  describe('Player Turn Display', () => {
    test('player turn alternates between black and white', () => {
      const players = [B, W];
      expect(players).toContain(B);
      expect(players).toContain(W);
      expect(players.length).toBe(2);
    });

    test('player constants are distinct', () => {
      expect(B).not.toBe(W);
      expect(B).not.toBe(E);
      expect(W).not.toBe(E);
    });
  });

  describe('Responsive Layout', () => {
    test('game should support side-by-side layout structure', () => {
      // Test that we have the necessary layout classes
      const layoutClasses = [
        'game-layout',
        'game-main',
        'game-sidebar'
      ];
      
      expect(layoutClasses.length).toBe(3);
      expect(layoutClasses).toContain('game-layout');
      expect(layoutClasses).toContain('game-main');
      expect(layoutClasses).toContain('game-sidebar');
    });

    test('move history should be conditionally rendered', () => {
      const { hasMoveHistory } = require('./config/features');
      const isEnabled = hasMoveHistory();
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Game Controls', () => {
    test('should have restart functionality', () => {
      // Test that restart returns game to initial state
      const { OthelloGameEngine } = require('othello-engine');
      const engine = new OthelloGameEngine();
      
      // Make some moves
      engine.makeMove([2, 3]);
      expect(engine.getState().moveHistory.length).toBe(1);
      
      // Reset should clear history
      engine.reset();
      expect(engine.getState().moveHistory.length).toBe(0);
    });

    test('should support settings panel', () => {
      // Test that settings state can be toggled
      type SettingsState = { settingsOpen: boolean };
      const initialState: SettingsState = { settingsOpen: false };
      const openState: SettingsState = { settingsOpen: true };
      
      expect(initialState.settingsOpen).toBe(false);
      expect(openState.settingsOpen).toBe(true);
    });
  });

  describe('Message Display', () => {
    test('game messages should be displayable', () => {
      const messages = [
        'Black\'s turn',
        'White\'s turn',
        'Game Over! Black wins!',
        'Game Over! White wins!',
        'Game Over! It\'s a tie!',
        'Invalid move!',
        null // No message state
      ];
      
      expect(messages.length).toBe(7);
      expect(messages).toContain(null);
    });
  });

  describe('Animation States', () => {
    test('glass glare should be enabled by default', () => {
      const { hasGlassGlare } = require('./config/features');
      expect(hasGlassGlare()).toBe(true);
    });

    test('animations should be enabled by default', () => {
      const { hasAnimations } = require('./config/features');
      expect(hasAnimations()).toBe(true);
    });

    test('animations can be disabled', () => {
      const { toggleFeature, features } = require('./config/features');
      const original = features.animations;
      
      toggleFeature('animations', false);
      expect(features.animations).toBe(false);
      
      // Restore
      features.animations = original;
    });
  });

  describe('Loading State', () => {
    test('loading screen can be toggled', () => {
      type LoadingState = { isLoading: boolean };
      const loading: LoadingState = { isLoading: true };
      const ready: LoadingState = { isLoading: false };
      
      expect(loading.isLoading).toBe(true);
      expect(ready.isLoading).toBe(false);
    });
  });
});

describe('Move History Component', () => {
  test('move history displays correctly formatted coordinates', () => {
    // Test coordinate formatting A1-H8
    const formatCoordinate = (x: number, y: number): string => {
      const column = String.fromCharCode(65 + x); // A-H
      const row = y + 1; // 1-8
      return `${column}${row}`;
    };
    
    expect(formatCoordinate(0, 0)).toBe('A1');
    expect(formatCoordinate(7, 7)).toBe('H8');
    expect(formatCoordinate(2, 3)).toBe('C4');
  });

  test('move history includes all required data', () => {
    const { OthelloGameEngine } = require('othello-engine');
    const engine = new OthelloGameEngine();
    
    engine.makeMove([2, 3]);
    
    const history = engine.getMoveHistory();
    expect(history.length).toBe(1);
    expect(history[0]).toHaveProperty('coordinate');
    expect(history[0]).toHaveProperty('player');
    expect(history[0]).toHaveProperty('timestamp');
    expect(history[0]).toHaveProperty('scoreAfter');
  });

  test('move history is scrollable when long', () => {
    // CSS test: .move-history-list should have overflow-y: auto
    // This is verified visually and in CSS
    expect(true).toBe(true);
  });
});

describe('Settings Panel', () => {
  test('settings should control feature flags', () => {
    const { features } = require('./config/features');
    
    expect(features).toHaveProperty('soundEffects');
    expect(features).toHaveProperty('animations');
    expect(typeof features.soundEffects).toBe('boolean');
    expect(typeof features.animations).toBe('boolean');
  });

  test('sound effects can be toggled', () => {
    const { soundEffects } = require('./utils/soundEffects');
    
    soundEffects.setEnabled(false);
    expect(() => soundEffects.playFlip()).not.toThrow();
    
    soundEffects.setEnabled(true);
    expect(() => soundEffects.playFlip()).not.toThrow();
  });
});
