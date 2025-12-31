/**
 * Game Statistics Manager
 *
 * Tracks and persists game statistics including:
 * - Win/loss/draw record
 * - Average move time
 * - Games played count
 * - AI difficulty breakdown
 *
 * Uses localStorage for persistence with the 'othello:' namespace
 */

/**
 * Statistics for a single game
 */
export interface GameRecord {
  /** Unique game ID */
  id: string;
  /** Game timestamp */
  timestamp: number;
  /** Winner: 'B', 'W', or null for draw */
  winner: 'B' | 'W' | null;
  /** Human player color (if vs AI) */
  humanPlayer: 'B' | 'W' | null;
  /** AI difficulty (if vs AI) */
  aiDifficulty: 'easy' | 'medium' | 'hard' | null;
  /** Was this a spectator (AI vs AI) game */
  spectatorMode: boolean;
  /** Final score */
  finalScore: { black: number; white: number };
  /** Total moves in the game */
  totalMoves: number;
  /** Average time per move (milliseconds) */
  avgMoveTime: number;
  /** Total game duration (milliseconds) */
  gameDuration: number;
  /** Whether time control was enabled */
  timeControlEnabled: boolean;
  /** Whether the game ended by timeout */
  endedByTimeout: boolean;
  /** Move history for replay (optional for backward compatibility) */
  moves?: Array<{ player: 'B' | 'W'; coordinate: [number, number] }>;
}

/**
 * Aggregated statistics
 */
export interface AggregatedStats {
  /** Total games played */
  totalGames: number;
  /** Games won by human */
  wins: number;
  /** Games lost by human */
  losses: number;
  /** Games drawn */
  draws: number;
  /** Win rate percentage */
  winRate: number;
  /** Average move time across all games */
  avgMoveTime: number;
  /** Average game duration */
  avgGameDuration: number;
  /** Breakdown by AI difficulty */
  byDifficulty: {
    easy: { wins: number; losses: number; draws: number };
    medium: { wins: number; losses: number; draws: number };
    hard: { wins: number; losses: number; draws: number };
  };
  /** Recent games (last 10) */
  recentGames: GameRecord[];
  /** Longest winning streak */
  longestWinStreak: number;
  /** Current winning streak */
  currentStreak: number;
}

/** localStorage key for game records */
const STATS_KEY = 'othello:gameStats';

/** Maximum number of game records to keep */
const MAX_RECORDS = 100;

/**
 * Generate a unique game ID
 */
const generateGameId = (): string => {
  return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get all stored game records
 */
export const getGameRecords = (): GameRecord[] => {
  try {
    // eslint-disable-next-line no-undef
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return [];
    const records = JSON.parse(stored) as GameRecord[];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
};

/**
 * Save a game record
 */
export const saveGameRecord = (record: Omit<GameRecord, 'id' | 'timestamp'>): void => {
  try {
    const records = getGameRecords();
    const newRecord: GameRecord = {
      ...record,
      id: generateGameId(),
      timestamp: Date.now(),
    };

    // Add new record and keep only the most recent
    records.unshift(newRecord);
    if (records.length > MAX_RECORDS) {
      records.splice(MAX_RECORDS);
    }

    // eslint-disable-next-line no-undef
    localStorage.setItem(STATS_KEY, JSON.stringify(records));
  } catch {
    // localStorage might be full or unavailable
    console.warn('Failed to save game record');
  }
};

/**
 * Clear all game records
 */
export const clearGameRecords = (): void => {
  try {
    // eslint-disable-next-line no-undef
    localStorage.removeItem(STATS_KEY);
  } catch {
    // Ignore errors
  }
};

/**
 * Calculate aggregated statistics from game records
 */
export const getAggregatedStats = (): AggregatedStats => {
  const records = getGameRecords();

  // Filter out spectator games for win/loss calculation
  const humanGames = records.filter((r) => !r.spectatorMode && r.humanPlayer !== null);

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalMoveTime = 0;
  let totalDuration = 0;
  let gamesWithMoveTime = 0;
  let gamesWithDuration = 0;

  const byDifficulty = {
    easy: { wins: 0, losses: 0, draws: 0 },
    medium: { wins: 0, losses: 0, draws: 0 },
    hard: { wins: 0, losses: 0, draws: 0 },
  };

  // Calculate winning streaks
  let currentStreak = 0;
  let longestWinStreak = 0;
  let tempStreak = 0;

  for (const record of humanGames) {
    const humanWon = record.winner === record.humanPlayer;
    const isDraw = record.winner === null;

    if (isDraw) {
      draws++;
      tempStreak = 0;
    } else if (humanWon) {
      wins++;
      tempStreak++;
      if (tempStreak > longestWinStreak) {
        longestWinStreak = tempStreak;
      }
    } else {
      losses++;
      tempStreak = 0;
    }

    // Track by AI difficulty
    if (record.aiDifficulty) {
      const diffStats = byDifficulty[record.aiDifficulty];
      if (isDraw) {
        diffStats.draws++;
      } else if (humanWon) {
        diffStats.wins++;
      } else {
        diffStats.losses++;
      }
    }

    // Aggregate time stats
    if (record.avgMoveTime > 0) {
      totalMoveTime += record.avgMoveTime;
      gamesWithMoveTime++;
    }
    if (record.gameDuration > 0) {
      totalDuration += record.gameDuration;
      gamesWithDuration++;
    }
  }

  // Calculate current streak (from most recent games)
  currentStreak = 0;
  for (const record of humanGames) {
    const humanWon = record.winner === record.humanPlayer;
    if (humanWon) {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalGames = humanGames.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const avgMoveTime = gamesWithMoveTime > 0 ? totalMoveTime / gamesWithMoveTime : 0;
  const avgGameDuration = gamesWithDuration > 0 ? totalDuration / gamesWithDuration : 0;

  return {
    totalGames,
    wins,
    losses,
    draws,
    winRate,
    avgMoveTime,
    avgGameDuration,
    byDifficulty,
    recentGames: records.slice(0, 10),
    longestWinStreak,
    currentStreak,
  };
};

/**
 * Format milliseconds to a readable duration string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

/**
 * Format a date to a readable string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
