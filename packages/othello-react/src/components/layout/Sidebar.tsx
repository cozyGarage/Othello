import React from 'react';
import { type Move } from 'othello-engine';
import '../../styles/sidebar.css';

interface SidebarProps {
  currentPlayer: 'black' | 'white';
  blackScore: number;
  whiteScore: number;
  onUndo: () => void;
  onRedo: () => void;
  onNewGame: () => void;
  onOpenMenu: () => void;
  canUndo: boolean;
  canRedo: boolean;
  moves: Move[];
  message?: string | null;
  gameOver: boolean;
}

/**
 * Sidebar Component
 * Contains turn indicator, score, controls, and move history
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentPlayer,
  blackScore,
  whiteScore,
  onUndo,
  onRedo,
  onNewGame,
  onOpenMenu,
  canUndo,
  canRedo,
  moves,
  message,
  gameOver
}) => {
  // Convert coordinate to chess notation (e.g., [3,4] -> "d5")
  const coordinateToNotation = (coord: [number, number]): string => {
    const [row, col] = coord;
    const file = String.fromCharCode(97 + col); // a-h
    const rank = (8 - row).toString(); // 1-8
    return `${file}${rank}`;
  };

  return (
    <div className="sidebar">
      {/* Turn Indicator */}
      <div className="sidebar-card">
        <div className="turn-indicator">
          <div className="turn-player">
            <div className={`turn-piece ${currentPlayer}`} />
            <span>{currentPlayer === 'black' ? 'Black' : 'White'} to move</span>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Score</h3>
        <div className="score-display">
          <div className="score-item">
            <div className="turn-piece black" />
            <div className="score-value">{blackScore}</div>
            <div className="score-label">Black</div>
          </div>
          <div className="score-separator">-</div>
          <div className="score-item">
            <div className="turn-piece white" />
            <div className="score-value">{whiteScore}</div>
            <div className="score-label">White</div>
          </div>
        </div>
      </div>

      {/* Game Message */}
      {message && (
        <div className={`game-message ${gameOver ? 'success' : ''}`}>
          {message}
        </div>
      )}

      {/* Control Buttons */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Controls</h3>
        <div className="controls-grid">
          <button 
            className="control-btn" 
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <span>↶</span> Undo
          </button>
          <button 
            className="control-btn" 
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <span>↷</span> Redo
          </button>
          <button 
            className="control-btn primary full-width" 
            onClick={onNewGame}
          >
            <span>🔄</span> New Game
          </button>
          <button 
            className="control-btn full-width" 
            onClick={onOpenMenu}
          >
            <span>⚙️</span> Settings
          </button>
        </div>
      </div>

      {/* Move History */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Move History</h3>
        <div className="move-history">
          {moves.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-md)' }}>
              No moves yet
            </p>
          ) : (
            <ul className="move-list">
              {moves.map((move, index) => (
                <li key={index} className="move-item">
                  <span className="move-number">{index + 1}.</span>
                  <div className={`move-player ${move.player === 'B' ? 'black' : 'white'}`} />
                  <span className="move-notation">
                    {coordinateToNotation(move.coordinate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
