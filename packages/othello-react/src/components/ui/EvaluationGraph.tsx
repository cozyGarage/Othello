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
  const [zoom, setZoom] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Graph dimensions
  const baseWidth = 280;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };

  // Calculate dynamic width based on zoom
  const graphWidth = baseWidth * zoom - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  const totalWidth = baseWidth * zoom;

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

  const handleWheel = (e: React.WheelEvent) => {
    // Stop propagation to prevent page scroll if we are consuming the event
    e.stopPropagation();

    // Zoom in/out based on wheel direction
    // DeltaY is negative for scrolling up (Zoom In), positive for down (Zoom Out)
    const delta = -Math.sign(e.deltaY) * 0.1;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 10));
  };

  // Auto-scroll to keep current move in view
  React.useEffect(() => {
    if (containerRef.current) {
      const currentX = scaleX(currentMove);
      const container = containerRef.current;
      const centeredLeft = currentX - container.clientWidth / 2;
      container.scrollTo({ left: centeredLeft, behavior: 'smooth' });
    }
  }, [currentMove, zoom, scaleX]);

  return (
    <div className={`evaluation-panel ${isVisible ? 'open' : 'collapsed'}`}>
      <div className="evaluation-header">
        <button
          className="evaluation-toggle"
          onClick={onToggle}
          title={isVisible ? 'Hide evaluation graph' : 'Show evaluation graph'}
        >
          📊
          <span className="toggle-text">{isVisible ? 'Hide Analysis' : 'Show Analysis'}</span>
        </button>
        {isVisible && (
          <div className="zoom-controls">
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} title="Zoom Out">
              -
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(10, z + 0.5))} title="Zoom In">
              +
            </button>
          </div>
        )}
      </div>

      {isVisible && (
        <div className="evaluation-graph-container" ref={containerRef} onWheel={handleWheel}>
          <svg
            className="evaluation-graph"
            width={totalWidth}
            height={height}
            viewBox={`0 0 ${totalWidth} ${height}`}
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
              x2={totalWidth - padding.right}
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

            {/* Y-axis labels (Fixed position would be better but simple for now) */}
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

            {/* X-axis labels roughly every 10 moves */}
            {[0, 10, 20, 30, 40, 50, 60].map((move) => (
              <text
                key={move}
                x={scaleX(move)}
                y={height - 4}
                className="axis-label"
                textAnchor="middle"
              >
                {move}
              </text>
            ))}
          </svg>
        </div>
      )}

      {isVisible && (
        <div className="graph-legend">
          <span className="legend-black">⬤ Black</span>
          <span className="legend-white">⬤ White</span>
          <span className="legend-hint">(Scroll to zoom)</span>
        </div>
      )}
    </div>
  );
};

export default EvaluationGraph;
