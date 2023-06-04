import React from 'react';
import {B, W, P} from './game-logic';
import './Tile.css';


const Tile = ({tile, x, y, onPlayerTurn}) => {
  const handleClick = (tile === P)
    ? () => onPlayerTurn([x, y])
    : x => x;

  return (
    <span className={'Tile ' + tile} onClick={handleClick}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="92"/>
      </svg>
    </span>
  );
}

export default Tile;