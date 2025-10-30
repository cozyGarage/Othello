import React from 'react';
import './Board.css';
import Row from './Row';
import {B, score} from './game-logic';

// Memoized Board component to prevent unnecessary re-renders
const Board = React.memo(({board, onPlayerTurn, onRestart, onUndo, onShowHint, message, gameOver, moveCount, gameDuration, canUndo, hintMove}) => {
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
      <div className="statsInfo">
        <span className="stat">Moves: {moveCount}</span>
        <span className="stat">Time: {gameDuration}</span>
      </div>
      {message && (
        <div className="message">
          {message}
        </div>
      )}
      <div className="board shadow border">
        {rows}
        {hintMove && (
          <div className="hint-overlay" style={{
            position: 'absolute',
            left: `${hintMove[0] * 12.5}%`,
            top: `${hintMove[1] * 12.5}%`,
            width: '12.5%',
            height: '12.5%',
            border: '3px solid gold',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'pulse 1s infinite'
          }}/>
        )}
      </div>
      <div className="controls">
        <button className="restart-button" onClick={onRestart}>
          New Game
        </button>
        <button 
          className="undo-button" 
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button 
          className="hint-button" 
          onClick={onShowHint}
          disabled={gameOver}
        >
          Hint
        </button>
      </div>
    </div>
  );
});

export default Board;