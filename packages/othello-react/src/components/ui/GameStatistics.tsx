import React, { useState, useEffect, useCallback } from 'react';
import {
  getAggregatedStats,
  getGameRecords,
  clearGameRecords,
  formatDuration,
  formatDate,
  type AggregatedStats,
  type GameRecord,
} from '../../utils/gameStatistics';

// ---------------------------------------------------------------------------
// Chart sub-components (pure SVG + CSS, no external libraries)
// ---------------------------------------------------------------------------

/**
 * WinRateSpark — SVG sparkline of cumulative win rate over the last 20 games.
 */
const WinRateSpark: React.FC<{ records: GameRecord[] }> = ({ records }) => {
  const humanGames = [...records]
    .filter((r) => !r.spectatorMode && r.humanPlayer !== null)
    .reverse()
    .slice(-20);

  if (humanGames.length < 2) {
    return <p className="chart-no-data">Play more games to see your trend</p>;
  }

  let wins = 0;
  const points = humanGames.map((record, idx) => {
    if (record.winner === record.humanPlayer) wins++;
    return { x: idx, y: (wins / (idx + 1)) * 100 };
  });

  const W = 300;
  const H = 80;
  const PAD = 6;

  const toX = (i: number) => PAD + (i / Math.max(points.length - 1, 1)) * (W - PAD * 2);
  const toY = (v: number) => H - PAD - (v / 100) * (H - PAD * 2);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ');
  const areaPath = linePath + ` L${toX(points.length - 1).toFixed(1)},${H} L${PAD},${H} Z`;
  const midY = toY(50).toFixed(1);
  const lastY = toY(points[points.length - 1]?.y ?? 50).toFixed(1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="win-rate-spark" aria-label="Win rate over time chart">
      <defs>
        <linearGradient id="wrGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-green)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-accent-green)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line x1={PAD} y1={midY} x2={W - PAD} y2={midY} className="chart-midline" />
      <path d={areaPath} fill="url(#wrGrad)" />
      <path d={linePath} className="chart-line" />
      <circle cx={toX(points.length - 1).toFixed(1)} cy={lastY} r="4" className="chart-dot" />
    </svg>
  );
};

/**
 * DiffBar — horizontal stacked W/D/L bar for one difficulty level.
 */
const DiffBar: React.FC<{ wins: number; losses: number; draws: number }> = ({
  wins,
  losses,
  draws,
}) => {
  const total = wins + losses + draws;
  if (total === 0) return <span className="diff-bar-empty">No games played</span>;

  const wPct = (wins / total) * 100;
  const dPct = (draws / total) * 100;
  const lPct = (losses / total) * 100;

  return (
    <div
      className="diff-bar-track"
      title={`${wins}W  ${draws}D  ${losses}L`}
      role="img"
      aria-label={`${wins} wins, ${draws} draws, ${losses} losses`}
    >
      {wPct > 0 && <div className="diff-bar-segment diff-bar-win" style={{ width: `${wPct}%` }} />}
      {dPct > 0 && <div className="diff-bar-segment diff-bar-draw" style={{ width: `${dPct}%` }} />}
      {lPct > 0 && <div className="diff-bar-segment diff-bar-loss" style={{ width: `${lPct}%` }} />}
    </div>
  );
};

/**
 * RecentResults — last 10 game outcomes as coloured W/L/D dots.
 */
const RecentResults: React.FC<{ records: GameRecord[] }> = ({ records }) => {
  const humanGames = records.filter((r) => !r.spectatorMode && r.humanPlayer !== null).slice(0, 10);

  if (humanGames.length === 0) return null;

  return (
    <div className="recent-results-track">
      {humanGames.map((record) => {
        const isDraw = record.winner === null;
        const humanWon = record.winner === record.humanPlayer;
        const cls = isDraw ? 'draw' : humanWon ? 'win' : 'loss';
        return (
          <div key={record.id} className={`result-dot ${cls}`} title={formatDate(record.timestamp)}>
            {isDraw ? 'D' : humanWon ? 'W' : 'L'}
          </div>
        );
      })}
    </div>
  );
};

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
  const [allRecords, setAllRecords] = useState<GameRecord[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');

  /**
   * Load statistics on mount and when visibility changes
   */
  const loadStats = useCallback(() => {
    setStats(getAggregatedStats());
    setAllRecords(getGameRecords());
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

            {/* Win Rate Trend */}
            <div className="stats-section">
              <h4>📈 Win Rate Trend</h4>
              <div className="win-rate-chart-wrap">
                <WinRateSpark records={allRecords} />
                <div className="chart-labels">
                  <span>Older</span>
                  <span>50%</span>
                  <span>Recent</span>
                </div>
              </div>
            </div>

            {/* Winning Streaks + Recent Form */}
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
              <div className="recent-form-label">Recent form (newest first):</div>
              <RecentResults records={allRecords} />
            </div>

            {/* Performance by Difficulty */}
            <div className="stats-section">
              <h4>Performance by AI Difficulty</h4>
              <div className="difficulty-stats">
                {(
                  [
                    { key: 'easy', label: '🟢 Easy' },
                    { key: 'medium', label: '🟡 Medium' },
                    { key: 'hard', label: '🔴 Hard' },
                  ] as const
                ).map(({ key, label }) => {
                  const d = stats.byDifficulty[key];
                  return (
                    <div key={key} className="difficulty-row-visual">
                      <span className="difficulty-name">{label}</span>
                      <div className="diff-bar-container">
                        <DiffBar wins={d.wins} losses={d.losses} draws={d.draws} />
                        <span className="diff-bar-sub">
                          {d.wins}W · {d.draws}D · {d.losses}L
                        </span>
                      </div>
                      <span className="difficulty-rate">{getDifficultyWinRate(d)}</span>
                    </div>
                  );
                })}
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
