import type { Coordinate, Move } from 'othello-engine';

export interface MoveAnnouncement {
  timedMessage: string | null;
  timedMessageMs: number;
  srAnnouncement: string;
}

/**
 * Build pass / turn messaging for a completed move.
 */
export function buildMoveAnnouncement(
  move: Pick<Move, 'player' | 'coordinate'>,
  opts: {
    passedOpponent: boolean;
    currentPlayer: 'B' | 'W';
    score: { black: number; white: number };
  }
): MoveAnnouncement {
  const [col, row] = move.coordinate as Coordinate;
  const colLabel = String.fromCharCode(97 + col);
  const rowLabel = 8 - row;
  const playerName = move.player === 'B' ? 'Black' : 'White';
  const { score } = opts;
  const scoreText = `Score: Black ${score.black}, White ${score.white}.`;

  if (opts.passedOpponent) {
    const opponentName = opts.currentPlayer === 'B' ? 'White' : 'Black';
    return {
      timedMessage: `${opponentName} has no valid moves and must pass!`,
      timedMessageMs: 2500,
      srAnnouncement: `${playerName} played ${colLabel}${rowLabel}. ${opponentName} must pass. ${scoreText}`,
    };
  }

  const nextPlayer = opts.currentPlayer === 'B' ? 'Black' : 'White';
  return {
    timedMessage: null,
    timedMessageMs: 0,
    srAnnouncement: `${playerName} played ${colLabel}${rowLabel}. ${nextPlayer}'s turn. ${scoreText}`,
  };
}

/**
 * Message shown after redo when the restored position is terminal.
 */
export function buildGameOverMessage(winner: 'B' | 'W' | null): string {
  if (winner === 'B') return 'Game Over! Black wins!';
  if (winner === 'W') return 'Game Over! White wins!';
  return "Game Over! It's a tie!";
}
