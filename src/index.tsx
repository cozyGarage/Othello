import { createRoot } from 'react-dom/client';
import OthelloGame from './OthelloGame';
// @ts-expect-error - registerServiceWorker is not typed
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(<OthelloGame />);
registerServiceWorker();
