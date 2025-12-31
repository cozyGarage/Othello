import React from 'react';
import './EvaluationGraph.css';

/**
 * Single evaluation point in the game history
 */
interface EvaluationPoint {
  move: number;
  evaluation: number;
}

interface EvaluationGraphProps {
  /** Array of evaluation points from game history */
  history: EvaluationPoint[];
  /** Current move index (for highlighting) */
  currentMove: number;
  /** Callback when user clicks a point to navigate history */
  onMoveClick?: (move: number) => void;
  /** Whether the graph is visible */
  isVisible: boolean;
  /** Toggle visibility callback */
  onToggle?: () => void;
}

/**
 * EvaluationGraph - Egaroucid-inspired game evaluation visualization
 *
 * Displays a line chart showing how the game evaluation changed over time.
 * X-axis: Move number (0-60)
 * Y-axis: Evaluation (-64 to +64, positive = Black advantage)
 *
 * Click on any point to navigate to that position in history.
 */
const EvaluationGraph: React.FC<EvaluationGraphProps> = ({
  history,
  currentMove,
  onMoveClick,
  isVisible,
  onToggle,
}) => {
  // Graph dimensions
  const width = 280;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (move: number): number => {
    return padding.left + (move / 60) * graphWidth;
  };

  const scaleY = (evaluation: number): number => {
    // Invert Y axis, and map -64 to +64 range
    const normalized = (64 - evaluation) / 128;
    return padding.top + normalized * graphHeight;
  };

  // Generate path data
  const pathData =
    history.length > 0
      ? history
          .map((point, i) => {
            const x = scaleX(point.move);
            const y = scaleY(point.evaluation);
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          })
          .join(' ')
      : '';

  // Area fill for Black advantage (above 0)
  const areaAboveZero =
    history.length > 0
      ? `M ${scaleX(0)} ${scaleY(0)} ` +
        history
          .map((point) => {
            const x = scaleX(point.move);
            const y = scaleY(Math.max(0, point.evaluation));
            return `L ${x} ${y}`;
          })
          .join(' ') +
        ` L ${scaleX(history[history.length - 1]?.move ?? 0)} ${scaleY(0)} Z`
      : '';

  // Area fill for White advantage (below 0)
  const areaBelowZero =
    history.length > 0
      ? `M ${scaleX(0)} ${scaleY(0)} ` +
        history
          .map((point) => {
            const x = scaleX(point.move);
            const y = scaleY(Math.min(0, point.evaluation));
            return `L ${x} ${y}`;
          })
          .join(' ') +
        ` L ${scaleX(history[history.length - 1]?.move ?? 0)} ${scaleY(0)} Z`
      : '';

  const handlePointClick = (move: number) => {
    if (onMoveClick) {
      onMoveClick(move);
    }
  };

  return (
    <div className={`evaluation-panel ${isVisible ? 'open' : 'collapsed'}`}>
      <button
        className="evaluation-toggle"
        onClick={onToggle}
        title={isVisible ? 'Hide evaluation graph' : 'Show evaluation graph'}
      >
        📊
        <span className="toggle-text">{isVisible ? 'Hide' : 'Show'}</span>
      </button>

      {isVisible && (
        <div className="evaluation-graph-container">
          <svg
            className="evaluation-graph"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* Background */}
            <rect
              x={padding.left}
              y={padding.top}
              width={graphWidth}
              height={graphHeight}
              fill="var(--graph-bg, rgba(0,0,0,0.2))"
              rx={4}
            />

            {/* Zero line (center) */}
            <line
              x1={padding.left}
              y1={scaleY(0)}
              x2={width - padding.right}
              y2={scaleY(0)}
              stroke="var(--graph-zero-line, rgba(255,255,255,0.3))"
              strokeDasharray="4,4"
            />

            {/* Area fills */}
            <path d={areaAboveZero} fill="var(--graph-black-area, rgba(76, 175, 80, 0.2))" />
            <path d={areaBelowZero} fill="var(--graph-white-area, rgba(244, 67, 54, 0.2))" />

            {/* Main line */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="var(--graph-line, #4fc3f7)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Current position marker */}
            {history.length > 0 && (
              <line
                x1={scaleX(currentMove)}
                y1={padding.top}
                x2={scaleX(currentMove)}
                y2={height - padding.bottom}
                stroke="var(--graph-current, rgba(255,255,255,0.7))"
                strokeWidth={2}
              />
            )}

            {/* Clickable points */}
            {history.map((point) => (
              <circle
                key={point.move}
                cx={scaleX(point.move)}
                cy={scaleY(point.evaluation)}
                r={point.move === currentMove ? 5 : 3}
                fill={
                  point.move === currentMove
                    ? 'var(--graph-current-point, #fff)'
                    : 'var(--graph-point, #4fc3f7)'
                }
                stroke={point.move === currentMove ? '#4fc3f7' : 'none'}
                strokeWidth={2}
                className="graph-point"
                onClick={() => handlePointClick(point.move)}
              />
            ))}

            {/* Y-axis labels */}
            <text x={padding.left - 5} y={padding.top + 5} className="axis-label" textAnchor="end">
              +64
            </text>
            <text x={padding.left - 5} y={scaleY(0) + 4} className="axis-label" textAnchor="end">
              0
            </text>
            <text
              x={padding.left - 5}
              y={height - padding.bottom - 2}
              className="axis-label"
              textAnchor="end"
            >
              -64
            </text>

            {/* X-axis labels */}
            <text x={padding.left} y={height - 4} className="axis-label">
              0
            </text>
            <text x={width / 2} y={height - 4} className="axis-label" textAnchor="middle">
              30
            </text>
            <text x={width - padding.right} y={height - 4} className="axis-label" textAnchor="end">
              60
            </text>
          </svg>

          {/* Legend */}
          <div className="graph-legend">
            <span className="legend-black">⬤ Black</span>
            <span className="legend-white">⬤ White</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationGraph;
