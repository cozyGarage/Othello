import React from 'react';
import { P, type TileValue, type Coordinate } from './game-logic';
import './Tile.css';

interface TileProps {
  tile: TileValue;
  x: number;
  y: number;
  onPlayerTurn: (coord: Coordinate) => void;
}

const Tile: React.FC<TileProps> = ({ tile, x, y, onPlayerTurn }) => {
  const handleClick = (tile === P)
    ? () => onPlayerTurn([x, y])
    : () => {};

  return (
    <div className={'Tile ' + tile} onClick={handleClick}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="92"/>
      </svg>
    </div>
  );
};

export default Tile;
