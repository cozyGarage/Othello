import React from 'react';
import '../../styles/game.css';

interface ScoreBoxProps {
  blackScore: number;
  whiteScore: number;
}

/**
 * ScoreBox Component
 * 
 * Displays the current score for both players
 * Styled with wooden theme and piece colors
 * 
 * @param blackScore - Black player's current score
 * @param whiteScore - White player's current score
 */
export const ScoreBox: React.FC<ScoreBoxProps> = ({ blackScore, whiteScore }) => {
  return (
    <div className="scoreInfo shadow border">
      <span className="black">{blackScore}</span>
      <span className="scoreDelimitter">-</span>
      <span className="white">{whiteScore}</span>
    </div>
  );
};
