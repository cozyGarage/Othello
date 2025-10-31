import React from 'react';
import './styles/game.css';
import Tile from './Tile';
import { PlayerInfo, ScoreBox, GameMessage } from './components/ui';
import { B, P, score, type Board as BoardType, type Coordinate } from 'othello-engine';

interface BoardProps {
  board: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  onRestart: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  message: string | null;
  gameOver: boolean;
  lastMove: Coordinate | null;
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  onPlayerTurn, 
  onRestart, 
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  message, 
  gameOver, 
  lastMove 
}) => {
  const playerScore = score(board);
  const player = (board.playerTurn === B) ? 'Black' : 'White';
  
  // Generate tiles directly without Row wrapper
  const tiles: React.ReactElement[] = [];
  board.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      const isLastMove = lastMove !== null && lastMove[0] === x && lastMove[1] === y;
      const isValidMove = tile === P;
      
      tiles.push(
        <Tile 
          key={`${x}-${y}`}
          x={x} 
          y={y}
          tile={tile} 
          onPlayerTurn={onPlayerTurn}
          isLastMove={isLastMove}
          isValidMove={isValidMove}
        />
      );
    });
  });

  return (
    <div className="Board shadow border">
      <div className="gameInfo">
        <PlayerInfo player={player} isGameOver={gameOver} />
        <ScoreBox blackScore={playerScore.black} whiteScore={playerScore.white} />
      </div>
      <GameMessage message={message} />
      <div className="board shadow border">
        {tiles}
      </div>
      <div className="controls">
        <div className="control-group">
          <button 
            className="control-button undo-button" 
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last move"
          >
            ↶ Undo
          </button>
          <button 
            className="control-button redo-button" 
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo move"
          >
            ↷ Redo
          </button>
        </div>
        <button className="restart-button" onClick={onRestart}>
          🔄 New Game
        </button>
      </div>
    </div>
  );
};

export default Board;
