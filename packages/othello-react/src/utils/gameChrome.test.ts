import { beforeEach, describe, expect, test } from 'vitest';
import { clearGameRecords, getGameRecords, persistCompletedGame } from './gameStatistics';
import { buildGameOverMessage, buildMoveAnnouncement } from './moveAnnouncements';
import { initialHintsRemaining, resolveGameShortcut } from './gameChromeHelpers';

describe('persistCompletedGame', () => {
  beforeEach(() => {
    clearGameRecords();
  });

  test('persists a human-vs-AI win with averaged move times', () => {
    persistCompletedGame({
      winner: 'B',
      isTimeout: false,
      moveTimestamps: [1000, 3000, 5000],
      gameStartTime: 1000,
      aiEnabled: true,
      aiDifficulty: 'medium',
      aiPlayer: 'W',
      spectatorMode: false,
      timeControlEnabled: true,
      finalScore: { black: 40, white: 24 },
      moveHistory: [
        { player: 'B', coordinate: [2, 3] },
        { player: 'W', coordinate: [2, 2] },
      ],
    });

    const records = getGameRecords();
    expect(records).toHaveLength(1);
    const record = records[0]!;
    expect(record.winner).toBe('B');
    expect(record.humanPlayer).toBe('B');
    expect(record.aiDifficulty).toBe('medium');
    expect(record.spectatorMode).toBe(false);
    expect(record.finalScore).toEqual({ black: 40, white: 24 });
    expect(record.totalMoves).toBe(2);
    expect(record.avgMoveTime).toBe(2000);
    expect(record.timeControlEnabled).toBe(true);
    expect(record.endedByTimeout).toBe(false);
    expect(record.moves).toEqual([
      { player: 'B', coordinate: [2, 3] },
      { player: 'W', coordinate: [2, 2] },
    ]);
  });

  test('marks spectator games without a human player', () => {
    persistCompletedGame({
      winner: 'W',
      isTimeout: true,
      moveTimestamps: [1],
      gameStartTime: Date.now() - 5000,
      aiEnabled: false,
      aiDifficulty: 'hard',
      aiPlayer: 'B',
      spectatorMode: true,
      timeControlEnabled: false,
      finalScore: { black: 20, white: 44 },
      moveHistory: [],
    });

    const record = getGameRecords()[0]!;
    expect(record.humanPlayer).toBeNull();
    expect(record.aiDifficulty).toBeNull();
    expect(record.spectatorMode).toBe(true);
    expect(record.endedByTimeout).toBe(true);
    expect(record.avgMoveTime).toBe(0);
  });
});

describe('buildMoveAnnouncement', () => {
  test('announces a normal turn change', () => {
    const result = buildMoveAnnouncement(
      { player: 'B', coordinate: [2, 3] },
      {
        passedOpponent: false,
        currentPlayer: 'W',
        score: { black: 4, white: 1 },
      }
    );

    expect(result.timedMessage).toBeNull();
    expect(result.srAnnouncement).toContain('Black played c5');
    expect(result.srAnnouncement).toContain("White's turn");
    expect(result.srAnnouncement).toContain('Score: Black 4, White 1.');
  });

  test('announces opponent pass with timed message', () => {
    const result = buildMoveAnnouncement(
      { player: 'W', coordinate: [0, 0] },
      {
        passedOpponent: true,
        currentPlayer: 'W',
        score: { black: 10, white: 12 },
      }
    );

    expect(result.timedMessage).toBe('Black has no valid moves and must pass!');
    expect(result.timedMessageMs).toBe(2500);
    expect(result.srAnnouncement).toContain('White played a8');
    expect(result.srAnnouncement).toContain('Black must pass');
  });
});

describe('buildGameOverMessage', () => {
  test('covers win and draw cases', () => {
    expect(buildGameOverMessage('B')).toBe('Game Over! Black wins!');
    expect(buildGameOverMessage('W')).toBe('Game Over! White wins!');
    expect(buildGameOverMessage(null)).toBe("Game Over! It's a tie!");
  });
});

describe('resolveGameShortcut', () => {
  const base = {
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    target: { tagName: 'DIV' },
  };

  test('maps primary shortcuts', () => {
    expect(resolveGameShortcut({ ...base, key: 'n' })).toBe('newGame');
    expect(resolveGameShortcut({ ...base, key: 'S' })).toBe('openSettings');
    expect(resolveGameShortcut({ ...base, key: 'z' })).toBe('undo');
    expect(resolveGameShortcut({ ...base, key: 'Y' })).toBe('redo');
    expect(resolveGameShortcut({ ...base, key: 'Escape' })).toBe('escape');
    expect(resolveGameShortcut({ ...base, key: '?' })).toBe('help');
    expect(resolveGameShortcut({ ...base, key: '/', shiftKey: true })).toBe('help');
  });

  test('ignores form fields and chorded undo/redo', () => {
    expect(resolveGameShortcut({ ...base, key: 'n', target: { tagName: 'INPUT' } })).toBeNull();
    expect(resolveGameShortcut({ ...base, key: 'z', ctrlKey: true })).toBeNull();
    expect(resolveGameShortcut({ ...base, key: 'x' })).toBeNull();
  });
});

describe('initialHintsRemaining', () => {
  test('treats 0 as unlimited budget', () => {
    expect(initialHintsRemaining(0)).toBe(999);
    expect(initialHintsRemaining(3)).toBe(3);
  });
});
