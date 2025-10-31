import React from 'react';
import '../../styles/ui.css';

interface PlayerInfoProps {
  player: 'Black' | 'White';
  isGameOver: boolean;
}

/**
 * PlayerInfo Component
 * 
 * Displays the current player's turn with styled text
 * Shows "Game Over" message when game ends
 * 
 * @param player - Current player ('Black' or 'White')
 * @param isGameOver - Whether the game has ended
 */
export const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isGameOver }) => {
  return (
    <div className="playerInfo shadow border">
      <span className={player.toLowerCase()}>
        {isGameOver ? 'Game Over' : `${player}, your turn!`}
      </span>
    </div>
  );
};
