import React, { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../lib/firebase.ts';
import { 
  Wallet,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface AuthPageProps {
  theme: 'light' | 'dark';
}

export default function AuthPage({ theme }: AuthPageProps) {
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google sign in helper
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google account authorization failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-[#F4F4F7] dark:bg-[#0A0A0C] transition-colors`} id="auth-page-root">
      <div className="w-full max-w-md" id="auth-card-container">
        
        {/* App Splash Frame */}
        <div className="text-center mb-8" id="auth-header-logo-section">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 mb-4" id="app-logo-box">
            <Wallet size={28} id="app-logo-vector" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-1.5" id="app-title-header">
            Pesus Tracker 
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs mx-auto" id="app-subtitle-text">
            Monitor and organize your daily, weekly, and monthly expenses in one place, helping you make smarter financial decisions.
          </p>
        </div>

        {/* Primary Interactive Auth Panel */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/10 dark:border-neutral-800/80 shadow-2xl p-6 md:p-8 space-y-6 transition-colors" id="auth-form-card">
          
          {/* Action Modality Switcher */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl" id="auth-tab-switch">
            <button
              id="auth-tab-signin"
              onClick={() => {
                setActiveMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMode === 'signin' 
                  ? 'bg-white dark:bg-[#2C2C2E] text-blue-500 shadow-xs' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => {
                setActiveMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMode === 'signup' 
                  ? 'bg-white dark:bg-[#2C2C2E] text-blue-500 shadow-xs' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Value Propositions / Why Google Auth is safer */}
          <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-200/20 dark:border-neutral-800/20" id="benefits-badge-section">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-850 dark:text-white">One-click Password-less Linkage</h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-normal mt-0.5">Secure verification without keeping sensitive key secrets inside third-party indices.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-neutral-850 dark:text-white">Continuous Expense Backups</h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-normal mt-0.5">Synchronizes every ledger balance instantly with Google Cloud's distributed ledger node.</p>
              </div>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5"
              id="auth-error-banner"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" id="error-vector" />
              <span className="text-xs font-medium text-red-650 dark:text-red-400 leading-normal" id="error-alert-msg">{errorMessage}</span>
            </motion.div>
          )}

          {/* Unified Social Google Auth CTA */}
          <div className="pt-2" id="social-auth-providers">
            <button
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4.5 px-4 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-blue-500/5 active:scale-97 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" id="auth-loading-spinner" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" id="google-logo-icon">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span className="font-semibold text-xs py-0.5">
                    {activeMode === 'signin' ? 'Continue with Google Account' : 'Sign Up with Google Account'}
                  </span>
                  <ArrowRight size={14} className="opacity-70" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Dynamic bottom secure notice badge */}
        <div className="text-center mt-6 text-[10px] text-neutral-400 dark:text-neutral-550 font-medium" id="auth-secure-footnote">
          🔒 Secured environment protected by Google Cloud Identity Services
        </div>

      </div>
    </div>
  );
}
