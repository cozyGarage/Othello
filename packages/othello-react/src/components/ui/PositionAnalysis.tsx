import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OthelloBot, type Board, type Coordinate } from 'othello-engine';

/**
 * Props for the PositionAnalysis component
 */
interface PositionAnalysisProps {
  /** Current board state */
  board: Board;
  /** Whether analysis is enabled */
  enabled: boolean;
  /** Callback when a hint move should be highlighted */
  onHintMove?: (move: Coordinate | null) => void;
  /** Whether to show the analysis panel UI */
  showPanel?: boolean;
}

/**
 * Analysis result for a single move
 */
interface MoveAnalysis {
  coordinate: Coordinate;
  score: number;
  isCorner: boolean;
  isEdge: boolean;
  isBestMove: boolean;
}

/**
 * Corner positions (most valuable in Othello)
 * Note: Coordinates are [x, y] = [col, row]
 */
const CORNERS: Coordinate[] = [
  [0, 0],
  [7, 0],
  [0, 7],
  [7, 7],
];

/**
 * Edge positions (valuable in Othello)
 * Note: coord is [x, y] = [col, row]
 */
const isEdge = (coord: Coordinate): boolean => {
  const [x, y] = coord;
  return x === 0 || x === 7 || y === 0 || y === 7;
};

/**
 * Position weights for static evaluation
 * Corners: 100, Adjacent to corners (dangerous): -20, Edges: 10, etc.
 */
const POSITION_WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
];

/**
 * PositionAnalysis - AI-powered move suggestions and position evaluation
 *
 * Features:
 * - Shows the best move using the hard AI algorithm
 * - Analyzes all valid moves and ranks them
 * - Highlights strategic positions (corners, edges)
 * - Provides move quality indicators
 *
 * @example
 * ```tsx
 * <PositionAnalysis
 *   board={gameBoard}
 *   enabled={showHints}
 *   onHintMove={(move) => setHighlightedMove(move)}
 *   showPanel={true}
 * />
 * ```
 */
export const PositionAnalysis: React.FC<PositionAnalysisProps> = ({
  board,
  enabled,
  onHintMove,
  showPanel = true,
}) => {
  /** Analysis results for all valid moves */
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([]);

  /** Best move calculated by AI */
  const [bestMove, setBestMove] = useState<Coordinate | null>(null);

  /** Analysis in progress flag */
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  /** Reference to the bot instance */
  const botRef = useRef<OthelloBot | null>(null);

  /**
   * Calculate position score using static evaluation
   * Note: coord is [x, y] = [col, row], POSITION_WEIGHTS is [row][col]
   */
  const getPositionScore = useCallback((coord: Coordinate): number => {
    const [col, row] = coord;
    const weight = POSITION_WEIGHTS[row]?.[col] ?? 0;
    return weight;
  }, []);

  /**
   * Check if a move is a corner
   * Note: CORNERS are in [x, y] format
   */
  const isCorner = useCallback((coord: Coordinate): boolean => {
    return CORNERS.some(([x, y]) => coord[0] === x && coord[1] === y);
  }, []);

  /**
   * Analyze all valid moves and determine best move
   */
  const analyzePosition = useCallback(() => {
    if (!enabled || board.tiles.length === 0) {
      setAnalysis([]);
      setBestMove(null);
      return;
    }

    setIsAnalyzing(true);

    // Initialize bot if needed
    if (!botRef.current) {
      botRef.current = new OthelloBot('hard', board.playerTurn);
    } else {
      botRef.current.setPlayer(board.playerTurn);
    }

    // Create a clean board for the bot (replace 'P' with 'E')
    // The annotated board has 'P' for valid moves, but bot needs 'E' empty squares
    const cleanBoard: Board = {
      ...board,
      tiles: board.tiles.map((row) => row.map((cell) => (cell === 'P' ? 'E' : cell)) as typeof row),
    };

    // Get best move from AI using clean board
    const aiMove = botRef.current.calculateMove(cleanBoard);
    setBestMove(aiMove);

    // Analyze all valid moves from the annotated board
    // Note: board.tiles is [row][col], but Coordinate is [x, y] = [col, row]
    const validMoves = board.tiles
      .flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => ({ cell, coord: [colIdx, rowIdx] as Coordinate }))
      )
      .filter(({ cell }) => cell === 'P') // 'P' marks valid moves in annotated board
      .map(({ coord }) => coord);

    // Get coordinates from the board's valid moves if available
    const movesToAnalyze = validMoves.length > 0 ? validMoves : [];

    const moveAnalysis: MoveAnalysis[] = movesToAnalyze.map((coord) => ({
      coordinate: coord,
      score: getPositionScore(coord),
      isCorner: isCorner(coord),
      isEdge: isEdge(coord),
      isBestMove: aiMove !== null && coord[0] === aiMove[0] && coord[1] === aiMove[1],
    }));

    // Sort by score (best first)
    moveAnalysis.sort((a, b) => b.score - a.score);

    setAnalysis(moveAnalysis);
    setIsAnalyzing(false);

    // Notify parent of best move
    if (onHintMove) {
      onHintMove(aiMove);
    }
  }, [enabled, board, getPositionScore, isCorner]); // Removed onHintMove from deps to prevent infinite loop

  /**
   * Reference to track if we need to re-analyze
   */
  const lastBoardRef = useRef<string>('');

  /**
   * Re-analyze when board changes (with loop protection)
   */
  useEffect(() => {
    // Create a board signature to detect actual changes
    const boardSig = JSON.stringify(board.tiles) + board.playerTurn;
    if (boardSig !== lastBoardRef.current) {
      lastBoardRef.current = boardSig;
      analyzePosition();
    }
  }, [analyzePosition, board]);

  /**
   * Clear hint when disabled (only runs on enabled change)
   */
  useEffect(() => {
    if (!enabled && onHintMove) {
      onHintMove(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on enabled change
  }, [enabled]);

  if (!enabled || !showPanel) return null;

  /**
   * Format coordinate to algebraic notation
   * Note: coord is [x, y] = [col, row]
   */
  const formatCoordinate = (coord: Coordinate): string => {
    const [x, y] = coord;
    const column = String.fromCharCode(97 + x); // a-h
    const rowNum = 8 - y; // 8-1
    return `${column}${rowNum}`;
  };

  /**
   * Get quality indicator for a move
   */
  const getQualityIndicator = (move: MoveAnalysis): string => {
    if (move.isBestMove) return '★ Best';
    if (move.isCorner) return '◆ Corner';
    if (move.isEdge) return '▬ Edge';
    if (move.score > 0) return '↑ Good';
    if (move.score < -20) return '↓ Risky';
    return '○ OK';
  };

  /**
   * Get CSS class for move quality
   */
  const getQualityClass = (move: MoveAnalysis): string => {
    if (move.isBestMove) return 'quality-best';
    if (move.isCorner) return 'quality-corner';
    if (move.isEdge) return 'quality-edge';
    if (move.score > 0) return 'quality-good';
    if (move.score < -20) return 'quality-risky';
    return 'quality-neutral';
  };

  return (
    <div className="position-analysis">
      <div className="analysis-header">
        <h4>💡 Position Analysis</h4>
        {isAnalyzing && <span className="analyzing-indicator">Analyzing...</span>}
      </div>

      {bestMove && (
        <div className="best-move-highlight">
          <span className="best-move-label">Best Move:</span>
          <span className="best-move-coord">{formatCoordinate(bestMove)}</span>
        </div>
      )}

      {analysis.length === 0 && !isAnalyzing && (
        <div className="no-moves">No valid moves available</div>
      )}

      <div className="move-analysis-list">
        {analysis.map((move, index) => (
          <div
            key={`${move.coordinate[0]}-${move.coordinate[1]}`}
            className={`analysis-item ${getQualityClass(move)}`}
            onClick={() => onHintMove?.(move.coordinate)}
          >
            <span className="analysis-rank">{index + 1}.</span>
            <span className="analysis-coord">{formatCoordinate(move.coordinate)}</span>
            <span className="analysis-quality">{getQualityIndicator(move)}</span>
            <span className="analysis-score">
              ({move.score > 0 ? '+' : ''}
              {move.score})
            </span>
          </div>
        ))}
      </div>

      <div className="analysis-legend">
        <span className="legend-item legend-best">★ Best</span>
        <span className="legend-item legend-corner">◆ Corner</span>
        <span className="legend-item legend-edge">▬ Edge</span>
      </div>
    </div>
  );
};

export default PositionAnalysis;
