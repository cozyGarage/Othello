import React from 'react';
import './Board.css';
import Row from './Row';
import { B, score, type Board as BoardType, type Coordinate } from './game-logic';

interface BoardProps {
  board: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  onRestart: () => void;
  message: string | null;
  gameOver: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onPlayerTurn, onRestart, message, gameOver }) => {
  const playerScore = score(board);
  const player = (board.playerTurn === B) ? 'Black' : 'White';
  const rows: React.ReactElement[] = [];
  
  for (const row of board.tiles) {
    rows.push(
      <Row 
        key={rows.length} 
        y={rows.length} 
        tiles={row} 
        onPlayerTurn={onPlayerTurn}
      />
    );
  }

  return (
    <div className="Board shadow border">
      <div className="gameInfo">
        <span className="playerInfo shadow border">
          <span className="label"></span>
          <span className={player.toLowerCase()}>
            {gameOver ? 'Game Over' : `${player}, You are up`}
          </span>
        </span>
        <span className="spacer"/>
        <span className="scoreInfo shawdow border">
          <span className="label"></span>
          <span className="black">{playerScore.black}</span>
          <span className="scoreDelimitter">-</span>
          <span className="white">{playerScore.white}</span>
        </span>
      </div>
      {message && (
        <div className="message">
          {message}
        </div>
      )}
      <div className="board shadow border">
        {rows}
      </div>
      <div className="controls">
        <button className="restart-button" onClick={onRestart}>
          New Game
        </button>
      </div>
    </div>
  );
};

export default Board;
