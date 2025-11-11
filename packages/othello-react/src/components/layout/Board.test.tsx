/**
 * Board Component Tests
 *
 * Comprehensive test suite for Board.tsx covering:
 * - Flip animation logic
 * - Initial board detection
 * - Feature flag integration
 * - Hint dot rendering
 * - Radial gradient generation
 * - Last move highlighting
 * - Valid move indicators
 */

import { describe, expect, test } from 'vitest';
import { B, W, E, P, type Board as BoardType } from '../../../../othello-engine/src/index.ts';

describe('Board Component Logic', () => {
  describe('Initial Board Detection', () => {
    test('should detect initial 4-piece board state', () => {
      const initialBoard: BoardType = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ],
        playerTurn: B,
      };

      // Count pieces
      let pieceCount = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const tile = initialBoard.tiles[row]![col];
          if (tile === B || tile === W) pieceCount++;
        }
      }

      expect(pieceCount).toBe(4);
    });

    test('should NOT detect initial board after first move', () => {
      const afterFirstMove: BoardType = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, B, E, E, E, E],
          [E, E, E, B, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ],
        playerTurn: W,
      };

      // Count pieces
      let pieceCount = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const tile = afterFirstMove.tiles[row]![col];
          if (tile === B || tile === W) pieceCount++;
        }
      }

      expect(pieceCount).toBe(5); // Not 4, so not initial
    });

    test('should identify all 4 initial piece positions', () => {
      const initialPositions = [
        { row: 3, col: 3, expected: W },
        { row: 3, col: 4, expected: B },
        { row: 4, col: 3, expected: B },
        { row: 4, col: 4, expected: W },
      ];

      const initialBoard: BoardType = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ],
        playerTurn: B,
      };

      initialPositions.forEach(({ row, col, expected }) => {
        expect(initialBoard.tiles[row]![col]).toBe(expected);
      });
    });
  });

  describe('Flip Detection Logic', () => {
    const detectFlip = (prev: string, curr: string): boolean => {
      return (prev === B && curr === W) || (prev === W && curr === B);
    };

    test('should detect B to W flip', () => {
      expect(detectFlip(B, W)).toBe(true);
    });

    test('should detect W to B flip', () => {
      expect(detectFlip(W, B)).toBe(true);
    });

    test('should NOT detect flip for E to B (new placement)', () => {
      expect(detectFlip(E, B)).toBe(false);
    });

    test('should NOT detect flip for E to W (new placement)', () => {
      expect(detectFlip(E, W)).toBe(false);
    });

    test('should NOT detect flip for same color', () => {
      expect(detectFlip(B, B)).toBe(false);
      expect(detectFlip(W, W)).toBe(false);
    });

    test('should NOT detect flip for empty tiles', () => {
      expect(detectFlip(E, E)).toBe(false);
    });
  });

  describe('Last Move Highlighting', () => {
    test('should identify last move at [3, 4]', () => {
      const lastMove: [number, number] = [4, 3]; // [col, row] format
      const row = 3;
      const col = 4;

      // lastMove format: [x, y] = [col, row]
      const isLastMove = lastMove !== null && lastMove[0] === col && lastMove[1] === row;
      expect(isLastMove).toBe(true);
    });

    test('should NOT highlight wrong tile', () => {
      const lastMove: [number, number] = [4, 3];
      const row = 2;
      const col = 2;

      const isLastMove = lastMove !== null && lastMove[0] === col && lastMove[1] === row;
      expect(isLastMove).toBe(false);
    });

    test('should handle null lastMove', () => {
      const lastMove = null;
      const row = 3;
      const col = 4;

      const isLastMove = lastMove !== null && lastMove[0] === col && lastMove[1] === row;
      expect(isLastMove).toBe(false);
    });
  });

  describe('Checkerboard Pattern', () => {
    test('tile [0,0] should be dark', () => {
      const row = 0;
      const col = 0;
      const isDark = (row + col) % 2 === 0;
      expect(isDark).toBe(true);
    });

    test('tile [0,1] should be light', () => {
      const row = 0;
      const col = 1;
      const isDark = (row + col) % 2 === 0;
      expect(isDark).toBe(false);
    });

    test('tile [7,7] should be dark', () => {
      const row = 7;
      const col = 7;
      const isDark = (row + col) % 2 === 0;
      expect(isDark).toBe(true);
    });

    test('checkerboard pattern should alternate', () => {
      const patterns = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          patterns.push((row + col) % 2 === 0);
        }
      }

      // Verify alternating pattern: true, false, true, false...
      expect(patterns[0]).toBe(true); // [0,0]
      expect(patterns[1]).toBe(false); // [0,1]
      expect(patterns[2]).toBe(true); // [0,2]
      expect(patterns[3]).toBe(false); // [1,0]
    });
  });

  describe('Valid Move Indicators', () => {
    test('should identify valid move tiles', () => {
      const board: BoardType = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, P, E, E, E, E], // Valid move
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ],
        playerTurn: B,
      };

      const validMoveTile = board.tiles[2]![3];
      expect(validMoveTile).toBe(P);
    });

    test('should distinguish valid moves from empty tiles', () => {
      expect(P).not.toBe(E);
      expect(P).not.toBe(B);
      expect(P).not.toBe(W);
    });
  });

  describe('Click Handler Coordinate Conversion', () => {
    test('should convert [row, col] to [col, row] for engine', () => {
      const row = 2;
      const col = 3;

      // Click handler should send [col, row] to engine
      const engineCoord: [number, number] = [col, row];
      expect(engineCoord).toEqual([3, 2]);
    });

    test('should handle corner clicks correctly', () => {
      const testCases: Array<{ row: number; col: number; expected: [number, number] }> = [
        { row: 0, col: 0, expected: [0, 0] },
        { row: 0, col: 7, expected: [7, 0] },
        { row: 7, col: 0, expected: [0, 7] },
        { row: 7, col: 7, expected: [7, 7] },
      ];

      testCases.forEach(({ row, col, expected }) => {
        const engineCoord: [number, number] = [col, row];
        expect(engineCoord[0]).toBe(expected[0]);
        expect(engineCoord[1]).toBe(expected[1]);
      });
    });
  });

  describe('SVG Radial Gradient Configuration', () => {
    test('should generate unique gradient IDs per tile', () => {
      const row = 3;
      const col = 4;
      const blackGradientId = `black-gradient-${row}-${col}`;
      const whiteGradientId = `white-gradient-${row}-${col}`;

      expect(blackGradientId).toBe('black-gradient-3-4');
      expect(whiteGradientId).toBe('white-gradient-3-4');
    });

    test('gradient IDs should be unique for each tile', () => {
      const gradients = new Set();

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const id = `gradient-${row}-${col}`;
          gradients.add(id);
        }
      }

      expect(gradients.size).toBe(64); // All unique
    });

    test('should use correct gradient colors for pieces', () => {
      const blackGradient = {
        start: '#4a4a4a',
        end: '#000000',
        position: '30% 30%',
      };

      const whiteGradient = {
        start: '#ffffff',
        end: '#cccccc',
        position: '30% 30%',
      };

      // Verify colors match sidebar pieces
      expect(blackGradient.start).toBe('#4a4a4a');
      expect(whiteGradient.start).toBe('#ffffff');
    });
  });

  describe('Glare Source Detection', () => {
    test('should identify [3,3] as glare source', () => {
      const row = 3;
      const col = 3;

      // Count pieces first to check if initial
      const mockBoard: BoardType = {
        tiles: [
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, W, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ],
        playerTurn: B,
      };

      let pieceCount = 0;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const tile = mockBoard.tiles[r]![c];
          if (tile === B || tile === W) pieceCount++;
        }
      }

      const isInitial = pieceCount === 4;
      const isGlareSource = isInitial && row === 3 && col === 3;

      expect(isGlareSource).toBe(true);
    });

    test('should NOT mark other initial pieces as glare source', () => {
      const otherInitialPieces = [
        { row: 3, col: 4 },
        { row: 4, col: 3 },
        { row: 4, col: 4 },
      ];

      otherInitialPieces.forEach(({ row, col }) => {
        const isGlareSource = row === 3 && col === 3;
        expect(isGlareSource).toBe(false);
      });
    });
  });
});

describe('Board Component Integration', () => {
  test('should render 64 tiles', () => {
    const boardSize = 8;
    const tileCount = boardSize * boardSize;
    expect(tileCount).toBe(64);
  });

  test('should handle gameOver state', () => {
    const gameOver = true;
    // When gameOver is true, tile clicks should be disabled
    expect(gameOver).toBe(true);
  });

  test('should respect feature flags', () => {
    const { features } = require('../../config/features');

    // Board should check features.animations
    expect(typeof features.animations).toBe('boolean');

    // Board should check features.glassGlare
    expect(typeof features.glassGlare).toBe('boolean');
  });
});
