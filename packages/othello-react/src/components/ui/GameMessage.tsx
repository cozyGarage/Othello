import React from 'react';
import '../../styles/ui.css';
import '../../styles/animations.css';

interface GameMessageProps {
  message: string | null;
}

/**
 * GameMessage Component
 *
 * Displays game status messages (invalid moves, game over, etc.)
 * Appears with fadeIn animation when message is present
 *
 * @param message - Message to display (null hides the component)
 */
export const GameMessage: React.FC<GameMessageProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return <div className="message">{message}</div>;
};
