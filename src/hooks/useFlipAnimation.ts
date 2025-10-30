import { useState, useEffect, useRef } from 'react';
import type { TileValue } from '../game-logic';
import { hasAnimations, hasGlassGlare } from '../config/features';

interface UseFlipAnimationResult {
  displayTile: TileValue;
  isAnimating: boolean;
  tileClasses: string;
}

interface UseFlipAnimationOptions {
  tile: TileValue;
  x: number;
  y: number;
  isLastMove?: boolean;
  isValidMove?: boolean;
}

/**
 * Custom hook for managing tile flip animations in Othello game
 * 
 * BRILLIANT SOLUTION: Separate visual state from game state
 * - Game logic updates `tile` instantly (game-logic.ts)
 * - `displayTile` controls what user sees during animation
 * - This allows showing OLD color during first half of flip
 * 
 * ANIMATION TIMELINE (600ms total):
 * - 0ms: Show OLD color, start flip (rotateY 0° → 180°)
 * - 300ms (50%): Piece at 90° rotation (invisible via CSS opacity: 0)
 *                Perfect moment to switch colors without user seeing swap
 * - 600ms (100%): Animation complete, showing NEW color
 * 
 * @param options - Configuration object
 * @param options.tile - Current tile state from game logic
 * @param options.x - Tile x coordinate (for effect dependency)
 * @param options.y - Tile y coordinate (for effect dependency)
 * @param options.isLastMove - Whether this is the last move (for glass glare)
 * @param options.isValidMove - Whether this is a valid move (for highlight)
 * @returns Object with displayTile, isAnimating, and computed tileClasses
 */
export function useFlipAnimation({
  tile,
  x,
  y,
  isLastMove = false,
  isValidMove = false
}: UseFlipAnimationOptions): UseFlipAnimationResult {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTile, setDisplayTile] = useState(tile);
  const prevTileRef = useRef(tile);

  // Trigger animation ONLY when tile flips (B→W or W→B), not when placed (P→B or P→W)
  useEffect(() => {
    const prev = prevTileRef.current;
    const current = tile;

    // Only animate if changing between actual pieces (B↔W), not from P or E
    const isFlip = (prev === 'B' && current === 'W') || (prev === 'W' && current === 'B');

    // Check if animations are enabled via feature flags
    if (isFlip && hasAnimations()) {
      // ANIMATION TIMELINE (600ms total):
      // 0ms: Show OLD color, start flip animation (rotateY 0° → 180°)
      setDisplayTile(prev);
      setIsAnimating(true);

      // 300ms (50%): Piece at 90° rotation (invisible via CSS opacity: 0)
      //              Perfect moment to switch colors without user seeing the swap
      const colorChangeTimer = setTimeout(() => {
        setDisplayTile(current);
      }, 300);

      // 600ms (100%): Animation complete, piece showing NEW color
      const endTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);

      prevTileRef.current = tile;

      return () => {
        clearTimeout(colorChangeTimer);
        clearTimeout(endTimer);
      };
    } else {
      // No animation (disabled or not a flip), just update display immediately
      setDisplayTile(current);
      prevTileRef.current = tile;
    }

    // Return empty cleanup function when no flip
    return () => {};
  }, [tile, x, y]);

  // Compute tile classes
  const tileClasses = [
    'Tile',
    displayTile, // Use displayTile for visual appearance during animation
    isLastMove && hasGlassGlare() ? 'last-move' : '', // Respect glassGlare flag
    isValidMove ? 'valid-move' : '',
    isAnimating && hasAnimations() ? 'tile-flip' : '' // Respect animations flag
  ].filter(Boolean).join(' ');

  return {
    displayTile,
    isAnimating,
    tileClasses
  };
}
