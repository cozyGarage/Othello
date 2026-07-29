import React, { useRef, type TouchEvent } from 'react';
import { Sidebar } from '../layout/Sidebar';
import Board from '../layout/Board';
import { GameActionBar } from './GameActionBar';
import { PositionAnalysis, ErrorBoundary, EvaluationBar } from '../ui';
import EvaluationGraph from '../ui/EvaluationGraph';
import type { Board as BoardType, Coordinate, Move, PlayerTime } from 'othello-engine';
import type { EvaluationPoint } from '../../hooks/useGameEngine';

export interface PlayAreaProps {
  onReset: () => void;
  displayBoard: BoardType;
  analysisBoard: BoardType;
  onPlayerTurn: (coord: Coordinate) => void;
  lastMove: Coordinate | null;
  gameOver: boolean;
  hintMove: Coordinate | null;
  hintsEnabled: boolean;
  onHintMove: (move: Coordinate | null) => void;
  currentPlayer: 'black' | 'white';
  blackScore: number;
  whiteScore: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  moves: Move[];
  message: string | null;
  timeRemaining: PlayerTime | null;
  onTimeOut: () => void;
  onHintRequest: () => void;
  hintsRemaining: number;
  aiThinking: boolean;
  aiThinkingDepth: number;
  aiThinkingNodes: number;
  evaluationHistory: EvaluationPoint[];
  currentMove: number;
  onGraphMoveClick: (moveNumber: number) => void;
  graphVisible: boolean;
  onToggleGraph: () => void;
  onNewGame: () => void;
  onSettings: () => void;
  onStats: () => void;
  onReplay: () => void;
  onPuzzles: () => void;
}

/**
 * Active match surface: board, sidebar, evaluation graph, and action bar.
 */
export const PlayArea: React.FC<PlayAreaProps> = ({
  onReset,
  displayBoard,
  analysisBoard,
  onPlayerTurn,
  lastMove,
  gameOver,
  hintMove,
  hintsEnabled,
  onHintMove,
  currentPlayer,
  blackScore,
  whiteScore,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  moves,
  message,
  timeRemaining,
  onTimeOut,
  onHintRequest,
  hintsRemaining,
  aiThinking,
  aiThinkingDepth,
  aiThinkingNodes,
  evaluationHistory,
  currentMove,
  onGraphMoveClick,
  graphVisible,
  onToggleGraph,
  onNewGame,
  onSettings,
  onStats,
  onReplay,
  onPuzzles,
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) onUndo();
      else onRedo();
    }
  };

  return (
    <div className="game-wrapper" id="play-area">
      <ErrorBoundary onReset={onReset}>
        <div className="game-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="board-area">
            <EvaluationBar evaluation={blackScore - whiteScore} currentPlayer={currentPlayer} />
            <Board
              board={displayBoard}
              onPlayerTurn={onPlayerTurn}
              lastMove={lastMove}
              gameOver={gameOver}
              hintMove={hintMove}
            />
          </div>

          <div className="sidebar-area">
            {hintsEnabled && !gameOver && (
              <PositionAnalysis
                board={analysisBoard}
                enabled={hintsEnabled}
                onHintMove={onHintMove}
                showPanel={true}
              />
            )}

            <Sidebar
              currentPlayer={currentPlayer}
              blackScore={blackScore}
              whiteScore={whiteScore}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              moves={moves}
              message={message}
              gameOver={gameOver}
              timeRemaining={timeRemaining}
              onTimeOut={onTimeOut}
              onHintRequest={onHintRequest}
              hintsRemaining={hintsRemaining}
              hintsEnabled={hintsEnabled}
              aiThinking={aiThinking}
              aiThinkingDepth={aiThinkingDepth}
              aiThinkingNodes={aiThinkingNodes}
            />

            <EvaluationGraph
              history={evaluationHistory}
              currentMove={currentMove}
              onMoveClick={onGraphMoveClick}
              isVisible={graphVisible}
              onToggle={onToggleGraph}
            />
          </div>
        </div>

        <GameActionBar
          onNewGame={onNewGame}
          onSettings={onSettings}
          onStats={onStats}
          onReplay={onReplay}
          onPuzzles={onPuzzles}
        />
      </ErrorBoundary>
    </div>
  );
};
