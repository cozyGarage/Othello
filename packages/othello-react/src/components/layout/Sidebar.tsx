import React, { useRef, useEffect, useState } from 'react';
import { type Move } from 'othello-engine';
import { PlayerInfoCard } from '../ui/PlayerInfoCard';
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
  // Store previous scores to calculate deltas
  // useRef persists across renders without triggering re-render
  const prevBlackScore = useRef(blackScore);
  const prevWhiteScore = useRef(whiteScore);
  
  // Track score changes for animated +/- indicators
  // null = no animation, number = show delta floating up
  const [blackDelta, setBlackDelta] = useState<number | null>(null);
  const [whiteDelta, setWhiteDelta] = useState<number | null>(null);

  /**
   * Score Change Animation Effect
   * 
   * Detects score changes and displays floating +/- numbers
   * Example: Score 10 → 15 shows "+5" floating up in green
   * 
   * Animation lifecycle:
   * 1. Detect change (compare current vs previous)
   * 2. Set delta state (triggers render with animated number)
   * 3. After 1000ms, clear delta (hides animated number)
   */
  useEffect(() => {
    const blackChange = blackScore - prevBlackScore.current;
    const whiteChange = whiteScore - prevWhiteScore.current;

    // Animate black score change
    if (blackChange !== 0) {
      setBlackDelta(blackChange);
      setTimeout(() => setBlackDelta(null), 1000);
    }

    // Animate white score change
    if (whiteChange !== 0) {
      setWhiteDelta(whiteChange);
      setTimeout(() => setWhiteDelta(null), 1000);
    }

    // Update refs for next comparison
    prevBlackScore.current = blackScore;
    prevWhiteScore.current = whiteScore;
  }, [blackScore, whiteScore]);
  /**
   * Convert Coordinate to Chess Notation
   * 
   * Converts engine coordinates [x, y] to readable chess notation
   * Example: [3, 4] → "d5"
   * 
   * Chess notation:
   * - Files (columns): a-h (left to right)
   * - Ranks (rows): 1-8 (bottom to top)
   * 
   * @param coord - Engine coordinate [x, y] where x=column, y=row
   * @returns Chess notation string like "e4"
   */
  const coordinateToNotation = (coord: [number, number]): string => {
    const [row, col] = coord;
    const file = String.fromCharCode(97 + col); // 97 = 'a', so col 0='a', 1='b', etc
    const rank = (8 - row).toString(); // Flip row: row 0=rank 8, row 7=rank 1
    return `${file}${rank}`;
  };

  return (
    <div className="sidebar">
      {/* Turn Indicator with Undo/Redo */}
      <div className="sidebar-card">
        <div className="turn-controls">
          <div className="turn-player">
            <div className={`turn-piece ${currentPlayer}`} />
            <span>{currentPlayer === 'black' ? 'Black' : 'White'}</span>
          </div>
          <button 
            className="control-btn-compact" 
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button 
            className="control-btn-compact" 
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Score</h3>
        <div className="score-display">
          <div className="score-item">
            <div className="turn-piece black" />
            <div className="score-value-container">
              <div className="score-value">{blackScore}</div>
              {blackDelta !== null && (
                <div className={`score-delta ${blackDelta > 0 ? 'positive' : 'negative'}`}>
                  {blackDelta > 0 ? '+' : ''}{blackDelta}
                </div>
              )}
            </div>
            <PlayerInfoCard playerName="Black" playerColor="black">
              <div className="score-label">Black</div>
            </PlayerInfoCard>
          </div>
          <div className="score-separator">-</div>
          <div className="score-item">
            <div className="turn-piece white" />
            <div className="score-value-container">
              <div className="score-value">{whiteScore}</div>
              {whiteDelta !== null && (
                <div className={`score-delta ${whiteDelta > 0 ? 'positive' : 'negative'}`}>
                  {whiteDelta > 0 ? '+' : ''}{whiteDelta}
                </div>
              )}
            </div>
            <PlayerInfoCard playerName="White" playerColor="white">
              <div className="score-label">White</div>
            </PlayerInfoCard>
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
        <div className="controls-grid">
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
