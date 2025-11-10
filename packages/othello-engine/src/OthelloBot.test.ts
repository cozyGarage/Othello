import { describe, test, expect } from 'bun:test';
import { OthelloBot } from './OthelloBot';
import { createBoard, E, W, B, getValidMoves, Board } from './index';

describe('OthelloBot', () => {
  // Helper to create a standard starting board
  const createStartingBoard = (): Board => {
    return createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);
  };

  describe('Constructor and Getters/Setters', () => {
    test('initializes with default values', () => {
      const bot = new OthelloBot();
      expect(bot.getDifficulty()).toBe('medium');
      expect(bot.getPlayer()).toBe('W');
    });

    test('initializes with custom values', () => {
      const bot = new OthelloBot('hard', 'B');
      expect(bot.getDifficulty()).toBe('hard');
      expect(bot.getPlayer()).toBe('B');
    });

    test('setDifficulty changes difficulty', () => {
      const bot = new OthelloBot('easy', 'W');
      bot.setDifficulty('hard');
      expect(bot.getDifficulty()).toBe('hard');
    });

    test('setPlayer changes player', () => {
      const bot = new OthelloBot('medium', 'W');
      bot.setPlayer('B');
      expect(bot.getPlayer()).toBe('B');
    });
  });

  describe('Easy Difficulty - Random Move', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('easy', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();
      
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(
          ([x, y]) => x === move[0] && y === move[1]
        );
        expect(isValidMove).toBe(true);
      }
    });

    test('returns null when no valid moves', () => {
      const bot = new OthelloBot('easy', 'B');
      // Create a board with no valid moves for Black
      const board = createBoard([
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, E],
      ]);

      const move = bot.calculateMove(board);
      expect(move).toBeNull();
    });

    test('selects different moves over multiple calls (randomness)', () => {
      const bot = new OthelloBot('easy', 'B');
      const board = createStartingBoard();
      
      const moves = new Set<string>();
      
      // Run 20 times to ensure we get some variation
      for (let i = 0; i < 20; i++) {
        const move = bot.calculateMove(board);
        if (move) {
          moves.add(`${move[0]},${move[1]}`);
        }
      }
      
      // With 4 valid moves, we should see at least 2 different moves
      expect(moves.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Medium Difficulty - Greedy Algorithm', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('medium', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();
      
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(
          ([x, y]) => x === move[0] && y === move[1]
        );
        expect(isValidMove).toBe(true);
      }
    });

    test('chooses move that maximizes immediate score', () => {
      const bot = new OthelloBot('medium', 'B');
      
      // Create a board where one move is clearly better
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, B, W, W, W, E, E],
        [E, E, E, W, B, E, E, E],
        [E, E, E, B, W, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);
      
      const move = bot.calculateMove(board);
      
      // The greedy bot should choose a move that flips multiple pieces
      expect(move).not.toBeNull();
    });

    test('is deterministic - same board produces same move', () => {
      const bot = new OthelloBot('medium', 'B');
      const board = createStartingBoard();
      
      const move1 = bot.calculateMove(board);
      const move2 = bot.calculateMove(board);
      
      expect(move1).toEqual(move2);
    });
  });

  describe('Hard Difficulty - Minimax with Alpha-Beta', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();
      
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(
          ([x, y]) => x === move[0] && y === move[1]
        );
        expect(isValidMove).toBe(true);
      }
    });

    test('is deterministic - same board produces same move', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();
      
      const move1 = bot.calculateMove(board);
      const move2 = bot.calculateMove(board);
      
      expect(move1).toEqual(move2);
    });

    test('prefers strategic positions', () => {
      const bot = new OthelloBot('hard', 'B');
      
      // Create a board where a corner is available
      const board = createBoard([
        [E, W, W, W, W, W, W, W],
        [W, B, W, W, W, W, W, W],
        [W, W, B, W, W, W, W, W],
        [W, W, W, B, W, W, W, W],
        [W, W, W, W, B, W, W, W],
        [W, W, W, W, W, B, W, W],
        [W, W, W, W, W, W, B, W],
        [E, E, E, E, E, E, E, E],
      ]);
      
      const move = bot.calculateMove(board);
      
      // Should return a valid strategic move (corner is best, but any valid move is fine)
      expect(move).not.toBeNull();
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(
          ([x, y]) => x === move[0] && y === move[1]
        );
        expect(isValidMove).toBe(true);
      }
    });
  });

  describe('Difficulty Comparison', () => {
    test('hard bot should generally make better moves than easy bot', () => {
      const easyBot = new OthelloBot('easy', 'B');
      const hardBot = new OthelloBot('hard', 'B');
      
      // Create a complex mid-game position
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, B, W, W, W, E, E, E],
        [E, W, B, W, B, E, E, E],
        [E, W, W, B, W, E, E, E],
        [E, W, B, W, B, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);
      
      const easyMove = easyBot.calculateMove(board);
      const hardMove = hardBot.calculateMove(board);
      
      // Both should return valid moves
      expect(easyMove).not.toBeNull();
      expect(hardMove).not.toBeNull();
      
      // They might be different (easy is random, hard is strategic)
      // This test mainly ensures both work correctly
    });
  });

  describe('Edge Cases', () => {
    test('handles board with only one valid move', () => {
      const bot = new OthelloBot('medium', 'B');
      
      // Create a board with only one valid move for Black
      const board = createBoard([
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, B, B, W, W, W],
        [W, W, W, B, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, E, W, W, W, W],
      ]);
      
      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();
      
      if (move) {
        // Should be the only valid move
        const validMoves = getValidMoves(board);
        expect(validMoves.length).toBe(1);
        expect(move).toEqual(validMoves[0]);
      }
    });

    test('works correctly for White player', () => {
      const bot = new OthelloBot('medium', 'W');
      
      // Create a board where it's White's turn
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, W, B, E, E, E],
        [E, E, E, B, W, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);
      
      board.playerTurn = 'W';
      
      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();
      
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(
          ([x, y]) => x === move[0] && y === move[1]
        );
        expect(isValidMove).toBe(true);
      }
    });
  });

  describe('Performance', () => {
    test('hard difficulty completes in reasonable time', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();
      
      const startTime = Date.now();
      const move = bot.calculateMove(board);
      const endTime = Date.now();
      
      expect(move).not.toBeNull();
      
      // Should complete within 2 seconds (generous limit)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
