import React from 'react';
import ReactDOM from 'react-dom';
import OthelloGame from './OthelloGame';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(<OthelloGame />, document.getElementById('root'));
registerServiceWorker();
