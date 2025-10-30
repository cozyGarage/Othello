import React, { useState } from 'react';
import './styles/game.css';
import Row from './Row';
import { PlayerInfo, ScoreBox, GameMessage, SettingsPanel } from './components/ui';
import { B, score, type Board as BoardType, type Coordinate } from './game-logic';

interface BoardProps {
  board: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  onRestart: () => void;
  message: string | null;
  gameOver: boolean;
  lastMove: Coordinate | null;
}

const Board: React.FC<BoardProps> = ({ board, onPlayerTurn, onRestart, message, gameOver, lastMove }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        lastMove={lastMove}
      />
    );
  }

  return (
    <div className="Board shadow border">
      <button className="settings-icon-button" onClick={() => setSettingsOpen(true)} aria-label="Settings">
        ⚙️
      </button>
      <div className="gameInfo">
        <PlayerInfo player={player} isGameOver={gameOver} />
        <ScoreBox blackScore={playerScore.black} whiteScore={playerScore.white} />
      </div>
      <GameMessage message={message} />
      <div className="board shadow border">
        {rows}
      </div>
      <div className="controls">
        <button className="restart-button" onClick={onRestart}>
          New Game
        </button>
      </div>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Board;
