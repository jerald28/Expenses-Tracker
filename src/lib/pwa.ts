import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

// The browser fires `beforeinstallprompt` once, often before React mounts,
// so it is captured here at module load and shared with any component.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const updateSW = registerSW({
    immediate: true,
    // If an update is waiting (e.g. from an older release), apply it and reload once
    onNeedRefresh() {
      updateSW(true);
    },
  });
}

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export type InstallResult = 'installed' | 'dismissed' | 'ios' | 'manual';

export function useInstallApp() {
  const [, force] = useState(0);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const update = () => {
      force((n) => n + 1);
      setInstalled(isStandalone());
    };
    update();
    listeners.add(update);
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener?.('change', update);
    return () => {
      listeners.delete(update);
      mq.removeEventListener?.('change', update);
    };
  }, []);

  const install = async (): Promise<InstallResult> => {
    if (deferredPrompt) {
      const evt = deferredPrompt;
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      deferredPrompt = null;
      notify();
      return outcome === 'accepted' ? 'installed' : 'dismissed';
    }
    return isIOS() ? 'ios' : 'manual';
  };

  return { installed, canPrompt: !!deferredPrompt, install };
}
