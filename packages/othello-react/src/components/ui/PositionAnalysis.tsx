import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type Board, type Coordinate, CORNER_COORDINATES, getPositionWeight } from 'othello-engine';
import { aiManager } from '../../utils/aiManager';

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
 * Edge positions (valuable in Othello)
 * Note: coord is [x, y] = [col, row]
 */
const isEdge = (coord: Coordinate): boolean => {
  const [x, y] = coord;
  return x === 0 || x === 7 || y === 0 || y === 7;
};

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

  const analysisRequestRef = useRef(0);

  const isCorner = useCallback((coord: Coordinate): boolean => {
    return CORNER_COORDINATES.some(([x, y]) => coord[0] === x && coord[1] === y);
  }, []);

  /**
   * Analyze all valid moves and determine best move via shared AIManager path.
   */
  const analyzePosition = useCallback(() => {
    if (!enabled || board.tiles.length === 0) {
      setAnalysis([]);
      setBestMove(null);
      return;
    }

    const requestId = ++analysisRequestRef.current;
    setIsAnalyzing(true);

    // Create a clean board for the bot (replace 'P' with 'E')
    const cleanBoard: Board = {
      ...board,
      tiles: board.tiles.map((row) => row.map((cell) => (cell === 'P' ? 'E' : cell)) as typeof row),
    };

    // Static ranking from annotated valid-move markers
    const validMoves = board.tiles
      .flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => ({ cell, coord: [colIdx, rowIdx] as Coordinate }))
      )
      .filter(({ cell }) => cell === 'P')
      .map(({ coord }) => coord);

    aiManager
      .calculateMove(cleanBoard, 'hard', board.playerTurn, undefined, undefined, 1500)
      .then((result) => {
        if (requestId !== analysisRequestRef.current) return;

        const aiMove = result.move;
        setBestMove(aiMove);

        const moveAnalysis: MoveAnalysis[] = validMoves.map((coord) => ({
          coordinate: coord,
          score: getPositionWeight(coord),
          isCorner: isCorner(coord),
          isEdge: isEdge(coord),
          isBestMove: aiMove !== null && coord[0] === aiMove[0] && coord[1] === aiMove[1],
        }));

        moveAnalysis.sort((a, b) => b.score - a.score);
        setAnalysis(moveAnalysis);
        setIsAnalyzing(false);
        onHintMove?.(aiMove);
      })
      .catch(() => {
        if (requestId !== analysisRequestRef.current) return;
        setIsAnalyzing(false);
      });
    // onHintMove intentionally excluded to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, board, isCorner]);

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
