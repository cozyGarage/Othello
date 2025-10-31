import React, { useState, useRef, useEffect } from 'react';
import '../../styles/game.css';

interface GameMenuProps {
  onNewGame: () => void;
  onOpenSettings: () => void;
  soundVolume: number;
  onVolumeChange: (volume: number) => void;
  soundEnabled: boolean;
}

/**
 * GameMenu Component
 * 
 * A dropdown menu in the top-left corner containing:
 * - New Game
 * - Settings
 * - Sound Volume Control
 */
export const GameMenu: React.FC<GameMenuProps> = ({ 
  onNewGame, 
  onOpenSettings, 
  soundVolume,
  onVolumeChange,
  soundEnabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNewGame = () => {
    onNewGame();
    setIsOpen(false);
  };

  const handleOpenSettings = () => {
    onOpenSettings();
    setIsOpen(false);
  };

  return (
    <div className="game-menu" ref={menuRef}>
      <button
        className="menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Game menu"
        aria-expanded={isOpen}
      >
        ☰
      </button>
      
      {isOpen && (
        <div className="menu-dropdown">
          <button 
            className="menu-item" 
            onClick={handleNewGame}
          >
            <span className="menu-icon">🔄</span>
            <span>New Game</span>
          </button>
          
          <button 
            className="menu-item" 
            onClick={handleOpenSettings}
          >
            <span className="menu-icon">⚙️</span>
            <span>Settings</span>
          </button>
          
          <div className="menu-item volume-control">
            <span className="menu-icon">🔊</span>
            <div className="volume-slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="volume-slider"
                disabled={!soundEnabled}
                aria-label="Sound volume"
              />
              <span className="volume-label">{soundVolume}%</span>
            </div>
          </div>
          
          {!soundEnabled && (
            <div className="menu-hint">
              Enable sound in Settings
            </div>
          )}
        </div>
      )}
    </div>
  );
};
