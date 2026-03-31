// Register service worker for offline support and faster repeat loads.
// Only active in production builds (Vite sets import.meta.env.PROD).

export default function register() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.onstatechange = () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('New Othello version available — refresh to update.');
              }
            };
          };
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
