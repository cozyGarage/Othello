import React from 'react';
import './Row.css';
import Tile from './Tile';

const Row = ({tiles, y, onPlayerTurn}) => {
  const tileComponents = [];
  for (const tile of tiles) {
    tileComponents.push(
      <Tile key={tileComponents.length} x={tileComponents.length} y={y}
        tile={tile} onPlayerTurn={onPlayerTurn}/>
    );
  }

  return (
    <div className="Row">
      {tileComponents}
    </div>
  );
};

export default Row;