import React from 'react';
import { type Board as BoardType, type Coordinate, B, W, P } from 'othello-engine';
import '../../styles/board.css';

interface BoardProps {
  board: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  lastMove: Coordinate | null;
  gameOver: boolean;
}

/**
 * Clean Board Component
 * Just the 8x8 grid, no embedded controls
 */
const BoardClean: React.FC<BoardProps> = ({ 
  board, 
  onPlayerTurn, 
  lastMove,
  gameOver
}) => {
  const handleTileClick = (row: number, col: number) => {
    if (gameOver) return;
    onPlayerTurn([row, col]);
  };

  const isLastMove = (row: number, col: number): boolean => {
    return lastMove !== null && lastMove[0] === row && lastMove[1] === col;
  };

  const tiles = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const tile = board.tiles[row]![col]!;
      const isValid = tile === P;
      const isLast = isLastMove(row, col);
      
      tiles.push(
        <div
          key={`${row}-${col}`}
          className={`Tile ${isValid ? 'valid-move' : ''} ${isLast ? 'last-move' : ''}`}
          onClick={() => handleTileClick(row, col)}
        >
          {tile === B && <div className="piece black" />}
          {tile === W && <div className="piece white" />}
        </div>
      );
    }
  }

  return (
    <div className="Board">
      <div className="board-grid">
        {tiles}
      </div>
    </div>
  );
};

export default BoardClean;
