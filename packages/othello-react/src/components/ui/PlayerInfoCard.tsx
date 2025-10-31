/**
 * PlayerInfoCard Component
 * 
 * Displays player information on hover/click
 * Placeholder for future implementation with real player data
 * 
 * Features:
 * - Photo/avatar
 * - Player name
 * - MMR/rating
 * - Win/loss record
 */

import React, { useState } from 'react';
import '../../styles/ui.css';

interface PlayerInfoCardProps {
  playerName: string;
  playerColor: 'black' | 'white';
  children: React.ReactNode;
}

/**
 * Hover card showing player details
 * Currently shows placeholder data
 * 
 * @param playerName - Display name of player
 * @param playerColor - Color of player's pieces ('black' | 'white')
 * @param children - Trigger element that shows card on hover
 */
export const PlayerInfoCard: React.FC<PlayerInfoCardProps> = ({
  playerName,
  playerColor,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="player-info-trigger"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="player-info-card">
          {/* Player avatar placeholder */}
          <div className={`player-avatar ${playerColor}`}>
            <span className="avatar-initial">{playerName.charAt(0).toUpperCase()}</span>
          </div>
          
          {/* Player details */}
          <div className="player-details">
            <h4 className="player-name">{playerName}</h4>
            <div className="player-stats">
              <div className="stat-item">
                <span className="stat-label">MMR:</span>
                <span className="stat-value">1500</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Wins:</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Losses:</span>
                <span className="stat-value">0</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
