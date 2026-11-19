import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/familjen-grotesk/400.css';
import '@fontsource/familjen-grotesk/500.css';
import '@fontsource/familjen-grotesk/600.css';
import '@fontsource/familjen-grotesk/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './index.css';
import { registerServiceWorker } from './lib/pwa.ts';

registerServiceWorker();

// First-time visitors land on the marketing page: start fetching it in parallel with the app
// instead of waiting for React to request it.
try {
  if (localStorage.getItem('pesus_signed_in') !== '1') import('./components/LandingPage.tsx');
} catch { /* storage unavailable */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
