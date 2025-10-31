import React, { useRef, useEffect, useState } from 'react';
import { type Board as BoardType, type Coordinate, B, W, P } from 'othello-engine';
import '../../styles/board.css';

/**
 * Board Component Props
 * 
 * @property board - 8x8 grid of tile values from othello-engine
 * @property onPlayerTurn - Callback when player clicks a valid tile
 * @property lastMove - Coordinates of the most recent move (for highlighting)
 * @property gameOver - Whether the game has ended (disables clicks)
 */
interface BoardProps {
  board: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  lastMove: Coordinate | null;
  gameOver: boolean;
}

/**
 * Board Component
 * 
 * Renders the 8x8 Othello/Reversi game board
 * Pure presentation component - no game logic
 * 
 * Features:
 * - Checkerboard pattern (dark/light tiles)
 * - Piece flip animation when pieces change color
 * - Valid move indicators (green highlights)
 * - Last move highlighting (blue border)
 * - Responsive sizing (scales with viewport)
 * 
 * Coordinate System:
 * - Engine uses [x, y] where x=column (0-7), y=row (0-7)
 * - Board renders row-first, then column (visual top-to-bottom, left-to-right)
 * - Click handler converts [row, col] → [col, row] for engine
 */
const Board: React.FC<BoardProps> = ({ 
  board, 
  onPlayerTurn, 
  lastMove,
  gameOver
}) => {
  // Store previous board state to detect piece changes
  const prevBoardRef = useRef<BoardType | null>(null);
  
  // Track which pieces are currently animating (flipping)
  // Set stores "row-col" strings for fast lookup
  const [flippingPieces, setFlippingPieces] = useState<Set<string>>(new Set());

  /**
   * Flip Animation Effect
   * 
   * Compares current board with previous board to find pieces that changed color
   * When a piece flips (B→W or W→B), adds it to flippingPieces set
   * Animation CSS class is applied for 600ms, then removed
   * 
   * Runs on every board update (after each move)
   */
  useEffect(() => {
    if (prevBoardRef.current) {
      const newFlipping = new Set<string>();
      
      // Scan entire 8x8 board for changes
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const prevTile = prevBoardRef.current.tiles[row]![col];
          const currTile = board.tiles[row]![col];
          
          // Detect color flip: Black→White or White→Black
          if ((prevTile === B && currTile === W) || (prevTile === W && currTile === B)) {
            newFlipping.add(`${row}-${col}`);
          }
        }
      }
      
      // Apply flip animation to changed pieces
      if (newFlipping.size > 0) {
        setFlippingPieces(newFlipping);
        // Remove animation class after 600ms (matches CSS animation duration)
        setTimeout(() => setFlippingPieces(new Set()), 600);
      }
    }
    
    // Store current board for next comparison
    prevBoardRef.current = board;
  }, [board]);
  /**
   * Handle Tile Click
   * 
   * Converts visual coordinates (row, col) to engine coordinates [x, y]
   * Engine uses Cartesian: x=column (horizontal), y=row (vertical)
   * 
   * @param row - Visual row index (0=top, 7=bottom)
   * @param col - Visual column index (0=left, 7=right)
   */
  const handleTileClick = (row: number, col: number) => {
    // Don't allow moves after game ends
    if (gameOver) return;
    
    // Convert to engine format: [x, y] = [col, row]
    onPlayerTurn([col, row]);
  };

  /**
   * Check if tile is the last move
   * 
   * Used to highlight the most recent move with blue border
   * 
   * @param row - Visual row index
   * @param col - Visual column index
   * @returns true if this tile was the last move played
   */
  const isLastMove = (row: number, col: number): boolean => {
    // lastMove format: [x, y] = [col, row]
    return lastMove !== null && lastMove[0] === col && lastMove[1] === row;
  };

  /**
   * Render Board Tiles
   * 
   * Generates 64 tiles (8x8 grid) with:
   * - Checkerboard coloring (dark/light pattern)
   * - Pieces (black/white circles)
   * - Valid move indicators (green highlight)
   * - Last move highlight (blue border)
   * - Flip animations
   * 
   * Tile values from engine:
   * - B (0): Black piece
   * - W (1): White piece  
   * - P (3): Valid move (empty tile where current player can place piece)
   * - E (null): Empty tile (no piece, no valid move)
   */
  const tiles = [];
  
  // Iterate through all 64 tiles
  // Outer loop: rows (top to bottom)
  // Inner loop: columns (left to right)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Get tile value from engine board state
      const tile = board.tiles[row]![col]!;
      
      // Calculate tile appearance and state
      const isValid = tile === P;  // Can player place piece here?
      const isLast = isLastMove(row, col);  // Was this the last move?
      const isDark = (row + col) % 2 === 0;  // Checkerboard: even sum = dark
      const isFlipping = flippingPieces.has(`${row}-${col}`);  // Currently animating?
      
      // Build tile element
      tiles.push(
        <div
          key={`${row}-${col}`}
          className={`Tile ${isDark ? 'dark' : 'light'} ${isValid ? 'valid-move' : ''} ${isLast ? 'last-move' : ''}`}
          onClick={() => handleTileClick(row, col)}
        >
          {/* Render piece if tile has one */}
          {tile === B && <div className={`piece black ${isFlipping ? 'flipping' : ''}`} />}
          {tile === W && <div className={`piece white ${isFlipping ? 'flipping' : ''}`} />}
        </div>
      );
    }
  }

  return (
    <div className="Board">
      <div className="board-grid">
        {tiles}
      </div>
    </div>
  );
};

export default Board;
