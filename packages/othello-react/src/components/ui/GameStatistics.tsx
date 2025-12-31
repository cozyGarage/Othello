import React, { useState, useEffect, useCallback } from 'react';
import {
  getAggregatedStats,
  clearGameRecords,
  formatDuration,
  formatDate,
  type AggregatedStats,
  type GameRecord,
} from '../../utils/gameStatistics';

/**
 * Props for the GameStatistics component
 */
interface GameStatisticsProps {
  /** Whether the statistics panel is visible */
  isVisible: boolean;
  /** Callback to close the panel */
  onClose?: () => void;
}

/**
 * GameStatistics - Display comprehensive game statistics
 *
 * Shows:
 * - Win/loss/draw record with win rate
 * - Performance breakdown by AI difficulty
 * - Average move time and game duration
 * - Recent game history
 * - Winning streaks
 *
 * @example
 * ```tsx
 * <GameStatistics
 *   isVisible={showStats}
 *   onClose={() => setShowStats(false)}
 * />
 * ```
 */
export const GameStatistics: React.FC<GameStatisticsProps> = ({ isVisible, onClose }) => {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  /**
   * Load statistics on mount and when visibility changes
   */
  const loadStats = useCallback(() => {
    const aggregated = getAggregatedStats();
    setStats(aggregated);
  }, []);

  useEffect(() => {
    if (isVisible) {
      loadStats();
    }
  }, [isVisible, loadStats]);

  /**
   * Handle clearing all statistics
   */
  const handleClearStats = () => {
    clearGameRecords();
    loadStats();
    setShowConfirmClear(false);
  };

  if (!isVisible) return null;

  /**
   * Render the result badge for a game record
   */
  const renderResultBadge = (record: GameRecord): React.ReactNode => {
    if (record.spectatorMode) {
      return <span className="result-badge spectator">AI vs AI</span>;
    }

    if (record.winner === null) {
      return <span className="result-badge draw">Draw</span>;
    }

    const humanWon = record.winner === record.humanPlayer;
    if (humanWon) {
      return <span className="result-badge win">Win</span>;
    } else {
      return <span className="result-badge loss">Loss</span>;
    }
  };

  /**
   * Calculate win rate for a difficulty level
   */
  const getDifficultyWinRate = (diff: { wins: number; losses: number; draws: number }): string => {
    const total = diff.wins + diff.losses + diff.draws;
    if (total === 0) return '-';
    return `${Math.round((diff.wins / total) * 100)}%`;
  };

  return (
    <div className="game-statistics-overlay" onClick={onClose}>
      <div className="game-statistics" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h3>📊 Game Statistics</h3>
          <button className="stats-close" onClick={onClose} aria-label="Close statistics">
            ×
          </button>
        </div>

        {stats && (
          <>
            {/* Overall Record */}
            <div className="stats-section">
              <h4>Overall Record</h4>
              <div className="stats-record">
                <div className="record-item wins">
                  <span className="record-value">{stats.wins}</span>
                  <span className="record-label">Wins</span>
                </div>
                <div className="record-item losses">
                  <span className="record-value">{stats.losses}</span>
                  <span className="record-label">Losses</span>
                </div>
                <div className="record-item draws">
                  <span className="record-value">{stats.draws}</span>
                  <span className="record-label">Draws</span>
                </div>
              </div>
              <div className="win-rate">
                <span className="win-rate-label">Win Rate:</span>
                <span className="win-rate-value">{stats.winRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Winning Streaks */}
            <div className="stats-section">
              <h4>🔥 Winning Streaks</h4>
              <div className="streaks">
                <div className="streak-item">
                  <span className="streak-label">Current Streak:</span>
                  <span className="streak-value">{stats.currentStreak}</span>
                </div>
                <div className="streak-item">
                  <span className="streak-label">Best Streak:</span>
                  <span className="streak-value">{stats.longestWinStreak}</span>
                </div>
              </div>
            </div>

            {/* Performance by Difficulty */}
            <div className="stats-section">
              <h4>Performance by AI Difficulty</h4>
              <div className="difficulty-stats">
                <div className="difficulty-row">
                  <span className="difficulty-name">🟢 Easy</span>
                  <span className="difficulty-record">
                    {stats.byDifficulty.easy.wins}W - {stats.byDifficulty.easy.losses}L -{' '}
                    {stats.byDifficulty.easy.draws}D
                  </span>
                  <span className="difficulty-rate">
                    {getDifficultyWinRate(stats.byDifficulty.easy)}
                  </span>
                </div>
                <div className="difficulty-row">
                  <span className="difficulty-name">🟡 Medium</span>
                  <span className="difficulty-record">
                    {stats.byDifficulty.medium.wins}W - {stats.byDifficulty.medium.losses}L -{' '}
                    {stats.byDifficulty.medium.draws}D
                  </span>
                  <span className="difficulty-rate">
                    {getDifficultyWinRate(stats.byDifficulty.medium)}
                  </span>
                </div>
                <div className="difficulty-row">
                  <span className="difficulty-name">🔴 Hard</span>
                  <span className="difficulty-record">
                    {stats.byDifficulty.hard.wins}W - {stats.byDifficulty.hard.losses}L -{' '}
                    {stats.byDifficulty.hard.draws}D
                  </span>
                  <span className="difficulty-rate">
                    {getDifficultyWinRate(stats.byDifficulty.hard)}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Statistics */}
            <div className="stats-section">
              <h4>⏱️ Time Statistics</h4>
              <div className="time-stats">
                <div className="time-stat">
                  <span className="time-label">Avg Move Time:</span>
                  <span className="time-value">
                    {stats.avgMoveTime > 0 ? formatDuration(stats.avgMoveTime) : '-'}
                  </span>
                </div>
                <div className="time-stat">
                  <span className="time-label">Avg Game Duration:</span>
                  <span className="time-value">
                    {stats.avgGameDuration > 0 ? formatDuration(stats.avgGameDuration) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="stats-section">
              <h4>Recent Games</h4>
              {stats.recentGames.length === 0 ? (
                <div className="no-games">No games recorded yet</div>
              ) : (
                <div className="recent-games-list">
                  {stats.recentGames.map((game) => (
                    <div key={game.id} className="recent-game-item">
                      <div className="game-info">
                        {renderResultBadge(game)}
                        <span className="game-score">
                          ⚫{game.finalScore.black} - ⚪{game.finalScore.white}
                        </span>
                        {game.aiDifficulty && (
                          <span className="game-difficulty">vs {game.aiDifficulty}</span>
                        )}
                        {game.endedByTimeout && <span className="timeout-badge">⏰</span>}
                      </div>
                      <span className="game-date">{formatDate(game.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Statistics */}
            <div className="stats-section stats-actions">
              {!showConfirmClear ? (
                <button className="clear-stats-btn" onClick={() => setShowConfirmClear(true)}>
                  🗑️ Clear Statistics
                </button>
              ) : (
                <div className="confirm-clear">
                  <span>Are you sure?</span>
                  <button className="confirm-yes" onClick={handleClearStats}>
                    Yes, Clear
                  </button>
                  <button className="confirm-no" onClick={() => setShowConfirmClear(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Total Games */}
            <div className="stats-footer">Total games recorded: {stats.totalGames}</div>
          </>
        )}

        {!stats && <div className="stats-loading">Loading statistics...</div>}
      </div>
    </div>
  );
};

export default GameStatistics;
