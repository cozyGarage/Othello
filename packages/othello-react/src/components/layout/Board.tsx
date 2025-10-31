import React, { useRef, useEffect, useState } from 'react';
import { type Board as BoardType, type Coordinate, B, W, P } from 'othello-engine';
import { features } from '../../config/features';
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
const Board: React.FC<BoardProps> = ({ board, onPlayerTurn, lastMove, gameOver }) => {
  /**
   * FLIP ANIMATION STATE MANAGEMENT
   *
   * Key Insight from undo-redo branch:
   * Separate DISPLAY state from GAME state for smooth animations
   *
   * - board: Actual game state (updates instantly)
   * - displayBoard: What user sees (lags behind during animation)
   * - flippingTiles: Tracks which tiles are currently animating
   *
   * Timeline (600ms):
   * 0ms: Show OLD color, start flip
   * 300ms: At 90° rotation (invisible), switch to NEW color
   * 600ms: Animation complete
   */
  const prevBoardRef = useRef<BoardType | null>(null);
  const [displayBoard, setDisplayBoard] = useState<BoardType>(board);
  const [flippingTiles, setFlippingTiles] = useState<Set<string>>(new Set());

  /**
   * Helper: Check if board is in initial game state
   *
   * Initial Othello setup has exactly 4 pieces:
   * - [3,3] = White, [4,4] = White
   * - [3,4] = Black, [4,3] = Black
   */
  const isInitialBoard = (board: BoardType): boolean => {
    let pieceCount = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = board.tiles[row]![col];
        if (tile === B || tile === W) pieceCount++;
      }
    }
    return pieceCount === 4; // Initial state has exactly 4 pieces
  };

  /**
   * Flip Animation Effect
   *
   * This is the BRILLIANT SOLUTION from undo-redo branch:
   * Instead of just adding a CSS class, we:
   * 1. Keep displaying OLD piece color for first 300ms
   * 2. At 300ms (when piece is at 90° and invisible), swap to NEW color
   * 3. User sees smooth B→W or W→B transition, not just a rotating piece
   *
   * Why this works:
   * - CSS makes piece invisible at 50% animation (opacity: 0 at 90° rotation)
   * - We switch colors while invisible
   * - User never sees the instant color swap
   *
   * NEW GAME HANDLING:
   * - When board resets to 4 pieces, we skip flip animations
   * - Instead, we add a brief glare effect to the 4 starting pieces
   */
  useEffect(() => {
    if (prevBoardRef.current) {
      // Check if this is a new game (reset to 4 pieces)
      const isNewGame = isInitialBoard(board) && !isInitialBoard(prevBoardRef.current);

      if (isNewGame) {
        // New game started - no flip animations, just update display
        setDisplayBoard(board);
        setFlippingTiles(new Set());
        prevBoardRef.current = board;
        return;
      }

      const newFlipping = new Set<string>();
      const newDisplayBoard = { ...board, tiles: board.tiles.map((row) => [...row]) };

      // Scan for pieces that flipped (B→W or W→B)
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const prevTile = prevBoardRef.current.tiles[row]![col];
          const currTile = board.tiles[row]![col];

          // Only animate actual flips (not new placements)
          const isFlip = (prevTile === B && currTile === W) || (prevTile === W && currTile === B);

          if (isFlip) {
            newFlipping.add(`${row}-${col}`);
            // Keep displaying OLD color during first half of flip
            newDisplayBoard.tiles[row]![col] = prevTile;
          }
        }
      }

      if (newFlipping.size > 0 && features.animations) {
        // Start animation: show old colors, trigger CSS flip
        setDisplayBoard(newDisplayBoard);
        setFlippingTiles(newFlipping);

        // At 300ms (halfway through animation, when piece is invisible):
        // Switch display to NEW colors
        setTimeout(() => {
          setDisplayBoard(board);
        }, 300);

        // At 600ms: Animation complete, clean up
        setTimeout(() => {
          setFlippingTiles(new Set());
        }, 600);
      } else {
        // No flips OR animations disabled: update display immediately
        setDisplayBoard(board);
      }
    } else {
      // First render: no previous board to compare
      setDisplayBoard(board);
    }

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

  /**
   * RENDERING LOOP
   *
   * Key changes from previous version:
   * - Use displayBoard instead of board for visual appearance
   * - Add tile-inner wrapper (required for CSS 3D transforms)
   * - Use SVG circles (matches undo-redo branch structure)
   * - Apply tile-flip class to trigger CSS animation
   */
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Get tile from DISPLAY board (may show old color during flip)
      const displayTile = displayBoard.tiles[row]![col]!;

      // Get tile from GAME board (for move validation)
      const gameTile = board.tiles[row]![col]!;

      // Calculate tile states
      const isValid = gameTile === P; // Use game state for valid moves
      const isLast = isLastMove(row, col);
      const isDark = (row + col) % 2 === 0;
      const isFlipping = flippingTiles.has(`${row}-${col}`);

      // Check if this is an initial piece (one of the starting 4)
      const isInitialPiece =
        isInitialBoard(board) &&
        ((row === 3 && col === 3) ||
          (row === 3 && col === 4) ||
          (row === 4 && col === 3) ||
          (row === 4 && col === 4));

      // Only the top-left initial piece (3,3) creates the unified glare beam
      const isGlareSource = isInitialBoard(board) && row === 3 && col === 3;

      // Build CSS classes
      const tileClasses = [
        'Tile',
        isDark ? 'dark' : 'light',
        isValid ? 'valid-move' : '',
        isLast && features.glassGlare ? 'last-move' : isLast ? 'last-move-no-glare' : '', // Glass glare feature toggle
        isFlipping && features.animations ? 'tile-flip' : '', // Flip animation feature toggle
        isInitialPiece ? 'initial-piece' : '', // Mark all 4 initial pieces
        isGlareSource ? 'glare-source' : '', // Only top-left creates the beam
      ]
        .filter(Boolean)
        .join(' ');

      tiles.push(
        <div
          key={`${row}-${col}`}
          className={tileClasses}
          onClick={() => handleTileClick(row, col)}
        >
          {/* 
            tile-inner wrapper is ESSENTIAL for CSS 3D transforms
            - Provides transform-style: preserve-3d context
            - Allows rotateY animation to work properly
            - Child SVG rotates within this 3D space
          */}
          <div className="tile-inner">
            {/* Hint dot for valid moves - positioned element avoids CSS ::after conflicts */}
            {isValid && <div className="hint-dot" />}

            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* 
                3D Radial Gradients for Realistic Pieces
                
                Match the appearance of turn-piece in sidebar:
                - Light spot at 30% 30% position (top-left highlight)
                - Gradual darkening toward edges
                - Creates spherical 3D appearance
              */}
              <defs>
                {/* Black piece gradient: gray highlight to pure black */}
                <radialGradient id={`black-gradient-${row}-${col}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#4a4a4a" />
                  <stop offset="100%" stopColor="#000000" />
                </radialGradient>

                {/* White piece gradient: pure white to light gray */}
                <radialGradient id={`white-gradient-${row}-${col}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cccccc" />
                </radialGradient>
              </defs>

              {/* 
                Circle fill uses gradient URL reference
                Each piece gets unique gradient ID to avoid conflicts
              */}
              <circle
                cx="100"
                cy="100"
                r="92"
                fill={
                  displayTile === B
                    ? `url(#black-gradient-${row}-${col})` // 3D Black piece
                    : displayTile === W
                      ? `url(#white-gradient-${row}-${col})` // 3D White piece
                      : 'transparent' // Empty tile
                }
                stroke={displayTile === B ? '#000000' : displayTile === W ? '#cccccc' : 'none'}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="Board">
      <div className="board-grid">{tiles}</div>
    </div>
  );
};

export default Board;
