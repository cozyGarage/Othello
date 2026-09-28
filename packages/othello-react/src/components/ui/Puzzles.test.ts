import { describe, expect, test } from 'vitest';
import { puzzleIndexForDifficulty } from './Puzzles';

const puzzles = [
  { difficulty: 'easy' },
  { difficulty: 'medium' },
  { difficulty: 'medium' },
  { difficulty: 'hard' },
  { difficulty: 'easy' },
];

describe('puzzleIndexForDifficulty', () => {
  test('keeps the full list for all', () => {
    expect(puzzleIndexForDifficulty(puzzles, 'all')).toBe(0);
    expect(puzzleIndexForDifficulty([], 'all')).toBe(-1);
  });

  test('selects the first puzzle of that difficulty', () => {
    expect(puzzleIndexForDifficulty(puzzles, 'medium')).toBe(1);
    expect(puzzleIndexForDifficulty(puzzles, 'hard')).toBe(3);
    expect(puzzleIndexForDifficulty(puzzles, 'easy')).toBe(0);
  });
});
