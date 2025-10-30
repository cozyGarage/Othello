import React, { Component } from 'react';
import './OthelloGame.css';
import Board from './Board';
import {W, B, E, getAnnotatedBoard, takeTurn, createBoard, getValidMoves, isGameOver, getWinner, getBestMove} from './game-logic';

class OthelloGame extends Component {
  constructor(props) {
    super(props);
    
    // Try to load saved game state
    const savedState = this.loadGameState();
    
    this.state = savedState || {
      board: this.createInitialBoard(),
      message: null,
      gameOver: false,
      moveHistory: [],
      moveCount: 0,
      startTime: Date.now(),
      showHint: false,
      hintMove: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // Auto-save game state on any update (except message changes)
    if (prevState.board !== this.state.board || 
        prevState.gameOver !== this.state.gameOver ||
        prevState.moveCount !== this.state.moveCount) {
      this.saveGameState();
    }
  }

  saveGameState() {
    try {
      const stateToSave = {
        board: this.state.board,
        gameOver: this.state.gameOver,
        moveHistory: this.state.moveHistory,
        moveCount: this.state.moveCount,
        startTime: this.state.startTime
      };
      localStorage.setItem('othelloGameState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  loadGameState() {
    try {
      const savedState = localStorage.getItem('othelloGameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return null;
  }

  clearSavedGame() {
    try {
      localStorage.removeItem('othelloGameState');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }

  createInitialBoard() {
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

  // Deep clone board for history
  cloneBoard(board) {
    return {
      playerTurn: board.playerTurn,
      tiles: board.tiles.map(row => [...row])
    };
  }

  handlePlayerTurn(coord) {
    if (this.state.gameOver) {
      return;
    }

    try {
      // Save current board state to history before making move
      const boardSnapshot = this.cloneBoard(this.state.board);
      const newHistory = [...this.state.moveHistory, boardSnapshot];
      
      takeTurn(this.state.board, coord);
      this.setState({ 
        moveHistory: newHistory,
        moveCount: this.state.moveCount + 1 
      });
      this.checkGameState();
    } catch (error) {
      this.setState({ message: error.message });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
  }

  handleUndo() {
    if (this.state.moveHistory.length === 0 || this.state.gameOver) {
      return;
    }

    const newHistory = [...this.state.moveHistory];
    const previousBoard = newHistory.pop();
    
    this.setState({
      board: previousBoard,
      moveHistory: newHistory,
      moveCount: Math.max(0, this.state.moveCount - 1),
      message: 'Move undone',
      gameOver: false
    });
    setTimeout(() => this.setState({ message: null }), 1500);
  }

  checkGameState() {
    const board = this.state.board;
    
    // Check if game is over
    if (isGameOver(board)) {
      const winner = getWinner(board);
      let message;
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

  handleRestart() {
    this.clearSavedGame();
    this.setState({
      board: this.createInitialBoard(),
      message: null,
      gameOver: false,
      moveHistory: [],
      moveCount: 0,
      startTime: Date.now(),
      showHint: false,
      hintMove: null
    });
  }

  getGameDuration() {
    const duration = Math.floor((Date.now() - this.state.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  handleShowHint() {
    if (this.state.gameOver) {
      return;
    }

    const bestMove = getBestMove(this.state.board);
    if (bestMove) {
      this.setState({ 
        showHint: true,
        hintMove: bestMove,
        message: `Hint: Try row ${bestMove[1] + 1}, column ${bestMove[0] + 1}`
      });
      setTimeout(() => {
        this.setState({ showHint: false, hintMove: null, message: null });
      }, 3000);
    } else {
      this.setState({ message: 'No valid moves available!' });
      setTimeout(() => this.setState({ message: null }), 2000);
    }
  }

  render() {
    return (
      <div className="OthelloGame">
        <Board 
          board={getAnnotatedBoard(this.state.board)} 
          onPlayerTurn={this.handlePlayerTurn.bind(this)}
          onRestart={this.handleRestart.bind(this)}
          onUndo={this.handleUndo.bind(this)}
          onShowHint={this.handleShowHint.bind(this)}
          message={this.state.message}
          gameOver={this.state.gameOver}
          moveCount={this.state.moveCount}
          gameDuration={this.getGameDuration()}
          canUndo={this.state.moveHistory.length > 0 && !this.state.gameOver}
          hintMove={this.state.showHint ? this.state.hintMove : null}
        />
      </div>
    );
  }
}

export default OthelloGame;