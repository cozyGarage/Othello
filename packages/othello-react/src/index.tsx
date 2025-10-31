import { createRoot } from 'react-dom/client';
import OthelloGame from './OthelloGame';
// @ts-expect-error - registerServiceWorker is not typed
import registerServiceWorker from './registerServiceWorker';
import { features, isDebugMode } from './config/features';

// Log feature flags on startup
if (isDebugMode()) {
  console.log('🚩 Feature Flags:', features);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = createRoot(rootElement);
root.render(<OthelloGame />);
registerServiceWorker();
