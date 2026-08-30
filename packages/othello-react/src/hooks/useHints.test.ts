import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHints } from './useHints';

describe('useHints', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts with default budget and disabled highlight', () => {
    const { result } = renderHook(() => useHints());
    expect(result.current.hintsPerGame).toBe(3);
    expect(result.current.hintsRemaining).toBe(3);
    expect(result.current.hintsEnabled).toBe(false);
    expect(result.current.hintMove).toBeNull();
  });

  test('requestHint spends budget and clears after 5s', () => {
    const { result } = renderHook(() => useHints());

    act(() => {
      result.current.requestHint(false);
    });

    expect(result.current.hintsEnabled).toBe(true);
    expect(result.current.hintsRemaining).toBe(2);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.hintsEnabled).toBe(false);
    expect(result.current.hintMove).toBeNull();
  });

  test('requestHint is a no-op when game is over or budget is empty', () => {
    const { result } = renderHook(() => useHints());

    act(() => {
      result.current.requestHint(true);
    });
    expect(result.current.hintsRemaining).toBe(3);
    expect(result.current.hintsEnabled).toBe(false);

    act(() => {
      result.current.setHintsPerGame(1);
      result.current.requestHint(false);
    });
    expect(result.current.hintsRemaining).toBe(0);

    act(() => {
      result.current.requestHint(false);
    });
    // Already spent the only hint — still enabled from the prior request, but budget stays 0
    expect(result.current.hintsRemaining).toBe(0);
  });

  test('resetHintsForNewGame restores budget and clears timers', () => {
    const { result } = renderHook(() => useHints());

    act(() => {
      result.current.requestHint(false);
      result.current.setHintMove([2, 3]);
      result.current.resetHintsForNewGame();
    });

    expect(result.current.hintsEnabled).toBe(false);
    expect(result.current.hintMove).toBeNull();
    expect(result.current.hintsRemaining).toBe(result.current.hintsPerGame);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Prior timeout was cleared — should not re-enable anything weird
    expect(result.current.hintsEnabled).toBe(false);
  });

  test('setHintsPerGame persists preference', () => {
    const { result } = renderHook(() => useHints());

    act(() => {
      result.current.setHintsPerGame(5);
    });

    expect(result.current.hintsPerGame).toBe(5);
    expect(result.current.hintsRemaining).toBe(5);
    expect(window.localStorage.getItem('othello:hintsPerGame')).toBe('5');
  });
});
