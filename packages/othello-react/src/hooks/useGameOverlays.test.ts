import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameOverlays } from './useGameOverlays';

describe('useGameOverlays', () => {
  test('closeTopOverlay closes the highest priority open overlay', () => {
    const { result } = renderHook(() => useGameOverlays());

    act(() => {
      result.current.setSettingsOpen(true);
      result.current.setStatsOpen(true);
    });

    act(() => {
      result.current.closeTopOverlay();
    });
    expect(result.current.settingsOpen).toBe(false);
    expect(result.current.statsOpen).toBe(true);

    act(() => {
      result.current.closeTopOverlay();
    });
    expect(result.current.statsOpen).toBe(false);
  });

  test('openResult records winner and timeout flag', () => {
    const { result } = renderHook(() => useGameOverlays());

    act(() => {
      result.current.openResult('W', true);
    });

    expect(result.current.resultModalOpen).toBe(true);
    expect(result.current.gameWinner).toBe('W');
    expect(result.current.endedByTimeout).toBe(true);
  });

  test('toggleReplay and closeReplay clear board/moves', () => {
    const { result } = renderHook(() => useGameOverlays());

    act(() => {
      result.current.startHistoryReplay([{ player: 'B', coordinate: [3, 2] }]);
    });

    expect(result.current.replayOpen).toBe(true);
    expect(result.current.historyReplayMoves).toHaveLength(1);
    expect(result.current.statsOpen).toBe(false);

    act(() => {
      result.current.closeReplay();
    });

    expect(result.current.replayOpen).toBe(false);
    expect(result.current.replayBoard).toBeNull();
    expect(result.current.historyReplayMoves).toBeNull();
  });

  test('resetOverlaysForNewGame clears result chrome', () => {
    const { result } = renderHook(() => useGameOverlays());

    act(() => {
      result.current.openResult('B', false);
      result.current.startHistoryReplay([{ player: 'B', coordinate: [3, 2] }]);
      result.current.resetOverlaysForNewGame();
    });

    expect(result.current.resultModalOpen).toBe(false);
    expect(result.current.gameWinner).toBeNull();
    expect(result.current.endedByTimeout).toBe(false);
    expect(result.current.replayOpen).toBe(false);
  });
});
