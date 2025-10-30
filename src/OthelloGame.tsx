import { Component } from 'react';
import Board from './Board';
import { LoadingScreen } from './components/ui';
import { hasLoadingScreen } from './config/features';
import { 
  W, B, E, 
  getAnnotatedBoard, 
  takeTurn, 
  createBoard, 
  getValidMoves, 
  isGameOver, 
  getWinner,
  type Board as BoardType,
  type Coordinate
} from './game-logic';

interface OthelloGameState {
  board: BoardType;
  message: string | null;
  gameOver: boolean;
  lastMove: Coordinate | null;
  isLoading: boolean;
}

class OthelloGame extends Component<{}, OthelloGameState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      board: this.createInitialBoard(),
      message: null,
      gameOver: false,
      lastMove: null,
      isLoading: hasLoadingScreen()
    };
  }

  componentDidMount(): void {
    // Simulate loading for better UX (show loading screen briefly)
    if (hasLoadingScreen()) {
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 1500); // 1.5 second loading
    }
  }

  createInitialBoard(): BoardType {
    return createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E]
    ]);
  }

  handlePlayerTurn = (coord: Coordinate): void => {
    if (this.state.gameOver) {
      return;
    }

    try {
      takeTurn(this.state.board, coord);
      this.setState({ lastMove: coord }, () => {
        this.checkGameState();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      this.setState({ message });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
  }

  checkGameState = (): void => {
    const board = this.state.board;
    
    // Check if game is over
    if (isGameOver(board)) {
      const winner = getWinner(board);
      let message: string;
      if (winner === B) {
        message = 'Game Over! Black wins!';
      } else if (winner === W) {
        message = 'Game Over! White wins!';
      } else {
        message = 'Game Over! It\'s a tie!';
      }
      this.setState({ gameOver: true, message, board });
      return;
    }

    // Check if current player has no valid moves (must pass)
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) {
      const playerName = board.playerTurn === B ? 'Black' : 'White';
      board.playerTurn = board.playerTurn === B ? W : B;
      const newPlayerName = board.playerTurn === B ? 'Black' : 'White';
      this.setState({ 
        message: `${playerName} has no valid moves. ${newPlayerName}'s turn!`,
        board
      });
      setTimeout(() => this.setState({ message: null }), 2000);
      
      // Check again if the other player also has no moves
      if (getValidMoves(board).length === 0) {
        this.checkGameState();
      }
    } else {
      this.setState({ board });
    }
  }

  handleRestart = (): void => {
    this.setState({
      board: this.createInitialBoard(),
      message: null,
      gameOver: false,
      lastMove: null
    });
  }

  render() {
    return (
      <div className="OthelloGame">
        <LoadingScreen isLoading={this.state.isLoading} />
        {!this.state.isLoading && (
          <Board 
            board={getAnnotatedBoard(this.state.board)} 
            onPlayerTurn={this.handlePlayerTurn}
            onRestart={this.handleRestart}
            message={this.state.message}
            gameOver={this.state.gameOver}
            lastMove={this.state.lastMove}
          />
        )}
      </div>
    );
  }
}

export default OthelloGame;
