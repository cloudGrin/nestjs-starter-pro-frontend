import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MobileApp from './MobileApp';
import '@/assets/styles/index.css';
import './styles.css';
import { requestMobileAppReload } from './pwa/appUpdate';

function activateWaitingServiceWorker(registration: ServiceWorkerRegistration) {
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

function registerMobileServiceWorker() {
  let reloading = false;
  const reloadOnControllerChange = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadOnControllerChange || reloading) {
      return;
    }

    reloading = true;
    requestMobileAppReload(() => window.location.reload());
  });

  void navigator.serviceWorker
    .register('/mobile-sw.js', { scope: '/m/' })
    .then((registration) => {
      activateWaitingServiceWorker(registration);
      void registration.update();

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;

        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    })
    .catch((error: unknown) => {
      console.warn('Failed to register mobile service worker:', error);
    });
}

function unregisterMobileServiceWorkerInDevelopment() {
  void navigator.serviceWorker.getRegistration('/m/').then((registration) => {
    void registration?.unregister();
  });
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerMobileServiceWorker();
  });
}

if ('serviceWorker' in navigator && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    unregisterMobileServiceWorkerInDevelopment();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileApp />
  </StrictMode>
);
