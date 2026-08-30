/**
 * AIGameplayController — live-options / cancel behavior
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { OthelloGameEngine } from 'othello-engine';
import { AIGameplayController } from './aiGameplay';

describe('AIGameplayController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('does not play a spectator move after gameOver flips on latest options', () => {
    const engine = new OthelloGameEngine();
    const makeMoveSpy = vi.spyOn(engine, 'makeMove');
    const controller = new AIGameplayController();
    controller.setSpectatorBots(true, 'easy');

    controller.checkAndMakeAIMove({
      engine,
      gameOver: false,
      aiEnabled: false,
      aiPlayer: 'W',
      aiDifficulty: 'easy',
      spectatorMode: true,
    });

    // Simulate React committing game-over before the spectator delay fires
    controller.checkAndMakeAIMove({
      engine,
      gameOver: true,
      aiEnabled: false,
      aiPlayer: 'W',
      aiDifficulty: 'easy',
      spectatorMode: true,
    });

    vi.advanceTimersByTime(2000);
    expect(makeMoveSpy).not.toHaveBeenCalled();
    controller.dispose();
  });

  test('cancel clears a pending spectator timeout', () => {
    const engine = new OthelloGameEngine();
    const makeMoveSpy = vi.spyOn(engine, 'makeMove');
    const controller = new AIGameplayController();
    controller.setSpectatorBots(true, 'easy');

    controller.checkAndMakeAIMove({
      engine,
      gameOver: false,
      aiEnabled: false,
      aiPlayer: 'W',
      aiDifficulty: 'easy',
      spectatorMode: true,
    });

    controller.cancel();
    vi.advanceTimersByTime(2000);
    expect(makeMoveSpy).not.toHaveBeenCalled();
    controller.dispose();
  });

  test('overlapping spectator kicks only apply one move', () => {
    const engine = new OthelloGameEngine();
    const makeMoveSpy = vi.spyOn(engine, 'makeMove');
    const controller = new AIGameplayController();
    controller.setSpectatorBots(true, 'easy');

    const opts = {
      engine,
      gameOver: false,
      aiEnabled: false,
      aiPlayer: 'W' as const,
      aiDifficulty: 'easy' as const,
      spectatorMode: true,
    };

    controller.checkAndMakeAIMove(opts);
    controller.checkAndMakeAIMove(opts);
    controller.checkAndMakeAIMove(opts);

    vi.advanceTimersByTime(2000);
    expect(makeMoveSpy).toHaveBeenCalledTimes(1);
    controller.dispose();
  });

  test('skips AI kick when aiEnabled is false on latest options', () => {
    const engine = new OthelloGameEngine();
    const makeMoveSpy = vi.spyOn(engine, 'makeMove');
    const onThinkingChange = vi.fn();
    const controller = new AIGameplayController();

    controller.checkAndMakeAIMove({
      engine,
      gameOver: false,
      aiEnabled: true,
      aiPlayer: 'B',
      aiDifficulty: 'easy',
      spectatorMode: false,
      onThinkingChange,
    });

    expect(onThinkingChange).toHaveBeenCalledWith(expect.objectContaining({ isThinking: true }));

    // Disable AI before the think delay completes — replaces pending timer
    controller.checkAndMakeAIMove({
      engine,
      gameOver: false,
      aiEnabled: false,
      aiPlayer: 'B',
      aiDifficulty: 'easy',
      spectatorMode: false,
      onThinkingChange,
    });

    vi.advanceTimersByTime(500);
    expect(makeMoveSpy).not.toHaveBeenCalled();
    controller.dispose();
  });
});
