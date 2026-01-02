import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type Move, type Coordinate, type TileValue, E, B, W } from 'othello-engine';

/**
 * Props for the GameReplay component
 */
interface GameReplayProps {
  /** Complete move history from the game */
  moves: Move[];
  /** Whether the replay panel is visible */
  isVisible: boolean;
  /** Callback when replay changes the displayed move */
  onMoveChange?: (moveIndex: number, board: TileValue[][]) => void;
  /** Callback to close the replay panel */
  onClose?: () => void;
}

/**
 * Available playback speeds in milliseconds per move
 */
const PLAYBACK_SPEEDS = [
  { label: '0.25x', ms: 2000 },
  { label: '0.5x', ms: 1000 },
  { label: '1x', ms: 500 },
  { label: '2x', ms: 250 },
  { label: '4x', ms: 125 },
] as const;

/**
 * Standard Othello starting position
 */
const INITIAL_BOARD: TileValue[][] = [
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, W, B, E, E, E],
  [E, E, E, B, W, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
];

/**
 * Directions for flip calculation (8 directions: N, NE, E, SE, S, SW, W, NW)
 */
const DIRECTIONS: [number, number][] = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
];

/**
 * GameReplay - Interactive replay system for reviewing completed games
 *
 * Features:
 * - Step through moves forward/backward
 * - Jump to any move in history
 * - Automatic playback at configurable speeds
 * - Visual timeline/scrubber
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <GameReplay
 *   moves={gameHistory}
 *   isVisible={showReplay}
 *   onMoveChange={(idx, board) => updateDisplay(board)}
 *   onClose={() => setShowReplay(false)}
 * />
 * ```
 */
export const GameReplay: React.FC<GameReplayProps> = ({
  moves,
  isVisible,
  onMoveChange,
  onClose,
}) => {
  /** Current move index (-1 means initial position before any moves) */
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  /** Whether auto-playback is active */
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  /** Current playback speed index */
  const [speedIndex, setSpeedIndex] = useState<number>(2); // Default to 1x

  /** Reference for the playback interval */
  const playIntervalRef = useRef<number | null>(null);

  /**
   * Reconstruct the board state at a given move index
   * Uses the move history to replay all moves up to that point
   *
   * @param targetIndex - Move index to reconstruct (-1 for initial position)
   * @returns The board state at that move
   */
  const reconstructBoardAt = useCallback(
    (targetIndex: number): TileValue[][] => {
      // Start with the initial board (deep copy)
      const board: TileValue[][] = INITIAL_BOARD.map((row) => [...row]);

      // Apply each move up to targetIndex
      for (let i = 0; i <= targetIndex && i < moves.length; i++) {
        const move = moves[i];
        if (!move) continue;

        const [row, col] = move.coordinate;
        const player = move.player;
        const opponent = player === B ? W : B;

        // Place the disc
        const boardRow = board[row];
        if (!boardRow) continue;
        boardRow[col] = player;

        // Find and flip captured discs in all directions
        for (const [dr, dc] of DIRECTIONS) {
          const toFlip: Coordinate[] = [];
          let r = row + dr;
          let c = col + dc;

          // Collect opponent discs in this direction
          while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r]?.[c] === opponent) {
            toFlip.push([r, c]);
            r += dr;
            c += dc;
          }

          // If we ended on our own disc, flip all collected discs
          if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r]?.[c] === player && toFlip.length > 0) {
            for (const [flipR, flipC] of toFlip) {
              const flipRow = board[flipR];
              if (flipRow) flipRow[flipC] = player;
            }
          }
        }
      }

      return board;
    },
    [moves]
  );

  /**
   * Navigate to a specific move and notify parent
   */
  const goToMove = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(-1, Math.min(index, moves.length - 1));
      setCurrentMoveIndex(clampedIndex);

      if (onMoveChange) {
        const board = reconstructBoardAt(clampedIndex);
        onMoveChange(clampedIndex, board);
      }
    },
    [moves.length, onMoveChange, reconstructBoardAt]
  );

  /**
   * Step forward one move
   */
  const stepForward = useCallback(() => {
    if (currentMoveIndex < moves.length - 1) {
      goToMove(currentMoveIndex + 1);
    } else {
      // Reached the end, stop playback
      setIsPlaying(false);
    }
  }, [currentMoveIndex, moves.length, goToMove]);

  /**
   * Step backward one move
   */
  const stepBackward = useCallback(() => {
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, goToMove]);

  /**
   * Toggle auto-playback
   */
  const togglePlay = useCallback(() => {
    if (currentMoveIndex >= moves.length - 1) {
      // If at the end, restart from beginning
      goToMove(-1);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, currentMoveIndex, moves.length, goToMove]);

  /**
   * Jump to beginning (initial position)
   */
  const jumpToStart = useCallback(() => {
    setIsPlaying(false);
    goToMove(-1);
  }, [goToMove]);

  /**
   * Jump to end (final position)
   */
  const jumpToEnd = useCallback(() => {
    setIsPlaying(false);
    goToMove(moves.length - 1);
  }, [moves.length, goToMove]);

  /**
   * Cycle through playback speeds
   */
  const cycleSpeed = useCallback(() => {
    setSpeedIndex((prev) => (prev + 1) % PLAYBACK_SPEEDS.length);
  }, []);

  /**
   * Handle auto-playback interval
   */
  useEffect(() => {
    if (isPlaying) {
      const speed = PLAYBACK_SPEEDS[speedIndex]?.ms ?? 500;
      playIntervalRef.current = window.setInterval(() => {
        stepForward();
      }, speed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, speedIndex, stepForward]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case ' ': // Space
          e.preventDefault();
          togglePlay();
          break;
        case 'Home':
          e.preventDefault();
          jumpToStart();
          break;
        case 'End':
          e.preventDefault();
          jumpToEnd();
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, stepBackward, stepForward, togglePlay, jumpToStart, jumpToEnd, onClose]);

  /**
   * Sync to the latest move when moves change (new move or undo)
   */
  useEffect(() => {
    // When history updates, sync the index to the latest move.
    // Note: moves.length - 1 will be -1 when there are no moves,
    // which represents the initial pre-move game state.
    setCurrentMoveIndex(moves.length - 1);
    setIsPlaying(false);
  }, [moves]);

  /**
   * Initialize the board display when replay becomes visible
   */
  useEffect(() => {
    if (isVisible && onMoveChange) {
      const board = reconstructBoardAt(currentMoveIndex);
      onMoveChange(currentMoveIndex, board);
    }
    // Only run when isVisible changes to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (!isVisible) return null;

  /**
   * Format coordinate to algebraic notation (e.g., "d5")
   */
  const formatCoordinate = (coord: Coordinate): string => {
    const [row, col] = coord;
    const column = String.fromCharCode(97 + col); // a-h
    const rowNum = 8 - row; // 8-1
    return `${column}${rowNum}`;
  };

  const currentMove = currentMoveIndex >= 0 ? moves[currentMoveIndex] : null;
  const totalMoves = moves.length;
  const progress = totalMoves > 0 ? ((currentMoveIndex + 1) / totalMoves) * 100 : 0;
  const currentSpeed = PLAYBACK_SPEEDS[speedIndex]?.label ?? '1x';

  return (
    <div className="game-replay">
      <div className="replay-header">
        <h3>📽️ Game Replay</h3>
        <button className="replay-close" onClick={onClose} aria-label="Close replay">
          ×
        </button>
      </div>

      {/* Current position info */}
      <div className="replay-info">
        <span className="replay-position">
          Move {currentMoveIndex + 1} / {totalMoves}
        </span>
        {currentMove && (
          <span className="replay-current-move">
            {currentMove.player === B ? '⚫' : '⚪'} {formatCoordinate(currentMove.coordinate)}
            <span className="replay-score">
              (⚫{currentMove.scoreAfter.black} - ⚪{currentMove.scoreAfter.white})
            </span>
          </span>
        )}
        {currentMoveIndex === -1 && <span className="replay-current-move">Initial Position</span>}
      </div>

      {/* Progress bar / scrubber */}
      <div className="replay-progress-container">
        <input
          type="range"
          min={-1}
          max={totalMoves - 1}
          value={currentMoveIndex}
          onChange={(e) => goToMove(parseInt(e.target.value, 10))}
          className="replay-scrubber"
          aria-label="Game progress scrubber"
        />
        <div className="replay-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Playback controls */}
      <div className="replay-controls">
        <button
          onClick={jumpToStart}
          className="replay-btn"
          aria-label="Jump to start"
          title="Jump to start (Home)"
        >
          ⏮
        </button>
        <button
          onClick={stepBackward}
          className="replay-btn"
          disabled={currentMoveIndex <= -1}
          aria-label="Previous move"
          title="Previous move (←)"
        >
          ⏪
        </button>
        <button
          onClick={togglePlay}
          className="replay-btn replay-btn-play"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={stepForward}
          className="replay-btn"
          disabled={currentMoveIndex >= totalMoves - 1}
          aria-label="Next move"
          title="Next move (→)"
        >
          ⏩
        </button>
        <button
          onClick={jumpToEnd}
          className="replay-btn"
          aria-label="Jump to end"
          title="Jump to end (End)"
        >
          ⏭
        </button>
        <button
          onClick={cycleSpeed}
          className="replay-btn replay-speed"
          aria-label="Change playback speed"
          title="Change speed"
        >
          {currentSpeed}
        </button>
      </div>

      {/* Move list (clickable) */}
      <div className="replay-move-list">
        <div
          className={`replay-move-item ${currentMoveIndex === -1 ? 'active' : ''}`}
          onClick={() => goToMove(-1)}
        >
          Start
        </div>
        {moves.map((move, index) => (
          <div
            key={index}
            className={`replay-move-item ${currentMoveIndex === index ? 'active' : ''}`}
            onClick={() => goToMove(index)}
          >
            <span className="move-num">{index + 1}.</span>
            <span className={`move-disc ${move.player === B ? 'black' : 'white'}`}>
              {move.player === B ? '⚫' : '⚪'}
            </span>
            <span className="move-coord">{formatCoordinate(move.coordinate)}</span>
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="replay-shortcuts">
        ← → Step • Space Play/Pause • Home/End Jump • Esc Close
      </div>
    </div>
  );
};

export default GameReplay;
