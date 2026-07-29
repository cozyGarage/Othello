import { useEffect, useRef } from 'react';

export interface GameShortcutHandlers {
  onNewGame: () => void;
  onOpenSettings: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onShowHelp: () => void;
  onEscape: () => void;
}

/**
 * Global keyboard shortcuts for the game shell (N/S/Z/Y/?/Esc).
 * Ignores events originating from form fields.
 */
export function useGameShortcuts(handlers: GameShortcutHandlers): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      const h = handlersRef.current;

      if (event.key === 'Escape') {
        h.onEscape();
        return;
      }

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        h.onNewGame();
        return;
      }

      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        h.onOpenSettings();
        return;
      }

      if ((event.key === 'z' || event.key === 'Z') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        h.onUndo();
        return;
      }

      if ((event.key === 'y' || event.key === 'Y') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        h.onRedo();
        return;
      }

      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        h.onShowHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
