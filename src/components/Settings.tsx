import React, { useState, useRef } from 'react';
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
  ShieldCheck
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
  onClearData
}: SettingsProps) {
  const [budgetVal, setBudgetVal] = useState(budget.limit.toString());
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
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
            onClick={() => {
              if (window.confirm('Delete all recorded expenses forever? This operation cannot be undone.')) {
                onClearData();
              }
            }}
            type="button"
            className="w-full p-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/10 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw size={14} /> Clear All App Data
          </button>
        </div>
      </div>
    </div>
  );
}
