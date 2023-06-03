import React from 'react';
import './Board.css';
import Row from './Row';
import {B, score, playerTurn} from './game-logic';

const Board = ({board, onPlayerTurn}) => {
  const playerScore = score(board);
  const player = (board.playerTurn === B) ? 'Black' : 'White';
  const rows = [];
  for (const row of board.tiles) {
    rows.push(<Row key={rows.length} y={rows.length} tiles={row} onPlayerTurn={onPlayerTurn}/>);
  }

  return (
    <div className="Board">
      <div className="gameInfo">
        <span className="playerInfo">
          <span className="label">Player:</span>
          <span className={player.toLowerCase()}>{player}</span>
        </span>
        <span className="spacer"/>
        <span className="scoreInfo">
          <span className="label">Score:</span>
          <span className="black">{playerScore.black}</span>
          <span className="scoreDelimitter">-</span>
          <span className="white">{playerScore.white}</span>
        </span>
      </div>
      <div className="board">
        {rows}
      </div>
    </div>
  );
};

export default Board;