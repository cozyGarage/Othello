import React from 'react';

interface GameActionBarProps {
  onNewGame: () => void;
  onSettings: () => void;
  onStats: () => void;
  onReplay: () => void;
  onPuzzles: () => void;
}

export const GameActionBar: React.FC<GameActionBarProps> = ({
  onNewGame,
  onSettings,
  onStats,
  onReplay,
  onPuzzles,
}) => (
  <div className="action-bar">
    <button className="action-bar-btn primary" onClick={onNewGame}>
      <span className="btn-icon">🔄</span>
      <span className="btn-text">New Game</span>
    </button>
    <button className="action-bar-btn" onClick={onSettings}>
      <span className="btn-icon">⚙️</span>
      <span className="btn-text">Settings</span>
    </button>
    <button className="action-bar-btn" onClick={onStats}>
      <span className="btn-icon">📊</span>
      <span className="btn-text">Stats</span>
    </button>
    <button className="action-bar-btn" onClick={onReplay}>
      <span className="btn-icon">📽️</span>
      <span className="btn-text">Replay</span>
    </button>
    <button className="action-bar-btn" onClick={onPuzzles}>
      <span className="btn-icon">🧩</span>
      <span className="btn-text">Puzzles</span>
    </button>
  </div>
);
