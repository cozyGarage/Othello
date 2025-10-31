import { Component } from 'react';
import Board from './Board';
import { LoadingScreen, SettingsPanel, MoveHistory, GameMenu } from './components/ui';
import { hasLoadingScreen, hasSoundEffects, hasMoveHistory } from './config/features';
import { soundEffects } from './utils/soundEffects';
import { 
  OthelloGameEngine,
  type Board as BoardType,
  type Coordinate,
  type GameEvent,
  type Move,
  B, W
} from 'othello-engine';

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

    // Simulate loading for better UX (show loading screen briefly)
    if (hasLoadingScreen()) {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 1500); // 1.5 second loading
    }

    // Initialize sound effects (resume audio context after user interaction)
    const initSound = () => {
      soundEffects.resume();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound, { once: true });

    // Sync sound effects with feature flag
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
    
    // Play flip sound
    if (hasSoundEffects()) {
      soundEffects.playFlip();
    }
    
    // Update move history
    const moveHistory = this.engine.getMoveHistory();
    this.setState({ lastMove: move.coordinate, moveHistory });
  }

  handleInvalidMoveEvent = (event: GameEvent): void => {
    const { error } = event.data;
    
    // Play error sound
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
    
    // Play game over sound
    if (hasSoundEffects()) {
      soundEffects.playGameOver();
    }
    
    this.setState({ gameOver: true, message });
  }

  handleStateChangeEvent = (event: GameEvent): void => {
    const state = event.data.state;
    
    // Update the board state
    this.setState({ board: state.board });
    
    // Check if current player has no valid moves (must pass)
    if (!state.isGameOver && state.validMoves.length === 0) {
      const playerName = state.currentPlayer === B ? 'Black' : 'White';
      // The engine has already switched turns, so the new player is in currentPlayer
      const nextPlayerName = state.currentPlayer === B ? 'Black' : 'White';
      this.setState({ 
        message: `${playerName} has no valid moves. ${nextPlayerName}'s turn!`
      });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
  }

  handlePlayerTurn = (coord: Coordinate): void => {
    if (this.state.gameOver) {
      return;
    }

    // Let the engine handle the move - it will emit events
    this.engine.makeMove(coord);
  }

  handleRestart = (): void => {
    // Reset the engine
    this.engine.reset();
    
    // Reset local state
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
        gameOver: false, // Undoing can bring back the game from game over state
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
    return (
      <div className="OthelloGame">
        <LoadingScreen isLoading={this.state.isLoading} />
        {!this.state.isLoading && (
          <>
            <GameMenu
              onNewGame={this.handleRestart}
              onOpenSettings={() => this.setState({ settingsOpen: true })}
              soundVolume={this.state.soundVolume}
              onVolumeChange={this.handleVolumeChange}
              soundEnabled={hasSoundEffects()}
            />
            <div className="game-layout">
              <div className="game-main">
                <Board 
                  board={this.engine.getAnnotatedBoard()} 
                  onPlayerTurn={this.handlePlayerTurn}
                  onUndo={this.handleUndo}
                  onRedo={this.handleRedo}
                  canUndo={this.engine.canUndo()}
                  canRedo={this.engine.canRedo()}
                  message={this.state.message}
                  gameOver={this.state.gameOver}
                  lastMove={this.state.lastMove}
                />
              </div>
              {hasMoveHistory() && (
                <div className="game-sidebar">
                  <MoveHistory 
                    moves={this.state.moveHistory} 
                    isVisible={true} 
                  />
                </div>
              )}
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
