import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MobileApp from './MobileApp';
import '@/assets/styles/index.css';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/mobile-sw.js', { scope: '/m/' });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileApp />
  </StrictMode>
);
