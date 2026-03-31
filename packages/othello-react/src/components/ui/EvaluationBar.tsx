import React from 'react';
import '../../styles/evaluationBar.css';

interface EvaluationBarProps {
  /** Current board evaluation (-64 to +64, positive = Black advantage) */
  evaluation: number;
  /** Current player (for display) */
  currentPlayer: 'black' | 'white';
}

/**
 * EvaluationBar - Chess.com style vertical evaluation bar
 *
 * Shows the current position evaluation with a vertical bar where:
 * - Top = Black advantage
 * - Bottom = White advantage
 * - Middle = Equal position
 *
 * Each piece = 1 advantage unit
 */
export const EvaluationBar: React.FC<EvaluationBarProps> = ({ evaluation, currentPlayer }) => {
  // Clamp evaluation to [-64, 64] range
  const clampedEval = Math.max(-64, Math.min(64, evaluation));

  // Convert evaluation to percentage (0-100 where 50 is equal)
  // -64 (white crushing) = 0%, 0 (equal) = 50%, +64 (black crushing) = 100%
  const blackAdvantagePercent = ((clampedEval + 64) / 128) * 100;

  // Determine color intensity based on advantage
  const getBarColor = (): string => {
    const absEval = Math.abs(clampedEval);
    if (absEval < 5) return 'equal';
    if (absEval < 15) return 'slight';
    if (absEval < 30) return 'better';
    return 'winning';
  };

  const colorClass = getBarColor();
  const isBlackAdvantage = clampedEval > 0;

  return (
    <div className="evaluation-bar-container" title={`Eval: ${clampedEval.toFixed(1)}`}>
      <div className="evaluation-bar-label">
        <span className="eval-number">{Math.abs(clampedEval).toFixed(1)}</span>
      </div>
      <div className={`evaluation-bar ${colorClass}`}>
        {/* Black section (top) */}
        <div
          className="eval-section black"
          style={{ height: `${blackAdvantagePercent}%` }}
          aria-label={isBlackAdvantage ? `Black advantage: ${clampedEval}` : 'Equal'}
        />
        {/* White section (bottom) */}
        <div
          className="eval-section white"
          style={{ height: `${100 - blackAdvantagePercent}%` }}
          aria-label={!isBlackAdvantage ? `White advantage: ${-clampedEval}` : 'Equal'}
        />
      </div>
      <div className="evaluation-bar-labels">
        <span className={`player-label ${currentPlayer === 'black' ? 'active' : ''}`}>B</span>
        <span className={`player-label ${currentPlayer === 'white' ? 'active' : ''}`}>W</span>
      </div>
    </div>
  );
};
