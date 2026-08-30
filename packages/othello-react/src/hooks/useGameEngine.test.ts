import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';

describe('useGameEngine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as { engine?: unknown }).engine;
  });

  afterEach(() => {
    delete (window as { engine?: unknown }).engine;
  });

  test('exposes engine on window and mirrors starting board', () => {
    const { result, unmount } = renderHook(() => useGameEngine());

    expect(result.current.gameOver).toBe(false);
    expect(result.current.moveHistory).toHaveLength(0);
    expect(result.current.lastMove).toBeNull();
    expect(result.current.evaluationHistory).toEqual([{ move: 0, evaluation: 0 }]);
    expect((window as { engine?: unknown }).engine).toBe(result.current.engine);

    unmount();
    expect((window as { engine?: unknown }).engine).toBeUndefined();
  });

  test('makeMove updates history and lastMove via engine events', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useGameEngine({ onMove }));

    act(() => {
      result.current.makeMove([3, 2]);
    });

    expect(result.current.moveHistory).toHaveLength(1);
    expect(result.current.lastMove).toEqual([3, 2]);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(result.current.evaluationHistory.length).toBeGreaterThan(1);
  });

  test('invalid moves call onInvalidMove and leave history empty', () => {
    const onInvalidMove = vi.fn();
    const { result } = renderHook(() => useGameEngine({ onInvalidMove }));

    act(() => {
      result.current.makeMove([0, 0]);
    });

    expect(result.current.moveHistory).toHaveLength(0);
    expect(onInvalidMove).toHaveBeenCalled();
    expect(typeof onInvalidMove.mock.calls[0]?.[0]).toBe('string');
  });

  test('undo and redo restore mirrored React state', () => {
    const { result } = renderHook(() => useGameEngine());

    act(() => {
      result.current.makeMove([3, 2]);
    });
    expect(result.current.canUndo()).toBe(true);

    act(() => {
      expect(result.current.undo()).toBe(true);
    });
    expect(result.current.moveHistory).toHaveLength(0);
    expect(result.current.lastMove).toBeNull();
    expect(result.current.canRedo()).toBe(true);

    act(() => {
      expect(result.current.redo()).toBe(true);
    });
    expect(result.current.moveHistory).toHaveLength(1);
    expect(result.current.lastMove).toEqual([3, 2]);
  });

  test('reset clears history and gameOver', () => {
    const { result } = renderHook(() => useGameEngine());

    act(() => {
      result.current.makeMove([3, 2]);
      result.current.setGameOver(true);
      result.current.reset();
    });

    expect(result.current.gameOver).toBe(false);
    expect(result.current.moveHistory).toHaveLength(0);
    expect(result.current.lastMove).toBeNull();
    expect(result.current.evaluationHistory).toEqual([{ move: 0, evaluation: 0 }]);
  });

  test('onGameOver receives endedByTimeout from engine events', () => {
    vi.useFakeTimers();
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useGameEngine({ onGameOver }));

    act(() => {
      result.current.engine.configureTimeControl({ initialTime: 50, increment: 0 });
    });

    act(() => {
      vi.advanceTimersByTime(80);
      result.current.engine.checkTimeout();
    });

    expect(onGameOver).toHaveBeenCalledWith('W', true);
    expect(result.current.gameOver).toBe(true);
    vi.useRealTimers();
  });
});
