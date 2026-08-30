import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { OthelloGameEngine } from 'othello-engine';
import { useTimeControl } from './useTimeControl';

describe('useTimeControl', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('enabling time control attaches clocks and exposes remaining time', () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useTimeControl({ engine, gameOver: false }));

    expect(result.current.timeRemaining).toBeNull();

    act(() => {
      result.current.setTimeControlEnabled(true);
    });

    expect(engine.hasTimeControl()).toBe(true);
    expect(result.current.timeControlEnabled).toBe(true);
    expect(result.current.timeRemaining).not.toBeNull();
    expect(result.current.timeRemaining?.black).toBeGreaterThan(0);
  });

  test('pause and resume stop and continue the active clock', () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useTimeControl({ engine, gameOver: false }));

    act(() => {
      result.current.setTimeControlEnabled(true);
    });

    const before = result.current.timeRemaining?.black ?? 0;

    act(() => {
      result.current.pauseTime();
      vi.advanceTimersByTime(500);
    });

    // Interval should not keep ticking display while paused via engine pause;
    // force a poll by advancing and reading engine directly.
    const pausedRemaining = engine.getTimeRemaining()?.black ?? 0;
    expect(pausedRemaining).toBe(before);

    act(() => {
      result.current.resumeTime();
      vi.advanceTimersByTime(300);
    });

    const after = engine.getTimeRemaining()?.black ?? 0;
    expect(after).toBeLessThan(pausedRemaining);
  });

  test('fires onTimeWarning once per side under the low-time threshold', () => {
    const engine = new OthelloGameEngine(undefined, undefined, undefined, {
      initialTime: 12_000,
      increment: 0,
    });
    const onTimeWarning = vi.fn();

    renderHook(() => useTimeControl({ engine, gameOver: false, onTimeWarning }));

    act(() => {
      // Drop below 10s warning threshold without timing out
      vi.advanceTimersByTime(3_000);
    });

    expect(onTimeWarning).toHaveBeenCalled();
    expect(onTimeWarning.mock.calls.some((c) => c[0] === 'B')).toBe(true);
  });

  test('disabling time control clears clocks', () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useTimeControl({ engine, gameOver: false }));

    act(() => {
      result.current.setTimeControlEnabled(true);
      result.current.setTimeControlEnabled(false);
    });

    expect(engine.hasTimeControl()).toBe(false);
    expect(result.current.timeRemaining).toBeNull();
    expect(window.localStorage.getItem('othello:timeControlEnabled')).toBe('false');
  });

  test('fires onTimeout when the active clock expires', () => {
    const engine = new OthelloGameEngine(undefined, undefined, undefined, {
      initialTime: 50,
      increment: 0,
    });
    const onTimeout = vi.fn();

    renderHook(() => useTimeControl({ engine, gameOver: false, onTimeout }));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onTimeout).toHaveBeenCalled();
    expect(engine.isGameOver()).toBe(true);
    expect(engine.getState().endedByTimeout).toBe(true);
  });
});
