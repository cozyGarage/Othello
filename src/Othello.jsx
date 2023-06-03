import React from 'react';
import './Othello.css';

function OthelloBoard() {
  const boardSize = 8; // Size of the Othello board
  const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        row.map((square, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            id={`${rowIndex}-${colIndex}`}
            className="square shadow"
          ></div>
        ))
      ))}
    </div>
  );
}

export default OthelloBoard;