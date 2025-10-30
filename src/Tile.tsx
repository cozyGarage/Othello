import React from 'react';
import { P, type TileValue, type Coordinate } from './game-logic';
import './Tile.css';
import './animations.css';

interface TileProps {
  tile: TileValue;
  x: number;
  y: number;
  onPlayerTurn: (coord: Coordinate) => void;
  isLastMove?: boolean;
  isValidMove?: boolean;
}

const Tile: React.FC<TileProps> = ({ 
  tile, 
  x, 
  y, 
  onPlayerTurn, 
  isLastMove = false,
  isValidMove = false 
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const handleClick = (tile === P)
    ? () => {
        setIsAnimating(true);
        onPlayerTurn([x, y]);
        setTimeout(() => setIsAnimating(false), 500);
      }
    : () => {};

  const tileClasses = [
    'Tile',
    tile,
    isLastMove ? 'last-move' : '',
    isValidMove ? 'valid-move' : '',
    isAnimating ? 'tile-flip' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={tileClasses} onClick={handleClick}>
      <div className="tile-inner">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="92"/>
        </svg>
      </div>
    </div>
  );
};

export default Tile;
