import React from 'react';
import ReactDOM from 'react-dom';
import OthelloGame from './Othello';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<OthelloGame />, div);
});