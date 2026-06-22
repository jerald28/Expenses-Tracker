import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Category, MonthlyBudget } from '../types.ts';
import { SYSTEM_CATEGORIES, formatCurrency, getCategoryById } from '../constants.ts';
import CategoryIcon from './CategoryIcon.tsx';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Edit2, 
  Check, 
  X,
  Sparkles,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  budget: MonthlyBudget;
  onUpdateBudget: (newLimit: number) => void;
  onNavigateToTab: (tab: 'dashboard' | 'history' | 'add' | 'settings') => void;
  onSelectExpenseForEdit: (expense: Expense) => void;
  currencySymbol: string;
}

export default function Dashboard({
  expenses,
  budget,
  onUpdateBudget,
  onNavigateToTab,
  onSelectExpenseForEdit,
  currencySymbol
}: DashboardProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget.limit.toString());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Core Calculations
  const today = new Date().toISOString().split('T')[0];
  
  // Current month prefix (YYYY-MM)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  
  // Calculate totals
  const totalExpensesAllTime = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  const currentMonthExpenses = expenses.filter(item => item.date.startsWith(currentMonthStr));
  const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  
  const todayExpenses = expenses.filter(item => item.date === today);
  const totalExpensesToday = todayExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Weekly calculations
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };
  const startOfWeek = getStartOfWeek();
  const weeklyExpenses = expenses.filter(item => item.date >= startOfWeek && item.date <= today);
  const totalExpensesThisWeek = weeklyExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Category breakdown calculations
  const categorySummary = SYSTEM_CATEGORIES.map(category => {
    const categoryExpenses = currentMonthExpenses.filter(item => item.categoryId === category.id);
    const amount = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);
    return {
      category,
      amount,
      percentage: totalExpensesThisMonth > 0 ? (amount / totalExpensesThisMonth) * 100 : 0,
      count: categoryExpenses.length
    };
  }).filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Budget status variables
  const budgetPercentage = budget.limit > 0 ? Math.min((totalExpensesThisMonth / budget.limit) * 100, 100) : 0;
  const isOverBudget = totalExpensesThisMonth > budget.limit;
  const remainingBudget = Math.max(0, budget.limit - totalExpensesThisMonth);

  // Save budget changes
  const handleSaveBudget = () => {
    const parsed = parseFloat(tempBudget);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setIsEditingBudget(false);
    }
  };

  // Profile greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 pb-2" id="ios-dashboard-viewport">
      {/* 1. Header Area with dynamic greeting & profile design */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            {getGreeting()}
          </h1>
        </div>
      </div>

      {/* 2. Main High-contrast Dashboard widget (The iOS circular ring or status) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-neutral-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-3 text-neutral-200 dark:text-neutral-800 pointer-events-none">
          <PiggyBank size={84} strokeWidth={1} />
        </div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Spent This Month
            </h3>
            <p className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white mt-1">
              {formatCurrency(totalExpensesThisMonth, currencySymbol)}
            </p>
          </div>

          {/* Quick budget budget toggle button */}
          <div 
            onClick={() => setIsEditingBudget(true)}
            className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full px-3 py-1 cursor-pointer hover:bg-blue-500/10 dark:hover:bg-blue-950/45 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-550/20 transition-all border border-transparent"
          >
            <span className="text-xs font-medium">
              Limit: {formatCurrency(budget.limit, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Live animated status bar */}
        <div className="mt-5 space-y-2 relative z-10">
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                isOverBudget ? 'bg-red-500' : budgetPercentage > 85 ? 'bg-amber-500' : 'bg-[#34C759]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${budgetPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">
              {budgetPercentage.toFixed(0)}% of limit used
            </span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`}>
              {isOverBudget 
                ? `Over by ${formatCurrency(Math.abs(budget.limit - totalExpensesThisMonth), currencySymbol)}`
                : `${formatCurrency(remainingBudget, currencySymbol)} left`
              }
            </span>
          </div>
        </div>

        {/* Budget limit prompt inline */}
        <AnimatePresence mode="wait">
          {isEditingBudget ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2"
              id="budget-edit-prompt"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">New Budget:</span>
              <div className="relative flex-grow">
                <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400">{currencySymbol}</span>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  placeholder="2000"
                  className="w-full text-xs py-1.5 pl-6 pr-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handleSaveBudget}
                  className="p-1 px-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditingBudget(false);
                    setTempBudget(budget.limit.toString());
                  }}
                  className="p-1 px-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center"
            >
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Weekly burn: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{formatCurrency(totalExpensesThisWeek / 7, currencySymbol)}/day</span>
              </span>
              <button 
                onClick={() => setIsEditingBudget(true)}
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 size={11} />
                Adjust limit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Daily / Weekly Micro Widgets - Clean double columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              Today
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mt-1 block">
              {formatCurrency(totalExpensesToday, currencySymbol)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
              {todayExpenses.length} transactions
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-955 text-amber-500">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* This Week Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
              This Week
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mt-1 block">
              {formatCurrency(totalExpensesThisWeek, currencySymbol)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
              Mon - Sun cycle
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-955 text-blue-500">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* 4. category Spending Breakdowns widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Top Categories
          </h2>
          <span className="text-xs font-medium text-neutral-400">This Month</span>
        </div>

        {categorySummary.length === 0 ? (
          <div className="text-center p-6 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-800 text-neutral-400 text-xs">
            No expenses logged this month yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-800 p-4 space-y-4">
            {categorySummary.slice(0, 4).map((item) => (
              <div 
                key={item.category.id} 
                className="space-y-1.5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 p-1.5 rounded-lg transition-colors"
                onClick={() => {
                  setActiveCategoryFilter(activeCategoryFilter === item.category.id ? null : item.category.id);
                }}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: item.category.color }}
                    >
                      <CategoryIcon name={item.category.icon} size={14} className="text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-850 dark:text-neutral-200">{item.category.name}</span>
                      <span className="text-[10px] text-neutral-400 block font-mono">{item.count} items</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-neutral-900 dark:text-white leading-tight block">
                      {formatCurrency(item.amount, currencySymbol)}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {item.percentage.toFixed(0)}% of total
                    </span>
                  </div>
                </div>
                
                {/* Horizontal progress representation */}
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.category.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Recent Activity with edit shortcuts */}
      <div className="space-y-3" id="recent-expenses-dashboard">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Recent Expenses
          </h2>
          <button 
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Sparkles className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" size={24} />
            <p className="text-xs text-neutral-500">Tap the "+" tab to add your first expense!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800">
            {expenses.slice(0, 4).map((expense) => {
              const cat = getCategoryById(expense.categoryId);
              return (
                <div 
                  key={expense.id} 
                  className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectExpenseForEdit(expense)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-neutral-850 dark:text-neutral-100 line-clamp-1">
                        {expense.description}
                      </span>
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-black text-sm text-neutral-950 dark:text-white">
                      -{formatCurrency(expense.amount, currencySymbol)}
                    </span>
                    <ChevronRight size={14} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
