import React, { useState, useRef } from 'react';
import type { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { MonthlyBudget, ThemeType } from '../types.ts';
import { 
  Sun, 
  Moon, 
  DollarSign, 
  Download, 
  Upload, 
  RotateCcw, 
  Info,
  Check,
  Smartphone,
  ShieldCheck,
  Cloud,
  AlertTriangle,
  X
} from 'lucide-react';

interface SettingsProps {
  budget: MonthlyBudget;
  onUpdateBudget: (newLimit: number) => void;
  currencySymbol: string;
  onUpdateCurrency: (symbol: string) => void;
  theme: ThemeType;
  onToggleTheme: () => void;
  onBackup: () => void;
  onRestore: (jsonData: string) => boolean;
  onClearData: () => void;
  currentUser: User | null;
  authLoading: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

const SUPPORTED_CURRENCIES = [
  { symbol: '$', label: 'USD / Dollar ($)' },
  { symbol: '€', label: 'EUR / Euro (€)' },
  { symbol: '£', label: 'GBP / Pound (£)' },
  { symbol: '¥', label: 'JPY / Yen (¥)' },
  { symbol: '₱', label: 'PHP / Peso (₱)' },
  { symbol: '₹', label: 'INR / Rupee (₹)' },
  { symbol: '₩', label: 'KRW / Won (₩)' },
];

export default function Settings({
  budget,
  onUpdateBudget,
  currencySymbol,
  onUpdateCurrency,
  theme,
  onToggleTheme,
  onBackup,
  onRestore,
  onClearData,
  currentUser,
  authLoading,
  onSignIn,
  onSignOut
}: SettingsProps) {
  const [budgetVal, setBudgetVal] = useState(budget.limit.toString());
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleClearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim().toLowerCase() !== 'clear') {
      setModalError('Please type the word "clear" exactly to confirm.');
      return;
    }
    onClearData();
    setShowClearModal(false);
    setConfirmInput('');
    setModalError(null);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await onSignIn();
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to authenticate with Google. Please try again.');
      setTimeout(() => setAuthError(null), 6000);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) || (parsed && parsed.expenses)) {
          const success = onRestore(text);
          if (success) {
            setRestoreMessage({ type: 'success', text: 'Backup imported successfully!' });
          } else {
            setRestoreMessage({ type: 'error', text: 'Invalid backup file structure.' });
          }
        } else {
          setRestoreMessage({ type: 'error', text: 'Invalid format. Could not import.' });
        }
      } catch (err) {
        setRestoreMessage({ type: 'error', text: 'Failed to read backup file.' });
      }
      setTimeout(() => setRestoreMessage(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-4" id="ios-settings-viewport">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Customize currency, backing up data, and appearance.
        </p>
      </div>

      {/* Cloud Sync Auth Section with Google Account */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-850 p-4 space-y-4" id="firebase-cloud-sync-container">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          <Cloud size={14} className="text-blue-500" /> Sync & Cloud Backup
        </h3>
        {authError && (
          <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-xs font-semibold text-red-650 dark:text-red-400">
            {authError}
          </div>
        )}
        {authLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-neutral-500 ml-2">Loading user account...</span>
          </div>
        ) : currentUser ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'Google User'} 
                    className="w-10 h-10 rounded-full border border-neutral-250/20 dark:border-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <div>
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white block truncate max-w-[180px]">
                    {currentUser.displayName || 'Google User'}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono block truncate max-w-[180px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                Sync Active
              </span>
            </div>
            
            <button
              onClick={onSignOut}
              type="button"
              className="w-full py-2.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
            >
              Sign Out Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              Sign in with your Google Account to back up your budget constraints, currency symbol settings, and recorded transaction logs automatically to secure cloud Firestore servers.
            </p>
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign In with Google
            </button>
          </div>
        )}
      </div>


      {/* 1. Theme Configuration section */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-850 p-4 space-y-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          App Appearance
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-500">
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <div>
              <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
                {theme === 'light' ? 'Light Theme' : 'Dark Theme'}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                Cupertino system appearance
              </span>
            </div>
          </div>

          {/* iOS Style Custom Toggle Switch Button */}
          <button
            onClick={onToggleTheme}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center ${
              theme === 'dark' ? 'bg-[#34C759]' : 'bg-neutral-200 dark:bg-neutral-800'
            }`}
          >
            <div 
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Budget and regional currency selector */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-850 p-4 space-y-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Preferences & Budgeting
        </h3>

        {/* Currency selection row */}
        <div className="space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
              Active Currency
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Changes core layout symbols
            </span>
          </div>

          <select
            value={currencySymbol}
            onChange={(e) => onUpdateCurrency(e.target.value)}
            className="text-xs p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white outline-hidden font-semibold cursor-pointer max-w-[200px]"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.symbol} value={currency.symbol}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        {/* Edit Default Budget Form */}
        <form onSubmit={handleSaveBudget} className="space-y-3 pt-1">
          <div>
            <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
              Default Monthly Budget
            </span>
            <span className="text-[10px] text-neutral-400 font-mono block mb-1.5">
              Warning alarms show upon nearing capacity
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute left-3.5 top-3.5 text-xs text-neutral-400">{currencySymbol}</span>
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                placeholder="2000"
                className="w-full text-sm p-3.5 pl-7 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all self-center h-[46px]"
            >
              {isSaved ? <Check size={14} /> : null}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Offline backup management */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-850 p-4 space-y-4">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Offline Backup & Privacy
        </h3>

        <p className="text-xs text-neutral-400">
          This app runs fully in your web browser. All budget metrics, expense ledgers, and configurations are securely stored within client-side local cache storage. No personal data ever leaks to the internet.
        </p>

        {/* Real backup results indicator */}
        {restoreMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold ${
            restoreMessage.type === 'success' 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {restoreMessage.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1" id="backup-actions-grid">
          {/* Backup Button */}
          <button
            onClick={onBackup}
            type="button"
            className="p-3 bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download size={14} /> Download JSON
          </button>

          {/* Restore Button (Triggers Hidden File Input) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="p-3 bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Upload size={14} /> Restore JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Wipe clean slate */}
        <div className="pt-2">
          <button
            onClick={() => setShowClearModal(true)}
            type="button"
            className="w-full p-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/10 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw size={14} /> Clear All App Data
          </button>
        </div>
      </div>

      {/* Interactive Custom Modal Overlay */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none" id="clear-confirm-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-200/10 dark:border-neutral-800/80 shadow-2xl p-6 max-w-sm w-full space-y-5 text-center"
              id="clear-confirm-modal-box"
            >
              {/* Warning Icon Banner */}
              <div className="flex justify-center" id="modal-warning-icon-wrapper">
                <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle size={26} />
                </div>
              </div>

              {/* Title and Descriptions */}
              <div className="space-y-1.5" id="modal-text-descriptor">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Confirm Data Clearance
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Are you absolutely sure you want to clear all your ledger transaction balances, customized configurations, and budget limit history?
                </p>
                <div className="p-2 bg-red-500/5 text-red-650 dark:text-red-400 text-[10px] font-bold rounded-lg border border-red-500/10 inline-block uppercase tracking-wider">
                  ⚠️ This action is irreversible
                </div>
              </div>

              {/* Safety Confirmation Text Input Field */}
              <form onSubmit={handleClearSubmit} className="space-y-4" id="modal-confirmation-form">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block" htmlFor="confirm-field-text">
                    Type 'clear' to confirm:
                  </label>
                  <input
                    id="confirm-field-text"
                    type="text"
                    value={confirmInput}
                    onChange={(e) => {
                      setConfirmInput(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    placeholder="Type clear here"
                    className="w-full text-center text-xs p-3 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl border border-neutral-200/50 dark:border-neutral-800/80 outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all font-medium"
                    required
                    autoFocus
                  />
                  {modalError && (
                    <p className="text-[10px] font-bold text-red-500 text-center animate-pulse mt-1" id="modal-validation-error">
                      {modalError}
                    </p>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-1" id="modal-button-container">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClearModal(false);
                      setConfirmInput('');
                      setModalError(null);
                    }}
                    className="flex-grow py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
