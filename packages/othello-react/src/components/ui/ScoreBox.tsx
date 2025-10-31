import React from 'react';
import '../../styles/ui.css';
import '../../styles/animations.css';
import { useScoreAnimation } from '../../hooks/useScoreAnimation';
import { hasScoreAnimations } from '../../config/features';

interface ScoreBoxProps {
  blackScore: number;
  whiteScore: number;
}

/**
 * ScoreBox Component
 * 
 * Displays the current score for both players with optional animations
 * Styled with wooden theme and piece colors
 * Shows floating +X indicators when scores increase
 * 
 * @param blackScore - Black player's current score
 * @param whiteScore - White player's current score
 */
export const ScoreBox: React.FC<ScoreBoxProps> = ({ blackScore, whiteScore }) => {
  const blackAnim = useScoreAnimation(blackScore);
  const whiteAnim = useScoreAnimation(whiteScore);
  const animationsEnabled = hasScoreAnimations();

  return (
    <div className="scoreInfo shadow border">
      <div className="score-container">
        <span className={`black ${animationsEnabled ? blackAnim.scoreClass : ''}`}>
          {blackScore}
        </span>
        {animationsEnabled && blackAnim.scoreChanges.map(change => (
          <span key={change.id} className="score-float black-float">
            +{change.amount}
          </span>
        ))}
      </div>
      <span className="scoreDelimitter">-</span>
      <div className="score-container">
        <span className={`white ${animationsEnabled ? whiteAnim.scoreClass : ''}`}>
          {whiteScore}
        </span>
        {animationsEnabled && whiteAnim.scoreChanges.map(change => (
          <span key={change.id} className="score-float white-float">
            +{change.amount}
          </span>
        ))}
      </div>
    </div>
  );
};
