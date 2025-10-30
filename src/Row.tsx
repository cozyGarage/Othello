import React from 'react';
import './Row.css';
import Tile from './Tile';
import type { TileValue, Coordinate } from './game-logic';

interface RowProps {
  tiles: TileValue[];
  y: number;
  onPlayerTurn: (coord: Coordinate) => void;
}

const Row: React.FC<RowProps> = ({ tiles, y, onPlayerTurn }) => {
  const tileComponents: React.ReactElement[] = [];
  for (const tile of tiles) {
    tileComponents.push(
      <Tile 
        key={tileComponents.length} 
        x={tileComponents.length} 
        y={y}
        tile={tile} 
        onPlayerTurn={onPlayerTurn}
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
