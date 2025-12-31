import React from 'react';
import '../../styles/ui.css';

interface GameResultModalProps {
  isOpen: boolean;
  winner: 'B' | 'W' | null;
  blackScore: number;
  whiteScore: number;
  endedByTimeout?: boolean;
  onPlayAgain: () => void;
  onReplay: () => void;
  onClose: () => void;
}

/**
 * Get display label for game winner
 */
const winnerLabel = (winner: 'B' | 'W' | null): string => {
  if (winner === 'B') return '⚫ Black Wins!';
  if (winner === 'W') return '⚪ White Wins!';
  return "🤝 It's a Draw!";
};

/**
 * GameResultModal - Modal popup showing game result with Play Again / Replay options
 */
export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  winner,
  blackScore,
  whiteScore,
  endedByTimeout = false,
  onPlayAgain,
  onReplay,
  onClose,
}) => {
  if (!isOpen) return null;

  const subtitle = endedByTimeout
    ? '⏰ Time expired'
    : winner === null
      ? 'Balanced battle'
      : 'Final score';

  return (
    <div className="result-modal-overlay" onClick={onClose}>
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        <div className="result-header">
          <span className="result-pill">Game Finished</span>
          <button className="result-close" onClick={onClose} aria-label="Close result dialog">
            ×
          </button>
        </div>

        <div className="result-body">
          <h2 className="result-title">{winnerLabel(winner)}</h2>
          <p className="result-subtitle">{subtitle}</p>

          <div className="result-score">
            <div className={`result-score-card ${winner === 'B' ? 'winner' : ''}`}>
              <div className="turn-piece black" />
              <span className="result-score-value">{blackScore}</span>
            </div>
            <div className="result-score-separator">—</div>
            <div className={`result-score-card ${winner === 'W' ? 'winner' : ''}`}>
              <div className="turn-piece white" />
              <span className="result-score-value">{whiteScore}</span>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button className="result-btn primary" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="result-btn secondary" onClick={onReplay}>
            📽️ Replay
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
