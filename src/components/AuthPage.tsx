import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase.ts';

interface AuthPageProps {
  theme: 'light' | 'dark';
  initialMode?: 'signin' | 'signup';
  onBack?: () => void;
}

const FRIENDLY_ERRORS: Record<string, string> = {
  'auth/unauthorized-domain': 'Sign-in is not enabled for this website yet. Please try again later.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow popups for this site and try again.',
  'auth/network-request-failed': 'No internet connection. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
};

const SAMPLE = [
  ['Jeep fare', '₱13.00'],
  ['Kape sa umaga', '₱120.00'],
  ['Lunch sa carinderia', '₱95.00'],
  ['Grab pauwi', '₱238.00'],
];

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function AuthPage({ initialMode = 'signin', onBack }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(FRIENDLY_ERRORS[err?.code] || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="lp lp-auth">
      <aside className="lp-auth-side" aria-hidden="true">
        <div className="lp-auth-side-inner">
          <span className="lp-brand lp-brand--light"><span className="lp-coin">₱</span>pesus</span>
          <div className="lp-auth-receipt">
            <div className="lp-receipt lp-receipt--static">
              <div className="lp-r-head"><strong>PESUS</strong><span>Today</span></div>
              {SAMPLE.map(([l, v]) => (
                <div className="lp-r-row" key={l}><span>{l}</span><span>{v}</span></div>
              ))}
              <div className="lp-r-sep" />
              <div className="lp-r-row lp-r-total"><span>Total today</span><span>₱466.00</span></div>
              <div className="lp-r-row lp-r-left"><span>Left this month</span><span>₱6,534.00</span></div>
            </div>
            <div className="lp-stamp lp-stamp--static">Under<br />budget</div>
          </div>
          <p className="lp-auth-quote">Every peso, accounted for.</p>
        </div>
      </aside>

      <main className="lp-auth-main">
        <div className="lp-auth-card">
          <div className="lp-auth-top">
            {onBack ? (
              <button type="button" className="lp-auth-back" onClick={onBack}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Back to home
              </button>
            ) : <span />}
            <span className="lp-brand lp-auth-brand-mobile"><span className="lp-coin">₱</span>pesus</span>
          </div>

          <div className="lp-auth-tabs" role="tablist" aria-label="Sign in or create account">
            <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'is-active' : ''} onClick={() => { setMode('signin'); setError(null); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'is-active' : ''} onClick={() => { setMode('signup'); setError(null); }}>Create account</button>
          </div>

          <h1 className="lp-auth-title">{isSignup ? 'Create your free account' : 'Welcome back'}</h1>
          <p className="lp-auth-sub">
            {isSignup
              ? 'Sign up with your Google account. No new password to remember, and your expenses sync to all your devices.'
              : 'Sign in with your Google account to see your expenses and budget.'}
          </p>

          {error && (
            <div className="lp-auth-error" role="alert">{error}</div>
          )}

          <button type="button" className="lp-google" onClick={handleGoogle} disabled={loading} aria-busy={loading}>
            {loading ? <span className="lp-spinner" aria-hidden="true" /> : <GoogleLogo />}
            <span>{loading ? 'Opening Google…' : isSignup ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          <ul className="lp-auth-points">
            <li>Free to use, no card needed</li>
            <li>Your data stays in your account</li>
            <li>Works on your phone and laptop</li>
          </ul>

          <p className="lp-auth-switch">
            {isSignup ? 'Already have an account? ' : 'New to Pesus? '}
            <button type="button" onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(null); }}>
              {isSignup ? 'Sign in' : 'Create a free account'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
