import React, { useState, useEffect } from 'react';
import { OthelloGameEngine, type Coordinate, type TileValue } from 'othello-engine';
import Board from '../layout/Board';
import puzzlesData from '../../data/puzzles.json';
import '../../styles/puzzles.css';

/**
 * Puzzle data structure
 */
interface Puzzle {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  currentPlayer: 'B' | 'W';
  board: TileValue[][];
  bestMove: Coordinate;
  explanation: string;
}

/**
 * Player's solve record for a puzzle
 */
interface PuzzleSolveRecord {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  solvedAt?: number;
}

/**
 * Props for the Puzzles component
 */
interface PuzzlesProps {
  isVisible: boolean;
  onClose?: () => void;
}

/**
 * Puzzles - Interactive puzzle system for learning Othello strategy
 *
 * Features:
 * - Curated tactical puzzles with difficulty levels
 * - Real-time feedback on move correctness
 * - Progress tracking per puzzle
 * - Strategic explanations for best moves
 * - Difficulty filter
 *
 * @example
 * ```tsx
 * <Puzzles
 *   isVisible={showPuzzles}
 *   onClose={() => setShowPuzzles(false)}
 * />
 * ```
 */
export const Puzzles: React.FC<PuzzlesProps> = ({ isVisible, onClose }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [puzzles] = useState<Puzzle[]>(puzzlesData.puzzles as Puzzle[]);
  const [solveRecords, setSolveRecords] = useState<PuzzleSolveRecord[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>(
    'all'
  );
  const [engine, setEngine] = useState<OthelloGameEngine | null>(null);
  const [userAttempts, setUserAttempts] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'error'>('info');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  /**
   * Load solve records from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem('puzzle-solve-records');
    if (saved) {
      try {
        setSolveRecords(JSON.parse(saved));
      } catch {
        setSolveRecords([]);
      }
    }
  }, []);

  /**
   * Initialize puzzle board state
   */
  useEffect(() => {
    if (puzzles.length === 0) return;

    const puzzle = puzzles[currentPuzzleIndex];
    if (!puzzle) return;

    // Create a new engine with the puzzle's board state
    const newEngine = new OthelloGameEngine(
      'puzzle-player-black',
      'puzzle-player-white',
      puzzle.board
    );

    setEngine(newEngine);
    setUserAttempts(0);
    setFeedbackMessage('Find the best move!');
    setFeedbackType('info');
    setShowExplanation(false);
  }, [currentPuzzleIndex, puzzles]);

  /**
   * Get currently displayed puzzle
   */
  const getCurrentPuzzle = (): Puzzle | null => {
    return puzzles[currentPuzzleIndex] ?? null;
  };

  /**
   * Get filtered puzzles based on difficulty
   */
  const getFilteredPuzzles = (): Puzzle[] => {
    if (selectedDifficulty === 'all') return puzzles;
    return puzzles.filter((p) => p.difficulty === selectedDifficulty);
  };

  /**
   * Get solve record for current puzzle
   */
  const getCurrentRecord = (): PuzzleSolveRecord | undefined => {
    const puzzle = getCurrentPuzzle();
    if (!puzzle) return undefined;
    return solveRecords.find((r) => r.puzzleId === puzzle.id);
  };

  /**
   * Save solve record to localStorage
   */
  const saveSolveRecord = (record: PuzzleSolveRecord): void => {
    const updated = solveRecords.filter((r) => r.puzzleId !== record.puzzleId);
    updated.push(record);
    setSolveRecords(updated);
    localStorage.setItem('puzzle-solve-records', JSON.stringify(updated));
  };

  /**
   * Calculate solve rate for difficulty
   */
  const getSolveRate = (difficulty: string): string => {
    const filtered = puzzles.filter((p) => p.difficulty === difficulty);
    if (filtered.length === 0) return '-';
    const solved = filtered.filter((p) =>
      solveRecords.some((r) => r.puzzleId === p.id && r.solved)
    );
    return `${solved.length}/${filtered.length}`;
  };

  /**
   * Handle player move attempt
   */
  const handlePuzzleMove = (coord: Coordinate): void => {
    if (!engine) return;

    const puzzle = getCurrentPuzzle();
    if (!puzzle) return;

    const newAttempts = userAttempts + 1;
    setUserAttempts(newAttempts);

    // Check if move matches best move
    const isBestMove = coord[0] === puzzle.bestMove[0] && coord[1] === puzzle.bestMove[1];

    if (isBestMove) {
      setFeedbackMessage('✓ Correct! You found the best move!');
      setFeedbackType('success');

      // Save solve record
      const solveRecord: PuzzleSolveRecord = {
        puzzleId: puzzle.id,
        solved: true,
        attempts: newAttempts,
        solvedAt: Date.now(),
      };
      saveSolveRecord(solveRecord);

      // Show explanation
      setShowExplanation(true);
    } else {
      // Check if move is at least legal
      const board = engine.getAnnotatedBoard();
      const tile = board.tiles[coord[1]]?.[coord[0]];

      if (tile === 'P') {
        setFeedbackMessage(
          `Try again! This move is legal but not the best. (Attempt ${newAttempts})`
        );
        setFeedbackType('error');
      } else {
        setFeedbackMessage('Invalid move! Try another position.');
        setFeedbackType('error');
      }
    }
  };

  /**
   * Move to next puzzle
   */
  const handleNextPuzzle = (): void => {
    const filtered = getFilteredPuzzles();
    const currentPuzzle = getCurrentPuzzle();
    if (!currentPuzzle) return;

    const currentIdx = filtered.findIndex((p) => p.id === currentPuzzle.id);
    const nextPuzzle = filtered[currentIdx + 1];
    if (nextPuzzle) {
      const fullIdx = puzzles.findIndex((p) => p.id === nextPuzzle.id);
      setCurrentPuzzleIndex(fullIdx);
    }
  };

  /**
   * Move to previous puzzle
   */
  const handlePrevPuzzle = (): void => {
    const filtered = getFilteredPuzzles();
    const currentPuzzle = getCurrentPuzzle();
    if (!currentPuzzle) return;

    const currentIdx = filtered.findIndex((p) => p.id === currentPuzzle.id);
    const prevPuzzle = filtered[currentIdx - 1];
    if (prevPuzzle) {
      const fullIdx = puzzles.findIndex((p) => p.id === prevPuzzle.id);
      setCurrentPuzzleIndex(fullIdx);
    }
  };

  /**
   * Jump to puzzle by index in filtered list
   */
  const handleJumpToPuzzle = (index: number): void => {
    const filtered = getFilteredPuzzles();
    const targetPuzzle = filtered[index];
    if (targetPuzzle) {
      const fullIdx = puzzles.findIndex((p) => p.id === targetPuzzle.id);
      setCurrentPuzzleIndex(fullIdx);
    }
  };

  /**
   * Show the best move (hint)
   */
  const handleShowHint = (): void => {
    const puzzle = getCurrentPuzzle();
    if (!puzzle) return;
    setFeedbackMessage(`The best move is ${formatCoordinate(puzzle.bestMove)}. Try it!`);
    setFeedbackType('info');
  };

  /**
   * Format coordinate to algebraic notation
   */
  const formatCoordinate = (coord: Coordinate): string => {
    const [x, y] = coord;
    const column = String.fromCharCode(97 + x); // a-h
    const rowNum = 8 - y; // 8-1
    return `${column}${rowNum}`;
  };

  if (!isVisible) return null;

  if (puzzles.length === 0) {
    return (
      <div className="puzzles-overlay" onClick={onClose}>
        <div className="puzzles-panel" onClick={(e) => e.stopPropagation()}>
          <div className="puzzles-header">
            <h3>🧩 Puzzles</h3>
            <button className="puzzles-close" onClick={onClose} aria-label="Close puzzles">
              ×
            </button>
          </div>
          <p>No puzzles available.</p>
        </div>
      </div>
    );
  }

  const filtered = getFilteredPuzzles();
  const puzzle = getCurrentPuzzle();
  const record = getCurrentRecord();
  const currentFilteredIdx = puzzle ? filtered.findIndex((p) => p.id === puzzle.id) : -1;

  return (
    <div className="puzzles-overlay" onClick={onClose}>
      <div className="puzzles-panel custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="puzzles-header">
          <h3>🧩 Puzzles & Tactics</h3>
          <button className="puzzles-close" onClick={onClose} aria-label="Close puzzles">
            ×
          </button>
        </div>

        {/* Difficulty Filter */}
        <div className="difficulty-filter">
          {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              className={`difficulty-btn ${selectedDifficulty === diff ? 'active' : ''}`}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentPuzzleIndex(0);
              }}
            >
              {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              {diff !== 'all' && ` (${getSolveRate(diff)})`}
            </button>
          ))}
        </div>

        {/* Puzzle Content */}
        {puzzle && (
          <div className="puzzle-content">
            {/* Puzzle Info */}
            <div className="puzzle-info">
              <h4>{puzzle.description}</h4>
              <div className="puzzle-meta">
                <span className={`difficulty-badge ${puzzle.difficulty}`}>
                  {puzzle.difficulty.toUpperCase()}
                </span>
                <span className="puzzle-progress">
                  {currentFilteredIdx + 1} / {filtered.length}
                </span>
                {record?.solved && <span className="solved-badge">✓ Solved</span>}
              </div>
            </div>

            {/* Board Preview */}
            {engine && (
              <div className="puzzle-board-container">
                <Board
                  board={engine.getAnnotatedBoard()}
                  onPlayerTurn={handlePuzzleMove}
                  lastMove={null}
                  gameOver={false}
                />
              </div>
            )}

            {/* Feedback */}
            <div className={`puzzle-feedback ${feedbackType}`}>{feedbackMessage}</div>

            {/* Buttons */}
            <div className="puzzle-buttons">
              <button className="puzzle-btn secondary" onClick={handleShowHint}>
                💡 Hint
              </button>
              <button
                className="puzzle-btn secondary"
                onClick={() => {
                  setShowExplanation(!showExplanation);
                }}
              >
                📖 {showExplanation ? 'Hide' : 'Show'} Explanation
              </button>
            </div>

            {/* Explanation */}
            {showExplanation && <div className="puzzle-explanation">{puzzle.explanation}</div>}

            {/* Navigation */}
            <div className="puzzle-navigation">
              <button
                className="nav-btn"
                onClick={handlePrevPuzzle}
                disabled={currentFilteredIdx === 0}
              >
                ← Previous
              </button>
              <button
                className="nav-btn"
                onClick={handleNextPuzzle}
                disabled={currentFilteredIdx === filtered.length - 1}
              >
                Next →
              </button>
            </div>

            {/* Quick Jump */}
            <div className="puzzle-quickjump">
              {filtered.map((p, idx) => (
                <button
                  key={p.id}
                  className={`jump-btn ${p.id === puzzle.id ? 'active' : ''} ${solveRecords.some((r) => r.puzzleId === p.id && r.solved) ? 'solved' : ''}`}
                  onClick={() => handleJumpToPuzzle(idx)}
                  title={p.description}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Puzzles;
