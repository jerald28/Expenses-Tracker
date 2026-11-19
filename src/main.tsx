import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/familjen-grotesk/400.css';
import '@fontsource/familjen-grotesk/500.css';
import '@fontsource/familjen-grotesk/600.css';
import '@fontsource/familjen-grotesk/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './index.css';
import './components/landing.css';
import { registerServiceWorker } from './lib/pwa.ts';

registerServiceWorker();

let signedIn = false;
try { signedIn = localStorage.getItem('pesus_signed_in') === '1'; } catch { /* storage unavailable */ }
// First-time visitors land on the marketing page: start fetching it in parallel with the app.
if (!signedIn) import('./components/LandingPage.tsx');

const container = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);
// The landing page is pre-rendered into #root at build time. Signed-out visitors adopt that HTML
// (hydration) so it stays on screen; returning signed-in users go straight to the app.
if (container.hasChildNodes() && !signedIn) {
  hydrateRoot(container, tree);
} else {
  container.textContent = '';
  document.documentElement.classList.remove('ssr-pending');
  createRoot(container).render(tree);
}
