import { useEffect, useRef } from 'react';
import { resolveGameShortcut } from '../utils/gameChromeHelpers';

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
      const action = resolveGameShortcut(event);
      if (!action) return;

      const h = handlersRef.current;
      if (action === 'escape') {
        h.onEscape();
        return;
      }

      event.preventDefault();
      if (action === 'newGame') h.onNewGame();
      else if (action === 'openSettings') h.onOpenSettings();
      else if (action === 'undo') h.onUndo();
      else if (action === 'redo') h.onRedo();
      else if (action === 'help') h.onShowHelp();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
