import { Component } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import Board from './components/layout/Board';
import { LoadingScreen, SettingsPanel } from './components/ui';
import { hasLoadingScreen, hasSoundEffects } from './config/features';
import { soundEffects } from './utils/soundEffects';
import { 
  OthelloGameEngine,
  type Board as BoardType,
  type Coordinate,
  type GameEvent,
  type Move,
  B, W
} from 'othello-engine';

// Import new modular CSS
import './styles/variables.css';
import './styles/layout.css';
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
      soundVolume: soundEffects.getVolume()
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
  }

  handleMoveEvent = (event: GameEvent): void => {
    const { move } = event.data;
    
    if (hasSoundEffects()) {
      soundEffects.playFlip();
    }
    
    const moveHistory = this.engine.getMoveHistory();
    this.setState({ lastMove: move.coordinate, moveHistory });
  }

  handleInvalidMoveEvent = (event: GameEvent): void => {
    const { error } = event.data;
    
    if (hasSoundEffects()) {
      soundEffects.playInvalidMove();
    }
    
    this.setState({ message: error });
    setTimeout(() => this.setState({ message: null }), 2000);
  }

  handleGameOverEvent = (event: GameEvent): void => {
    const { winner } = event.data;
    let message: string;
    
    if (winner === B) {
      message = 'Game Over! Black wins!';
    } else if (winner === W) {
      message = 'Game Over! White wins!';
    } else {
      message = 'Game Over! It\'s a tie!';
    }
    
    if (hasSoundEffects()) {
      soundEffects.playGameOver();
    }
    
    this.setState({ gameOver: true, message });
  }

  handleStateChangeEvent = (event: GameEvent): void => {
    const state = event.data.state;
    this.setState({ board: state.board });
    
    // Check if current player has no valid moves
    if (!state.isGameOver && state.validMoves.length === 0) {
      const nextPlayerName = state.currentPlayer === B ? 'Black' : 'White';
      this.setState({ 
        message: `No valid moves. ${nextPlayerName}'s turn!`
      });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
  }

  handlePlayerTurn = (coord: Coordinate): void => {
    if (this.state.gameOver) {
      return;
    }
    this.engine.makeMove(coord);
  }

  handleRestart = (): void => {
    this.engine.reset();
    
    const initialState = this.engine.getState();
    this.setState({
      board: initialState.board,
      message: null,
      gameOver: false,
      lastMove: null,
      moveHistory: []
    });
  }

  handleUndo = (): void => {
    const success = this.engine.undo();
    
    if (success) {
      const state = this.engine.getState();
      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: state.moveHistory.length > 0 
          ? state.moveHistory[state.moveHistory.length - 1]!.coordinate 
          : null,
        gameOver: false,
        message: null
      });
    }
  }

  handleRedo = (): void => {
    const success = this.engine.redo();
    
    if (success) {
      const state = this.engine.getState();
      this.setState({
        board: state.board,
        moveHistory: state.moveHistory,
        lastMove: state.moveHistory.length > 0 
          ? state.moveHistory[state.moveHistory.length - 1]!.coordinate 
          : null,
        gameOver: state.isGameOver,
        message: state.isGameOver 
          ? (state.winner === B ? 'Game Over! Black wins!' : 
             state.winner === W ? 'Game Over! White wins!' : 
             'Game Over! It\'s a tie!') 
          : null
      });
    }
  }

  handleVolumeChange = (volume: number): void => {
    soundEffects.setVolume(volume);
    this.setState({ soundVolume: volume });
  }

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
            />
          </>
        )}
      </div>
    );
  }
}

export default OthelloGame;
