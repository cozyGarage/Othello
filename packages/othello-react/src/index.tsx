import { createRoot } from 'react-dom/client';
import OthelloGame from './OthelloGame';
// @ts-expect-error - registerServiceWorker is not typed
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './styles/animations.css';
import { features, isDebugMode } from './config/features';

console.log('🎯 index.tsx loaded - App starting...');

// Log feature flags on startup
if (isDebugMode()) {
  console.log('🚩 Feature Flags:', features);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('✅ Root element found, creating root and rendering...');

const root = createRoot(rootElement);
root.render(<OthelloGame />);

console.log('✅ OthelloGame render called!');

registerServiceWorker();
