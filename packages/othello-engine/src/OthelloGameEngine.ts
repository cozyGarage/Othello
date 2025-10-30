import {
  Board,
  Coordinate,
  TileValue,
  Score,
  createBoard,
  takeTurn,
  getValidMoves,
  isGameOver,
  getWinner,
  score,
  getAnnotatedBoard,
  B,
  W,
  E
} from './index';

/**
 * Represents a single move in the game
 */
export interface Move {
  player: 'W' | 'B';
  coordinate: Coordinate;
  timestamp: number;
  scoreAfter: Score;
}

/**
 * Represents the current state of the game
 */
export interface GameState {
  board: Board;
  score: Score;
  validMoves: Coordinate[];
  isGameOver: boolean;
  winner: 'W' | 'B' | null;
  moveHistory: Move[];
  currentPlayer: 'W' | 'B';
  blackPlayerId?: string;
  whitePlayerId?: string;
}

/**
 * Event types that the engine can emit
 */
export type GameEventType = 
  | 'move'
  | 'gameOver'
  | 'invalidMove'
  | 'stateChange';

export interface GameEvent {
  type: GameEventType;
  data: any;
}

type EventListener = (event: GameEvent) => void;

/**
 * OthelloGameEngine - A framework-agnostic game engine for Othello
 * 
 * This class manages the complete game state, handles move validation,
 * tracks history, and provides an event-based API for UI integration.
 * 
 * Usage:
 * ```typescript
 * const engine = new OthelloGameEngine();
 * engine.on('stateChange', (event) => {
 *   // Update your UI based on event.data.state
 * });
 * engine.makeMove([3, 2]);
 * ```
 */
export class OthelloGameEngine {
  private board: Board;
  private moveHistory: Move[] = [];
  private listeners: Map<GameEventType, EventListener[]> = new Map();
  private blackPlayerId?: string;
  private whitePlayerId?: string;

  /**
   * Creates a new Othello game engine
   * @param blackPlayerId - Optional ID for the black player
   * @param whitePlayerId - Optional ID for the white player
   * @param initialBoard - Optional initial board state (for loading saved games)
   */
  constructor(
    blackPlayerId?: string,
    whitePlayerId?: string,
    initialBoard?: TileValue[][]
  ) {
    this.blackPlayerId = blackPlayerId;
    this.whitePlayerId = whitePlayerId;
    
    // Initialize with standard Othello starting position
    const startingBoard = initialBoard || [
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ];
    
    this.board = createBoard(startingBoard);
  }

  /**
   * Subscribe to game events
   * @param eventType - The type of event to listen for
   * @param listener - Callback function to handle the event
   */
  public on(eventType: GameEventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  /**
   * Unsubscribe from game events
   * @param eventType - The type of event to stop listening for
   * @param listener - The callback function to remove
   */
  public off(eventType: GameEventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(eventType: GameEventType, data: any): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener({ type: eventType, data }));
    }
  }

  /**
   * Make a move on the board
   * @param coordinate - The [x, y] coordinate to place a piece
   * @returns true if the move was successful, false otherwise
   */
  public makeMove(coordinate: Coordinate): boolean {
    try {
      const currentPlayer = this.board.playerTurn;
      
      // Attempt the move
      takeTurn(this.board, coordinate);
      
      // Record the move in history
      const move: Move = {
        player: currentPlayer,
        coordinate,
        timestamp: Date.now(),
        scoreAfter: score(this.board)
      };
      this.moveHistory.push(move);
      
      // Emit events
      this.emit('move', { move, state: this.getState() });
      this.emit('stateChange', { state: this.getState() });
      
      // Check if game is over
      if (isGameOver(this.board)) {
        const winner = getWinner(this.board);
        this.emit('gameOver', { winner, state: this.getState() });
      }
      
      return true;
    } catch (error) {
      this.emit('invalidMove', { coordinate, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Get the current game state
   * @returns Complete game state including board, score, history, etc.
   */
  public getState(): GameState {
    return {
      board: this.board,
      score: score(this.board),
      validMoves: getValidMoves(this.board),
      isGameOver: isGameOver(this.board),
      winner: isGameOver(this.board) ? getWinner(this.board) : null,
      moveHistory: [...this.moveHistory],
      currentPlayer: this.board.playerTurn,
      blackPlayerId: this.blackPlayerId,
      whitePlayerId: this.whitePlayerId
    };
  }

  /**
   * Get the board with valid moves annotated
   * @returns Board with 'P' markers showing valid moves
   */
  public getAnnotatedBoard(): Board {
    return getAnnotatedBoard(this.board);
  }

  /**
   * Get the move history
   * @returns Array of all moves made in the game
   */
  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get the current score
   * @returns Current score for both players
   */
  public getScore(): Score {
    return score(this.board);
  }

  /**
   * Get all valid moves for the current player
   * @returns Array of valid coordinates
   */
  public getValidMoves(): Coordinate[] {
    return getValidMoves(this.board);
  }

  /**
   * Check if the game is over
   * @returns true if the game has ended
   */
  public isGameOver(): boolean {
    return isGameOver(this.board);
  }

  /**
   * Get the winner (only valid if game is over)
   * @returns 'W', 'B', or null for a tie
   */
  public getWinner(): 'W' | 'B' | null {
    return isGameOver(this.board) ? getWinner(this.board) : null;
  }

  /**
   * Reset the game to its initial state
   */
  public reset(): void {
    const startingBoard = [
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ];
    
    this.board = createBoard(startingBoard);
    this.moveHistory = [];
    
    this.emit('stateChange', { state: this.getState() });
  }

  /**
   * Get the player ID for a given color
   * @param color - 'W' or 'B'
   * @returns The player ID, or undefined if not set
   */
  public getPlayerId(color: 'W' | 'B'): string | undefined {
    return color === 'B' ? this.blackPlayerId : this.whitePlayerId;
  }

  /**
   * Export the game state as JSON (for saving/loading)
   * @returns JSON string of the complete game state
   */
  public exportState(): string {
    return JSON.stringify({
      board: this.board,
      moveHistory: this.moveHistory,
      blackPlayerId: this.blackPlayerId,
      whitePlayerId: this.whitePlayerId
    });
  }

  /**
   * Import a saved game state
   * @param stateJson - JSON string from exportState()
   */
  public importState(stateJson: string): void {
    const state = JSON.parse(stateJson);
    this.board = state.board;
    this.moveHistory = state.moveHistory;
    this.blackPlayerId = state.blackPlayerId;
    this.whitePlayerId = state.whitePlayerId;
    
    this.emit('stateChange', { state: this.getState() });
  }
}
