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
    <div className="Board shadow border">
      <div className="gameInfo">
        <span className="playerInfo shadow border">
          <span className="label"></span>
          <span className={player.toLowerCase()}>{player}, You are up</span>
        </span>
        <span className="spacer"/>
        <span className="scoreInfo shawdow border">
          <span className="label"></span>
          <span className="black">{playerScore.black}</span>
          <span className="scoreDelimitter">-</span>
          <span className="white">{playerScore.white}</span>
        </span>
      </div>
      <div className="board shadow border">
        {rows}
      </div>
    </div>
  );
};

export default Board;