import React, { useEffect, useRef } from 'react';
import type { Move } from 'othello-engine';

interface MoveHistoryProps {
  moves: Move[];
  isVisible: boolean;
  /** Index of the currently-viewed move (for replay highlighting). null = live. */
  activeMove?: number | null;
  /** Called when user clicks a move to jump to it */
  onMoveClick?: (index: number) => void;
}

/** Format [x, y] engine coordinate to algebraic notation (a1–h8) */
function formatCoord([x, y]: [number, number]): string {
  return `${String.fromCharCode(97 + x)}${8 - y}`;
}

/**
 * Chess.com-style paired move list.
 *
 * Renders moves in pairs: 1. d3  e6   2. c5  f4 ...
 * Black move is always left, White is right (matching Othello convention
 * where Black goes first).
 */
export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  isVisible,
  activeMove = null,
  onMoveClick,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll to the latest (or active) move
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else if (listRef.current && activeMove === null) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length, activeMove]);

  if (!isVisible || moves.length === 0) {
    return (
      <div className="move-history-empty">
        <span>No moves yet</span>
      </div>
    );
  }

  // Group into pairs: [[black, white?], ...]
  const pairs: Array<[Move, Move | null]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    const blackMove = moves[i];
    if (!blackMove) continue;
    pairs.push([blackMove, moves[i + 1] ?? null]);
  }

  return (
    <div className="move-history-list" ref={listRef}>
      {pairs.map(([black, white], pairIdx) => {
        const blackIdx = pairIdx * 2;
        const whiteIdx = pairIdx * 2 + 1;
        const blackActive = activeMove === blackIdx;
        const whiteActive = activeMove === whiteIdx;
        // Highlight the last move in live mode
        const isLastBlack = activeMove === null && blackIdx === moves.length - 1;
        const isLastWhite = activeMove === null && white && whiteIdx === moves.length - 1;

        return (
          <div key={pairIdx} className="move-pair">
            <span className="move-pair-num">{pairIdx + 1}.</span>

            {/* Black move */}
            <span
              ref={blackActive || isLastBlack ? activeRef : null}
              className={`move-entry black ${blackActive || isLastBlack ? 'active' : ''}`}
              onClick={() => onMoveClick?.(blackIdx)}
              role={onMoveClick ? 'button' : undefined}
              tabIndex={onMoveClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onMoveClick?.(blackIdx);
              }}
            >
              {formatCoord(black.coordinate as [number, number])}
            </span>

            {/* White move (may not exist yet) */}
            {white ? (
              <span
                ref={whiteActive || isLastWhite ? activeRef : null}
                className={`move-entry white ${whiteActive || isLastWhite ? 'active' : ''}`}
                onClick={() => onMoveClick?.(whiteIdx)}
                role={onMoveClick ? 'button' : undefined}
                tabIndex={onMoveClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onMoveClick?.(whiteIdx);
                }}
              >
                {formatCoord(white.coordinate as [number, number])}
              </span>
            ) : (
              <span className="move-entry placeholder" />
            )}
          </div>
        );
      })}
    </div>
  );
};
