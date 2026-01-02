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
  /** Callback to start replay of a game from history */
  onReplayGame?: (moves: Array<{ player: 'B' | 'W'; coordinate: [number, number] }>) => void;
  /** Current game's moves for replay */
  currentGameMoves?: unknown[];
  /** Callback to open current game replay */
  onOpenCurrentReplay?: () => void;
}

/** Available tabs in the Stats panel */
type StatsTab = 'overview' | 'history' | 'replays';

/**
 * GameStatistics - Comprehensive stats panel accessible from navbar
 *
 * Shows:
 * - Overview: Win/loss/draw record, win rate, streaks
 * - History: List of all played games with scores
 * - Replays: Current game replay + placeholder for famous games
 *
 * @example
 * ```tsx
 * <GameStatistics
 *   isVisible={showStats}
 *   onClose={() => setShowStats(false)}
 *   onOpenCurrentReplay={() => setReplayOpen(true)}
 * />
 * ```
 */
export const GameStatistics: React.FC<GameStatisticsProps> = ({
  isVisible,
  onClose,
  onReplayGame,
  currentGameMoves = [],
  onOpenCurrentReplay,
}) => {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');

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
      <div
        className="game-statistics stats-panel-large custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stats-header">
          <h3>📊 Stats & Replays</h3>
          <button className="stats-close" onClick={onClose} aria-label="Close statistics">
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="stats-tabs">
          <button
            className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`stats-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Game History
          </button>
          <button
            className={`stats-tab ${activeTab === 'replays' ? 'active' : ''}`}
            onClick={() => setActiveTab('replays')}
          >
            Replays
          </button>
        </div>

        {stats && activeTab === 'overview' && (
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

        {/* History Tab - All Games with Replay option */}
        {stats && activeTab === 'history' && (
          <div className="stats-section">
            <h4>All Games Played</h4>
            {stats.recentGames.length === 0 ? (
              <div className="no-games">
                No games recorded yet. Play some games to see your history!
              </div>
            ) : (
              <div className="all-games-list">
                {stats.recentGames.map((game) => (
                  <div key={game.id} className="game-history-item">
                    <div className="game-info-row">
                      {renderResultBadge(game)}
                      <span className="game-score">
                        ⚫{game.finalScore.black} - ⚪{game.finalScore.white}
                      </span>
                      {game.aiDifficulty && (
                        <span className="game-difficulty">vs {game.aiDifficulty} AI</span>
                      )}
                      {game.endedByTimeout && <span className="timeout-badge">⏰</span>}
                    </div>
                    <div className="game-meta-row">
                      <span className="game-date">{formatDate(game.timestamp)}</span>
                      <span className="game-moves">{game.totalMoves} moves</span>
                      {game.gameDuration > 0 && (
                        <span className="game-duration">{formatDuration(game.gameDuration)}</span>
                      )}
                      {/* Replay button - only show if game has moves saved */}
                      {game.moves && game.moves.length > 0 && onReplayGame && (
                        <button
                          className="history-replay-btn"
                          onClick={() => game.moves && onReplayGame(game.moves)}
                          title="Replay this game"
                        >
                          ▶️ Replay
                        </button>
                      )}
                      {(!game.moves || game.moves.length === 0) && (
                        <span
                          className="no-replay-available"
                          title="Moves not recorded for older games"
                        >
                          📝 No replay
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Replays Tab */}
        {activeTab === 'replays' && (
          <div className="stats-section">
            {/* Current Game Replay */}
            <div className="replay-section">
              <h4>📽️ Current Game</h4>
              {currentGameMoves.length > 0 ? (
                <div className="replay-card">
                  <p>Review your current game move by move</p>
                  <button className="replay-btn" onClick={onOpenCurrentReplay}>
                    ▶️ Open Replay
                  </button>
                </div>
              ) : (
                <div className="no-games">No moves in current game yet</div>
              )}
            </div>

            {/* Famous Games Placeholder */}
            <div className="replay-section">
              <h4>🏆 Famous Games</h4>
              <div className="coming-soon-card">
                <span className="coming-soon-icon">🎮</span>
                <p>Classic Othello games from tournaments and championships</p>
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
            </div>

            {/* Tournament Replays Placeholder */}
            <div className="replay-section">
              <h4>🎯 Tournament Replays</h4>
              <div className="coming-soon-card">
                <span className="coming-soon-icon">🏅</span>
                <p>Watch and learn from professional tournament matches</p>
                <span className="coming-soon-badge">Coming Soon</span>
              </div>
            </div>
          </div>
        )}

        {!stats && <div className="stats-loading">Loading statistics...</div>}
      </div>
    </div>
  );
};

export default GameStatistics;
