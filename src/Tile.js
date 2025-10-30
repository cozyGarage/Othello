import React from 'react';
import {P} from './game-logic';
import './Tile.css';

// Memoized Tile component to prevent unnecessary re-renders
const Tile = React.memo(({tile, x, y, onPlayerTurn}) => {
  const handleClick = (tile === P)
    ? () => onPlayerTurn([x, y])
    : x => x;

  return (
    <div className={'Tile ' + tile} onClick={handleClick}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="92"/>
      </svg>
    </div>
  );
});

export default Tile;