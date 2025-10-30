import React from 'react';
import { P, type TileValue, type Coordinate } from './game-logic';
import { useFlipAnimation } from './hooks/useFlipAnimation';
import './styles/game.css';
import './styles/animations.css';

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
  // Use custom hook for flip animation logic
  const { tileClasses, isAnimating } = useFlipAnimation({
    tile,
    x,
    y,
    isLastMove,
    isValidMove
  });

  const handleClick = () => {
    if (tile === P) {
      onPlayerTurn([x, y]);
    }
  };

  return (
    <div 
      className={tileClasses} 
      onClick={handleClick}
      data-x={x}
      data-y={y}
      data-last-move={isLastMove ? 'true' : 'false'}
      data-animating={isAnimating ? 'true' : 'false'}
    >
      <div className="tile-inner">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="92"/>
        </svg>
      </div>
    </div>
  );
};

export default Tile;
