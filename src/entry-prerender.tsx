// Build-time render of the landing page (used by the seo plugin in vite.config.ts).
// The markup must match what <App /> renders first for a signed-out visitor so the browser can hydrate it.
import { StrictMode, Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import LandingPage from './components/LandingPage.tsx';

export function render() {
  return renderToString(
    <StrictMode>
      <Suspense fallback={null}>
        <LandingPage theme="light" onAuth={() => {}} />
      </Suspense>
    </StrictMode>,
  );
}
