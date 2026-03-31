import React, { useRef, useEffect, useState } from 'react';
import { type Move, type PlayerTime } from 'othello-engine';
import { PlayerInfoCard } from '../ui/PlayerInfoCard';
import { TimeControl } from '../ui/TimeControl';
import { MoveHistory } from '../ui/MoveHistory';
import { features } from '../../config/features';
import '../../styles/sidebar.css';

interface SidebarProps {
  currentPlayer: 'black' | 'white';
  blackScore: number;
  whiteScore: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  moves: Move[];
  message?: string | null;
  gameOver: boolean;
  timeRemaining?: PlayerTime | null;
  // Hints feature
  onHintRequest?: () => void;
  hintsRemaining?: number;
  hintsEnabled?: boolean;
  // AI thinking indicator
  aiThinking?: boolean;
  aiThinkingDepth?: number;
  aiThinkingNodes?: number;
  // Move navigation (replay)
  activeMoveIndex?: number | null;
  onMoveClick?: (index: number) => void;
}

/**
 * Sidebar Component
 * Contains turn indicator, score, and move history
 * Controls moved to action bar below game
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentPlayer,
  blackScore,
  whiteScore,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  moves,
  message,
  gameOver,
  timeRemaining,
  // Hints feature
  onHintRequest,
  hintsRemaining = 0,
  hintsEnabled = false,
  // AI thinking
  aiThinking = false,
  aiThinkingDepth = 0,
  aiThinkingNodes = 0,
  // Move navigation
  activeMoveIndex = null,
  onMoveClick,
}) => {
  // Store previous scores to calculate deltas
  // useRef persists across renders without triggering re-render
  const prevBlackScore = useRef(blackScore);
  const prevWhiteScore = useRef(whiteScore);

  // DOM refs for score elements (to add animation classes)
  const blackScoreRef = useRef<HTMLDivElement>(null);
  const whiteScoreRef = useRef<HTMLDivElement>(null);

  // Track score changes for animated +/- indicators
  // null = no animation, number = show delta floating up
  const [blackDelta, setBlackDelta] = useState<number | null>(null);
  const [whiteDelta, setWhiteDelta] = useState<number | null>(null);

  /**
   * Score Change Animation Effect
   *
   * Detects score changes and triggers TWO animations:
   * 1. Floating delta number (+5, -3, etc.)
   * 2. Score value brightness/glow effect (NEW!)
   *
   * Example: Score 10 → 15
   * - Shows "+5" floating up in green
   * - Score value flashes gold with glow
   *
   * Animation lifecycle:
   * 1. Detect change (compare current vs previous)
   * 2. Set delta state (triggers render with animated number)
   * 3. Add CSS class to score element (triggers brightness animation)
   * 4. After animation completes, remove class (ready for next change)
   */
  useEffect(() => {
    const blackChange = blackScore - prevBlackScore.current;
    const whiteChange = whiteScore - prevWhiteScore.current;

    /**
     * Detect New Game Reset
     *
     * When user presses "New Game", scores reset to 2-2
     * This would normally trigger negative change animations (red flash)
     * We skip animations for this specific case
     */
    const isNewGameReset =
      blackScore === 2 &&
      whiteScore === 2 &&
      (prevBlackScore.current !== 2 || prevWhiteScore.current !== 2);

    // Animate black score change (skip if new game reset)
    if (blackChange !== 0 && features.scoreAnimations && !isNewGameReset) {
      setBlackDelta(blackChange);
      setTimeout(() => setBlackDelta(null), 1000);

      // Trigger brightness/glow animation
      if (blackScoreRef.current) {
        const className = blackChange > 0 ? 'score-increased' : 'score-decreased';
        blackScoreRef.current.classList.add(className);

        // Remove class after animation completes (500ms duration)
        setTimeout(() => {
          blackScoreRef.current?.classList.remove(className);
        }, 500);
      }
    } else if (blackChange !== 0) {
      // Score changed but animations disabled - just update ref
      prevBlackScore.current = blackScore;
    }

    // Animate white score change (skip if new game reset)
    if (whiteChange !== 0 && features.scoreAnimations && !isNewGameReset) {
      setWhiteDelta(whiteChange);
      setTimeout(() => setWhiteDelta(null), 1000);

      // Trigger brightness/glow animation
      if (whiteScoreRef.current) {
        const className = whiteChange > 0 ? 'score-increased' : 'score-decreased';
        whiteScoreRef.current.classList.add(className);

        // Remove class after animation completes (500ms duration)
        setTimeout(() => {
          whiteScoreRef.current?.classList.remove(className);
        }, 500);
      }
    } else if (whiteChange !== 0) {
      // Score changed but animations disabled - just update ref
      prevWhiteScore.current = whiteScore;
    }

    // Update refs for next comparison
    prevBlackScore.current = blackScore;
    prevWhiteScore.current = whiteScore;
  }, [blackScore, whiteScore]);

  return (
    <div className="sidebar">
      {/* Turn Indicator with Undo/Redo/Hint */}
      <div className="sidebar-card">
        <div className="turn-controls">
          <div className="turn-player">
            <div className={`turn-piece ${currentPlayer}`} />
            <span>{currentPlayer === 'black' ? 'Black' : 'White'}</span>
          </div>
          <button
            className="control-btn-compact"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            className="control-btn-compact"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
          {/* Hint button - shows remaining hints */}
          <button
            className={`control-btn-compact hint-btn ${hintsEnabled ? 'active' : ''}`}
            onClick={onHintRequest}
            disabled={gameOver || hintsRemaining <= 0}
            title={`Get hint (${hintsRemaining} remaining)`}
          >
            💡
            {hintsRemaining > 0 && <span className="hint-badge">{hintsRemaining}</span>}
          </button>
        </div>
      </div>

      {/* AI Thinking Indicator */}
      {aiThinking && (
        <div className="sidebar-card ai-thinking-card">
          <div className="ai-thinking-indicator">
            <span className="ai-thinking-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
            <span className="ai-thinking-text">AI thinking...</span>
          </div>
          {aiThinkingDepth > 0 && (
            <div className="ai-thinking-stats">
              <span>Depth {aiThinkingDepth}</span>
              <span>{aiThinkingNodes.toLocaleString()} nodes</span>
            </div>
          )}
        </div>
      )}

      {/* Score Display */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Score</h3>
        <div className="score-display">
          <div className="score-item">
            <div className="turn-piece black" />
            <div className="score-value-container">
              {/* Black score with brightness animation ref */}
              <div ref={blackScoreRef} className="score-value">
                {blackScore}
              </div>
              {blackDelta !== null && (
                <div className={`score-delta ${blackDelta > 0 ? 'positive' : 'negative'}`}>
                  {blackDelta > 0 ? '+' : ''}
                  {blackDelta}
                </div>
              )}
            </div>
            <PlayerInfoCard playerName="Black" playerColor="black">
              <div className="score-label">Black</div>
            </PlayerInfoCard>
            {/* Time Control for Black */}
            {timeRemaining && (
              <TimeControl
                timeRemaining={timeRemaining.black}
                playerColor="black"
                isActive={currentPlayer === 'black' && !gameOver}
                onTimeOut={() => {}}
              />
            )}
          </div>
          <div className="score-separator">-</div>
          <div className="score-item">
            <div className="turn-piece white" />
            <div className="score-value-container">
              {/* White score with brightness animation ref */}
              <div ref={whiteScoreRef} className="score-value">
                {whiteScore}
              </div>
              {whiteDelta !== null && (
                <div className={`score-delta ${whiteDelta > 0 ? 'positive' : 'negative'}`}>
                  {whiteDelta > 0 ? '+' : ''}
                  {whiteDelta}
                </div>
              )}
            </div>
            <PlayerInfoCard playerName="White" playerColor="white">
              <div className="score-label">White</div>
            </PlayerInfoCard>
            {/* Time Control for White */}
            {timeRemaining && (
              <TimeControl
                timeRemaining={timeRemaining.white}
                playerColor="white"
                isActive={currentPlayer === 'white' && !gameOver}
                onTimeOut={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      {/* Game Message */}
      {message && <div className={`game-message ${gameOver ? 'success' : ''}`}>{message}</div>}

      {/* Move History - fills remaining space in sidebar */}
      {features.moveHistory && (
        <div className="sidebar-card move-history-card">
          <h3 className="sidebar-card-title">Moves</h3>
          <MoveHistory
            moves={moves}
            isVisible={true}
            activeMove={activeMoveIndex}
            onMoveClick={onMoveClick}
          />
        </div>
      )}
    </div>
  );
};
