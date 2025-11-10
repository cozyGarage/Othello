import { Component } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import Board from './components/layout/Board';
import { LoadingScreen, SettingsPanel } from './components/ui';
import { hasLoadingScreen, hasSoundEffects } from './config/features';
import { soundEffects } from './utils/soundEffects';
import {
  OthelloGameEngine,
  OthelloBot,
  type Board as BoardType,
  type Coordinate,
  type GameEvent,
  type Move,
  type MoveEventData,
  type InvalidMoveEventData,
  type GameOverEventData,
  type StateChangeEventData,
  type BotDifficulty,
  B,
  W,
} from 'othello-engine';

// Import new modular CSS
import './styles/variables.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/navbar.css';
import './styles/board.css';
import './styles/sidebar.css';

interface OthelloGameState {
  board: BoardType;
  message: string | null;
  gameOver: boolean;
  lastMove: Coordinate | null;
  isLoading: boolean;
  moveHistory: Move[];
  settingsOpen: boolean;
  soundVolume: number;
  aiEnabled: boolean;
  aiDifficulty: BotDifficulty;
  aiPlayer: 'W' | 'B';
}

/**
 * OthelloGame - Clean Chess.com inspired layout
 *
 * Structure:
 * - Navbar (top)
 * - Game Container (grid: board + sidebar)
 *   - Board Area (left, 80vh)
 *   - Sidebar (right, fixed width)
 */
class OthelloGame extends Component<{}, OthelloGameState> {
  private engine: OthelloGameEngine;
  private bot: OthelloBot | null = null;
  private botMoveTimeout: number | null = null;

  constructor(props: {}) {
    super(props);

    // Initialize the game engine
    this.engine = new OthelloGameEngine();

    const initialState = this.engine.getState();
    this.state = {
      board: initialState.board,
      message: null,
      gameOver: false,
      lastMove: null,
      isLoading: hasLoadingScreen(),
      moveHistory: [],
      settingsOpen: false,
      soundVolume: soundEffects.getVolume(),
      aiEnabled: false,
      aiDifficulty: 'medium',
      aiPlayer: 'W',
    };
  }

  componentDidMount(): void {
    // Subscribe to engine events
    this.engine.on('move', this.handleMoveEvent);
    this.engine.on('invalidMove', this.handleInvalidMoveEvent);
    this.engine.on('gameOver', this.handleGameOverEvent);
    this.engine.on('stateChange', this.handleStateChangeEvent);

    // Add keyboard shortcuts for undo/redo
    document.addEventListener('keydown', this.handleKeyDown);

    // Simulate loading for better UX
    if (hasLoadingScreen()) {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 1500);
    }

    // Initialize sound effects
    const initSound = () => {
      soundEffects.resume();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound, { once: true });

    soundEffects.setEnabled(hasSoundEffects());
  }

  componentWillUnmount(): void {
    // Clean up event listeners
    this.engine.off('move', this.handleMoveEvent);
    this.engine.off('invalidMove', this.handleInvalidMoveEvent);
    this.engine.off('gameOver', this.handleGameOverEvent);
    this.engine.off('stateChange', this.handleStateChangeEvent);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Clean up bot timeout
    if (this.botMoveTimeout !== null) {
      clearTimeout(this.botMoveTimeout);
    }
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    // Ctrl+Z or Cmd+Z for undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.handleUndo();
    }

    // Ctrl+Y or Cmd+Shift+Z for redo
    if (
      ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
    ) {
      event.preventDefault();
      this.handleRedo();
    }
  };

  handleMoveEvent = (event: GameEvent): void => {
    const { move, state } = event.data as MoveEventData;

    if (hasSoundEffects()) {
      soundEffects.playFlip();
    }

    const moveHistory = this.engine.getMoveHistory();
    
    // Check if the turn stayed with the same player (opponent had to pass)
    const currentPlayer = state.currentPlayer;
    const previousPlayer = move.player;
    
    if (currentPlayer === previousPlayer) {
      // Opponent had no valid moves and had to pass
      const opponentName = currentPlayer === 'B' ? 'White' : 'Black';
      this.setState({ 
        lastMove: move.coordinate, 
        moveHistory,
        message: `${opponentName} has no valid moves and must pass!`,
      });
      setTimeout(() => this.setState({ message: null }), 2500);
    } else {
      this.setState({ lastMove: move.coordinate, moveHistory });
    }
  };

  handleInvalidMoveEvent = (event: GameEvent): void => {
    const { error } = event.data as InvalidMoveEventData;

    if (hasSoundEffects()) {
      soundEffects.playInvalidMove();
    }

    this.setState({ message: error });
    setTimeout(() => this.setState({ message: null }), 2000);
  };

  handleGameOverEvent = (event: GameEvent): void => {
    const { winner } = event.data as GameOverEventData;
    let message: string;

    if (winner === B) {
      message = 'Game Over! Black wins!';
    } else if (winner === W) {
      message = 'Game Over! White wins!';
    } else {
      message = "Game Over! It's a tie!";
    }

    if (hasSoundEffects()) {
      soundEffects.playGameOver();
    }

    this.setState({ gameOver: true, message });
  };

  handleStateChangeEvent = (event: GameEvent): void => {
    const { state } = event.data as StateChangeEventData;
    this.setState({ board: state.board });

    // Check if current player has no valid moves
    if (!state.isGameOver && state.validMoves.length === 0) {
      const nextPlayerName = state.currentPlayer === B ? 'Black' : 'White';
      this.setState({
        message: `No valid moves. ${nextPlayerName}'s turn!`,
      });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
    
    // Trigger AI move if it's the AI's turn
    this.checkAndMakeAIMove();
  };

  handlePlayerTurn = (coord: Coordinate): void => {
    if (this.state.gameOver) {
      return;
    }
    this.engine.makeMove(coord);
  };

  handleRestart = (): void => {
    this.engine.reset();

    const initialState = this.engine.getState();
    this.setState({
      board: initialState.board,
      message: null,
      gameOver: false,
      lastMove: null,
      moveHistory: [],
    });
    
    // Check if AI should make the first move
    setTimeout(() => this.checkAndMakeAIMove(), 500);
  };

  handleUndo = (): void => {
    const success = this.engine.undo();

    if (success) {
      const state = this.engine.getState();
      const lastMoveCoord = state.moveHistory.length > 0
        ? state.moveHistory[state.moveHistory.length - 1]?.coordinate ?? null
        : null;
        
      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: lastMoveCoord,
        gameOver: false,
        message: null,
      });
      
      // Check if AI should move after undo
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    }
  };

  handleRedo = (): void => {
    const success = this.engine.redo();

    if (success) {
      const state = this.engine.getState();
      const lastMoveCoord = state.moveHistory.length > 0
        ? state.moveHistory[state.moveHistory.length - 1]?.coordinate ?? null
        : null;
        
      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: lastMoveCoord,
        gameOver: state.isGameOver,
        message: state.isGameOver
          ? state.winner === B
            ? 'Game Over! Black wins!'
            : state.winner === W
              ? 'Game Over! White wins!'
              : "Game Over! It's a tie!"
          : null,
      });
      
      // Check if AI should move after redo
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    }
  };

  handleVolumeChange = (volume: number): void => {
    soundEffects.setVolume(volume);
    this.setState({ soundVolume: volume });
  };

  handleAiToggle = (enabled: boolean): void => {
    this.setState({ aiEnabled: enabled });
    
    if (enabled) {
      // Initialize bot with current settings
      this.bot = new OthelloBot(this.state.aiDifficulty, this.state.aiPlayer);
      
      // Check if AI should move immediately
      setTimeout(() => this.checkAndMakeAIMove(), 500);
    } else {
      // Clean up bot
      this.bot = null;
      if (this.botMoveTimeout !== null) {
        clearTimeout(this.botMoveTimeout);
        this.botMoveTimeout = null;
      }
    }
  };

  handleAiDifficultyChange = (difficulty: BotDifficulty): void => {
    this.setState({ aiDifficulty: difficulty });
    
    // Update bot if it exists
    if (this.bot) {
      this.bot.setDifficulty(difficulty);
    }
  };

  handleAiPlayerChange = (player: 'W' | 'B'): void => {
    this.setState({ aiPlayer: player });
    
    // Update bot if it exists
    if (this.bot) {
      this.bot.setPlayer(player);
    }
    
    // Check if AI should move immediately
    setTimeout(() => this.checkAndMakeAIMove(), 500);
  };

  checkAndMakeAIMove = (): void => {
    const { aiEnabled, aiPlayer, gameOver } = this.state;
    
    // Don't make AI move if:
    // - AI is disabled
    // - Game is over
    // - It's not the AI's turn
    if (!aiEnabled || gameOver || !this.bot) {
      return;
    }
    
    const state = this.engine.getState();
    
    if (state.currentPlayer !== aiPlayer) {
      return;
    }
    
    // Add a small delay for better UX (makes AI feel more natural)
    this.botMoveTimeout = window.setTimeout(() => {
      const move = this.bot?.calculateMove(state.board);
      
      if (move) {
        this.engine.makeMove(move);
      }
    }, 800); // 800ms delay makes it feel like the AI is "thinking"
  };

  render() {
    const state = this.engine.getState();
    const currentPlayer = state.currentPlayer === B ? 'black' : 'white';
    const blackScore = state.score.black;
    const whiteScore = state.score.white;

    return (
      <div className="OthelloGame">
        <LoadingScreen isLoading={this.state.isLoading} />

        {!this.state.isLoading && (
          <>
            <Navbar onPlayClick={this.handleRestart} />

            <div className="game-container">
              <div className="board-area">
                <Board
                  board={this.engine.getAnnotatedBoard()}
                  onPlayerTurn={this.handlePlayerTurn}
                  lastMove={this.state.lastMove}
                  gameOver={this.state.gameOver}
                />
              </div>

              <div className="sidebar-area">
                <Sidebar
                  currentPlayer={currentPlayer}
                  blackScore={blackScore}
                  whiteScore={whiteScore}
                  onUndo={this.handleUndo}
                  onRedo={this.handleRedo}
                  onNewGame={this.handleRestart}
                  onOpenMenu={() => this.setState({ settingsOpen: true })}
                  canUndo={this.engine.canUndo()}
                  canRedo={this.engine.canRedo()}
                  moves={this.state.moveHistory}
                  message={this.state.message}
                  gameOver={this.state.gameOver}
                />
              </div>
            </div>

            <SettingsPanel
              isOpen={this.state.settingsOpen}
              onClose={() => this.setState({ settingsOpen: false })}
              aiEnabled={this.state.aiEnabled}
              aiDifficulty={this.state.aiDifficulty}
              aiPlayer={this.state.aiPlayer}
              onAiToggle={this.handleAiToggle}
              onAiDifficultyChange={this.handleAiDifficultyChange}
              onAiPlayerChange={this.handleAiPlayerChange}
            />
          </>
        )}
      </div>
    );
  }
}

export default OthelloGame;
