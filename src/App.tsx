import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  Settings as SettingsIcon, 
  ClipboardList
} from 'lucide-react';

import { Expense, MonthlyBudget, TabType, ThemeType } from './types.ts';
import { SYSTEM_CATEGORIES } from './constants.ts';

// Component imports
import Dashboard from './components/Dashboard.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import ExpenseFormPage from './components/ExpenseFormPage.tsx';
import Settings from './components/Settings.tsx';

// Empty seed records for brand new user state
const SEED_EXPENSES: Expense[] = [];

type SyncStatus = 'synced' | 'syncing' | 'offline';

export default function App() {
  // --- States with LocalStorage Immediate Fallback ---
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('ios_expenses');
    return saved ? JSON.parse(saved) : SEED_EXPENSES;
  });

  const [budget, setBudget] = useState<MonthlyBudget>(() => {
    const saved = localStorage.getItem('ios_budget');
    return saved ? JSON.parse(saved) : { limit: 15000.00, isEnabled: true };
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    const saved = localStorage.getItem('ios_currency');
    return saved || '₱'; // Default to Peso!
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('ios_theme');
    return (saved as ThemeType) || 'light';
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [previousTab, setPreviousTab] = useState<TabType>('dashboard');
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [phoneTime, setPhoneTime] = useState('09:41');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  // Track previous tab to go back on Form close/cancel
  useEffect(() => {
    if (activeTab !== 'add') {
      setPreviousTab(activeTab);
    }
  }, [activeTab]);

  // --- Initial state recovery from DB ---
  useEffect(() => {
    const loadStateFromServer = async () => {
      try {
        setSyncStatus('syncing');
        const res = await fetch('/api/state');
        if (res.ok) {
          const remoteState = await res.json();
          if (remoteState.expenses) {
            setExpenses(remoteState.expenses);
            // Sync fallback details if server state is set
            if (remoteState.budget) setBudget(remoteState.budget);
            if (remoteState.currency) setCurrencySymbol(remoteState.currency);
            if (remoteState.theme) setTheme(remoteState.theme);
            setSyncStatus('synced');
            return;
          }
        }
        setSyncStatus('offline');
      } catch (err) {
        console.warn('Backend server unreachable or load state failed. Using offline cache.');
        setSyncStatus('offline');
      }
    };
    loadStateFromServer();
  }, []);

  // --- Automatic Sync State dispatching ---
  const triggerSync = async (
    currentExpenses: Expense[],
    currentBudget: MonthlyBudget,
    currentCurrency: string,
    currentTheme: ThemeType
  ) => {
    // 1. Immediately backup to local cache
    localStorage.setItem('ios_expenses', JSON.stringify(currentExpenses));
    localStorage.setItem('ios_budget', JSON.stringify(currentBudget));
    localStorage.setItem('ios_currency', currentCurrency);
    localStorage.setItem('ios_theme', currentTheme);

    // 2. Dispatch query to backend
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expenses: currentExpenses,
          budget: currentBudget,
          currency: currentCurrency,
          theme: currentTheme
        })
      });
      if (res.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  };

  // --- Theme Controller ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setPhoneTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Operations / Actions handlers ---
  const handleSaveExpense = (newExpenseData: Omit<Expense, 'id'> & { id?: string }) => {
    let nextExpenses = [...expenses];
    if (newExpenseData.id) {
      // Edit
      nextExpenses = expenses.map((item) => item.id === newExpenseData.id ? (newExpenseData as Expense) : item);
    } else {
      // Create
      const entry: Expense = {
        ...newExpenseData,
        id: `expense-${Date.now()}`
      };
      nextExpenses = [entry, ...nextExpenses];
    }
    setExpenses(nextExpenses);
    setExpenseToEdit(null);
    triggerSync(nextExpenses, budget, currencySymbol, theme);
  };

  const handleDeleteExpense = (id: string) => {
    const nextExpenses = expenses.filter((item) => item.id !== id);
    setExpenses(nextExpenses);
    if (expenseToEdit && expenseToEdit.id === id) {
      setExpenseToEdit(null);
    }
    triggerSync(nextExpenses, budget, currencySymbol, theme);
  };

  const handleUpdateBudget = (newLimit: number) => {
    const nextBudget = { limit: newLimit, isEnabled: true };
    setBudget(nextBudget);
    triggerSync(expenses, nextBudget, currencySymbol, theme);
  };

  const handleUpdateCurrency = (symbol: string) => {
    setCurrencySymbol(symbol);
    triggerSync(expenses, budget, symbol, theme);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    triggerSync(expenses, budget, currencySymbol, nextTheme);
  };

  const handleBackupData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ 
        expenses, 
        budget, 
        currency: currencySymbol,
        theme 
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `expenses-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        setExpenses(parsed.expenses);
        if (parsed.budget) setBudget(parsed.budget);
        if (parsed.currency) setCurrencySymbol(parsed.currency);
        if (parsed.theme) setTheme(parsed.theme);

        // Sync
        triggerSync(parsed.expenses, parsed.budget || budget, parsed.currency || currencySymbol, parsed.theme || theme);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleClearData = () => {
    setExpenses([]);
    const defaultBudget = { limit: 15000.00, isEnabled: true };
    setBudget(defaultBudget);
    setCurrencySymbol('₱');
    setTheme('light');
    setActiveTab('dashboard');
    triggerSync([], defaultBudget, '₱', 'light');
  };

  const handleSelectExpenseForEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setActiveTab('add');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] dark:bg-[#0A0A0C] font-sans antialiased text-neutral-950 dark:text-white transition-colors flex flex-col justify-between relative" id="applet-primary-container">
      
      {/* Subtle Floating DB Connection Status Indicator (No layout footprint) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 pointer-events-none select-none">
        {syncStatus === 'synced' && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/80" title="Live Synced" />
        )}
        {syncStatus === 'syncing' && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Syncing..." />
        )}
        {syncStatus === 'offline' && (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Offline Cache Mode" />
        )}
      </div>

      {/* Main Content Board */}
      <main 
        className="flex-grow w-full max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-28 min-h-[600px] transition-colors"
        id="iphone-screen-contents"
      >
        {activeTab === 'dashboard' && (
          <Dashboard 
            expenses={expenses}
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
            }}
            onSelectExpenseForEdit={handleSelectExpenseForEdit}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'history' && (
          <ExpenseList 
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleSelectExpenseForEdit}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'add' && (
          <ExpenseFormPage 
            expenseToEdit={expenseToEdit}
            onClose={() => {
              setActiveTab(previousTab);
              setExpenseToEdit(null);
            }}
            onSave={handleSaveExpense}
            onDelete={handleDeleteExpense}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            budget={budget}
            onUpdateBudget={handleUpdateBudget}
            currencySymbol={currencySymbol}
            onUpdateCurrency={handleUpdateCurrency}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onBackup={handleBackupData}
            onRestore={handleRestoreData}
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* Modern Sticky Bottom Tab Bar */}
      <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40" id="ios-bottom-tabbar">
        <div className="bg-white/94 dark:bg-[#151518]/94 backdrop-blur-md rounded-2xl border border-neutral-200/20 dark:border-neutral-800/80 shadow-lg px-5 py-2.5 flex justify-between items-center transition-colors">
          {/* Summary Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 flex-1 relative cursor-pointer group select-none transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-350'
            }`}
          >
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="text-[9px] font-bold tracking-tight">Summary</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="tab-indicator" className="absolute -bottom-2 w-6 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Expenses / Ledger Tab */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 flex-1 relative cursor-pointer group select-none transition-colors ${
              activeTab === 'history' ? 'text-blue-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-350'
            }`}
          >
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="text-[9px] font-bold tracking-tight">Ledger</span>
            {activeTab === 'history' && (
              <motion.div layoutId="tab-indicator" className="absolute -bottom-2 w-6 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Cupertino Primary Action Add Button */}
          <div className="flex-1 flex justify-center -mt-6 select-none">
            <button
              onClick={() => {
                if (activeTab === 'add') {
                  setActiveTab(previousTab);
                  setExpenseToEdit(null);
                } else {
                  setExpenseToEdit(null);
                  setActiveTab('add');
                }
              }}
              className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer border-3 border-[#F4F4F7] dark:border-[#0A0A0C] active:scale-95 ${
                activeTab === 'add' ? 'bg-blue-600 ring-4 ring-blue-500/20' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              title={activeTab === 'add' ? 'Cancel / Go Back' : 'Add expense'}
            >
              <Plus size={20} strokeWidth={3} className={activeTab === 'add' ? 'rotate-45 transition-transform duration-200' : 'transition-transform duration-200'} />
            </button>
          </div>

          <div className="w-px h-4 bg-neutral-200/60 dark:bg-neutral-800/80" />

          {/* Settings Tab */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 flex-1 relative cursor-pointer group select-none transition-colors ${
              activeTab === 'settings' ? 'text-blue-500' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-350'
            }`}
          >
            <SettingsIcon size={18} className="group-hover:rotate-45 transition-transform duration-350" />
            <span className="text-[9px] font-bold tracking-tight">Settings</span>
            {activeTab === 'settings' && (
              <motion.div layoutId="tab-indicator" className="absolute -bottom-2 w-6 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
