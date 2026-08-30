import { describe, test, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameShortcuts } from './useGameShortcuts';

function dispatchKey(key: string, target: Document | HTMLElement = document.body) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'target', { value: target });
  document.dispatchEvent(event);
  return event;
}

describe('useGameShortcuts', () => {
  afterEach(() => {
    // hooks clean up their own listeners on unmount
  });

  test('routes N/S/Z/Y/?/Escape to handlers', () => {
    const handlers = {
      onNewGame: vi.fn(),
      onOpenSettings: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onShowHelp: vi.fn(),
      onEscape: vi.fn(),
    };

    const { unmount } = renderHook(() => useGameShortcuts(handlers));

    dispatchKey('n');
    dispatchKey('s');
    dispatchKey('z');
    dispatchKey('y');
    dispatchKey('?');
    dispatchKey('Escape');

    expect(handlers.onNewGame).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenSettings).toHaveBeenCalledTimes(1);
    expect(handlers.onUndo).toHaveBeenCalledTimes(1);
    expect(handlers.onRedo).toHaveBeenCalledTimes(1);
    expect(handlers.onShowHelp).toHaveBeenCalledTimes(1);
    expect(handlers.onEscape).toHaveBeenCalledTimes(1);

    unmount();
  });

  test('ignores shortcuts from form fields', () => {
    const handlers = {
      onNewGame: vi.fn(),
      onOpenSettings: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onShowHelp: vi.fn(),
      onEscape: vi.fn(),
    };

    renderHook(() => useGameShortcuts(handlers));

    const input = document.createElement('input');
    document.body.appendChild(input);
    dispatchKey('n', input);

    expect(handlers.onNewGame).not.toHaveBeenCalled();
    input.remove();
  });

  test('uses latest handlers without re-binding listener identity churn', () => {
    const first = {
      onNewGame: vi.fn(),
      onOpenSettings: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onShowHelp: vi.fn(),
      onEscape: vi.fn(),
    };
    const second = {
      onNewGame: vi.fn(),
      onOpenSettings: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onShowHelp: vi.fn(),
      onEscape: vi.fn(),
    };

    const { rerender } = renderHook(({ handlers }) => useGameShortcuts(handlers), {
      initialProps: { handlers: first },
    });

    rerender({ handlers: second });
    dispatchKey('n');

    expect(first.onNewGame).not.toHaveBeenCalled();
    expect(second.onNewGame).toHaveBeenCalledTimes(1);
  });
});
