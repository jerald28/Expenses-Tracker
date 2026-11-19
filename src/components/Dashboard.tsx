import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Category, MonthlyBudget } from '../types.ts';
import { SYSTEM_CATEGORIES, formatCurrency, getCategoryById } from '../constants.ts';
import CategoryIcon from './CategoryIcon.tsx';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <h1 className="text-[34px] leading-none font-bold tracking-[-0.035em] text-gray-900 dark:text-white mt-1.5">
            {getGreeting()}
          </h1>
        </div>
      </div>

      {/* 2. Main High-contrast Dashboard widget (The iOS circular ring or status) */}
      <div className="p-6 rounded-3xl bg-[#14213d] dark:bg-[#15203a] text-white relative overflow-hidden transition-colors shadow-[0_24px_50px_-28px_rgba(20,33,61,0.7)] dark:border dark:border-neutral-800">

        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-sm font-medium text-white/65">
              Spent this month
            </h3>
            <p className="text-[40px] leading-none font-bold tracking-[-0.035em] text-white mt-2 tabular-nums">
              {formatCurrency(totalExpensesThisMonth, currencySymbol)}
            </p>
          </div>

          {/* Quick budget budget toggle button */}
          <div 
            onClick={() => setIsEditingBudget(true)}
            className="flex items-center bg-white/10 text-white rounded-full px-3 py-1.5 cursor-pointer hover:bg-[#f5b700] hover:text-[#14213d] transition-colors"
          >
            <span className="text-xs font-medium">
              Limit: {formatCurrency(budget.limit, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Live animated status bar */}
        <div className="mt-5 space-y-2 relative z-10">
          <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                isOverBudget ? 'bg-red-500' : budgetPercentage > 85 ? 'bg-orange-400' : 'bg-[#f5b700]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${budgetPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/65">
              {budgetPercentage.toFixed(0)}% of limit used
            </span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-300' : 'text-white'}`}>
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
              className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2"
              id="budget-edit-prompt"
            >
              <span className="text-xs text-white/65 whitespace-nowrap">New budget</span>
              <div className="relative flex-grow">
                <span className="absolute left-2.5 top-1.5 text-xs text-neutral-400">{currencySymbol}</span>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  placeholder="2000"
                  className="w-full text-sm py-2 pl-6 pr-2 rounded-lg bg-white text-[#14213d] border-0 outline-hidden focus:ring-2 focus:ring-[#f5b700]"
                  autoFocus
                />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handleSaveBudget}
                  aria-label="Save budget"
                  className="p-2 px-3 bg-[#f5b700] hover:bg-[#ffc933] text-[#14213d] text-xs rounded-lg font-semibold"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditingBudget(false);
                    setTempBudget(budget.limit.toString());
                  }}
                  aria-label="Cancel"
                  className="p-2 px-3 bg-white/10 text-white text-xs rounded-lg"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center"
            >
              <span className="text-xs text-white/60">
                Daily average this week: <span className="font-semibold text-white">{formatCurrency(totalExpensesThisWeek / 7, currencySymbol)}/day</span>
              </span>
              <button 
                onClick={() => setIsEditingBudget(true)}
                className="text-xs font-semibold text-[#f5b700] hover:text-[#ffd34d] flex items-center gap-1 cursor-pointer"
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
        <div className="p-4 rounded-2xl bg-white dark:bg-[#15203a] border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 block">
              Today
            </span>
            <span className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white mt-1 block tabular-nums">
              {formatCurrency(totalExpensesToday, currencySymbol)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
              {todayExpenses.length} {todayExpenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>
        </div>

        {/* This Week Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#15203a] border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 block">
              This week
            </span>
            <span className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white mt-1 block tabular-nums">
              {formatCurrency(totalExpensesThisWeek, currencySymbol)}
            </span>
            <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
              Monday to Sunday
            </span>
          </div>
        </div>
      </div>

      {/* 4. category Spending Breakdowns widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#14213d] dark:text-white tracking-tight">
            Top categories
          </h2>
          <span className="text-sm font-medium text-neutral-500">This month</span>
        </div>

        {categorySummary.length === 0 ? (
          <div className="text-center p-6 bg-white dark:bg-[#15203a] rounded-2xl border border-gray-100 dark:border-neutral-800 text-neutral-400 text-xs">
            No expenses logged this month yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#15203a] rounded-2xl border border-gray-100 dark:border-neutral-800 p-4 space-y-4">
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
                      <span className="text-[10px] text-neutral-400 block font-mono">{item.count} {item.count === 1 ? 'item' : 'items'}</span>
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
          <h2 className="text-xl font-bold text-[#14213d] dark:text-white tracking-tight">
            Recent expenses
          </h2>
          <button 
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center p-8 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Sparkles className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" size={24} />
            <p className="text-xs text-neutral-500">No expenses yet. Tap the yellow + button to log your first one.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#15203a] rounded-2xl border border-gray-100 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800">
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
