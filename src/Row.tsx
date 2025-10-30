import React from 'react';
import './styles/game.css';
import Tile from './Tile';
import { P, type TileValue, type Coordinate } from './game-logic';

interface RowProps {
  tiles: TileValue[];
  y: number;
  onPlayerTurn: (coord: Coordinate) => void;
  lastMove: Coordinate | null;
}

const Row: React.FC<RowProps> = ({ tiles, y, onPlayerTurn, lastMove }) => {
  const tileComponents: React.ReactElement[] = [];
  for (const tile of tiles) {
    const x = tileComponents.length;
    const isLastMove = lastMove !== null && lastMove[0] === x && lastMove[1] === y;
    const isValidMove = tile === P;
    
    tileComponents.push(
      <Tile 
        key={x} 
        x={x} 
        y={y}
        tile={tile} 
        onPlayerTurn={onPlayerTurn}
        isLastMove={isLastMove}
        isValidMove={isValidMove}
      />
    );
  }

  return (
    <div className="Row">
      {tileComponents}
    </div>
  );
};

export default Row;
