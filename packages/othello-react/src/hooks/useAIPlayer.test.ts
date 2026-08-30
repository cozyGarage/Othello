import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { OthelloGameEngine } from 'othello-engine';
import { useAIPlayer } from './useAIPlayer';
import { IDLE_AI_THINKING } from '../services/aiGameplay';

describe('useAIPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('defaults to AI off as White medium', () => {
    const engine = new OthelloGameEngine();
    const { result, unmount } = renderHook(() => useAIPlayer({ engine, gameOver: false }));

    expect(result.current.aiEnabled).toBe(false);
    expect(result.current.aiPlayer).toBe('W');
    expect(result.current.aiDifficulty).toBe('medium');
    expect(result.current.spectatorMode).toBe(false);
    expect(result.current.thinkingState).toEqual(IDLE_AI_THINKING);

    unmount();
  });

  test('enabling AI sets live flag; spectator kick plays a move', async () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useAIPlayer({ engine, gameOver: false }));

    act(() => {
      result.current.setAIDifficulty('easy');
      result.current.setAIPlayer('B');
      result.current.setAIEnabled(true);
    });
    expect(result.current.aiEnabled).toBe(true);

    // Prefer spectator path under fake timers (sync bot after delay; no worker)
    act(() => {
      result.current.setSpectatorMode(true);
    });
    expect(result.current.aiEnabled).toBe(false);
    expect(result.current.spectatorMode).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(500); // scheduled kick
      vi.advanceTimersByTime(1500); // spectator think delay
    });

    expect(engine.getMoveHistory().length).toBeGreaterThanOrEqual(1);
  });

  test('cancelPendingAIMove prevents a scheduled spectator move', async () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useAIPlayer({ engine, gameOver: false }));

    act(() => {
      result.current.setAIDifficulty('easy');
      result.current.setSpectatorMode(true);
    });

    await act(async () => {
      vi.advanceTimersByTime(500); // kick
    });

    act(() => {
      result.current.cancelPendingAIMove();
    });

    await act(async () => {
      vi.advanceTimersByTime(2000); // spectator delay
    });

    expect(engine.getMoveHistory()).toHaveLength(0);
  });

  test('disabling AI cancels pending work', async () => {
    const engine = new OthelloGameEngine();
    const { result } = renderHook(() => useAIPlayer({ engine, gameOver: false }));

    act(() => {
      result.current.setAIPlayer('B');
      result.current.setAIDifficulty('easy');
      result.current.setAIEnabled(true);
      result.current.setAIEnabled(false);
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.aiEnabled).toBe(false);
    expect(result.current.thinkingState).toEqual(IDLE_AI_THINKING);
    expect(engine.getMoveHistory()).toHaveLength(0);
  });
});
