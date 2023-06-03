import React, { Component } from 'react';
import './OthelloGame.css';
import Board from './Board';
import {W, B, E, getAnnotatedBoard, takeTurn, createBoard} from './game-logic';

class OthelloGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, B, W, E, E, E],
        [E, E, E, W, B, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E]
      ])
    };
  }

  handlePlayerTurn(coord) {
    takeTurn(this.state.board, coord);
    this.setState({
      board: this.state.board
    });
  }

  render() {
    return (
      <div className="OthelloGame">
        <Board board={getAnnotatedBoard(this.state.board)} onPlayerTurn={this.handlePlayerTurn.bind(this)}/>
      </div>
    );
  }
}

export default OthelloGame;