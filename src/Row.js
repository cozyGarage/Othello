import React from 'react';
import './Row.css';
import Tile from './Tile';

// Memoized Row component to prevent unnecessary re-renders
const Row = React.memo(({tiles, y, onPlayerTurn}) => {
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
});

export default Row;