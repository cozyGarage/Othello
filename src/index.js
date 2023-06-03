import React from 'react';
import { createRoot } from 'react-dom/client';
import OthelloGame from './OthelloGame';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const root = createRoot(document.getElementById("root"));
root.render(<OthelloGame />);
registerServiceWorker();
