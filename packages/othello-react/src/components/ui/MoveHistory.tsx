import React from 'react';
import type { Move } from 'othello-engine';

interface MoveHistoryProps {
  moves: Move[];
  isVisible: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, isVisible }) => {
  if (!isVisible || moves.length === 0) {
    return null;
  }

  const formatCoordinate = (coord: [number, number]) => {
    const [x, y] = coord;
    const column = String.fromCharCode(65 + x); // A-H
    const row = y + 1; // 1-8
    return `${column}${row}`;
  };

  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="move-history-list">
        {moves.map((move, index) => (
          <div key={index} className="move-history-item">
            <span className="move-number">{index + 1}.</span>
            <span className={`move-player ${move.player === 'B' ? 'black' : 'white'}`}>
              {move.player === 'B' ? '⚫' : '⚪'}
            </span>
            <span className="move-coordinate">{formatCoordinate(move.coordinate)}</span>
            <span className="move-score">
              ⚫{move.scoreAfter.black} - ⚪{move.scoreAfter.white}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
