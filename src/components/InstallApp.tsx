import { useEffect, useRef, useState } from 'react';
import { useInstallApp, isIOS } from '../lib/pwa.ts';

type Sheet = null | 'ios' | 'manual';

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 3v12m0-12L8 7m4-4l4 4M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Props {
  className?: string;
  label?: string;
}

export default function InstallAppButton({ className = 'lp-btn lp-btn--ghost', label = 'Install the app' }: Props) {
  const { installed, install } = useInstallApp();
  const [sheet, setSheet] = useState<Sheet>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sheet) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(null);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      openerRef.current?.focus();
    };
  }, [sheet]);

  if (installed) return null;

  const onClick = async () => {
    const result = await install();
    if (result === 'ios' || result === 'manual') setSheet(result);
  };

  return (
    <>
      <button ref={openerRef} type="button" className={`${className} lp-install`} onClick={onClick}>
        <DownloadIcon />
        {label}
      </button>

      {sheet && (
        <div className="lp-sheet-backdrop" onClick={() => setSheet(null)}>
          <div
            className="lp-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lp-sheet-head">
              <img src="/icons/icon-192.png" alt="" width="52" height="52" />
              <div>
                <h2 id="install-title">Install Pesus</h2>
                <p>Add it to your home screen. It opens full screen like a regular app.</p>
              </div>
            </div>

            {sheet === 'ios' || isIOS() ? (
              <ol className="lp-sheet-steps">
                <li>Open this page in <b>Safari</b>.</li>
                <li>Tap the <b>Share</b> button <span className="lp-inline-icon"><ShareIcon /></span> at the bottom of the screen.</li>
                <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                <li>Tap <b>Add</b>. Pesus will appear on your home screen.</li>
              </ol>
            ) : (
              <ol className="lp-sheet-steps">
                <li>On Android, open this page in <b>Chrome</b>. On a computer, use <b>Chrome</b> or <b>Edge</b>.</li>
                <li>Open the browser menu <b>⋮</b> at the top right.</li>
                <li>Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
                <li>Confirm. Pesus will appear with your other apps.</li>
              </ol>
            )}

            <button ref={closeRef} type="button" className="lp-btn lp-btn--primary lp-sheet-close" onClick={() => setSheet(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
