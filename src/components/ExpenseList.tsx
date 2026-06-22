import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense, Category } from '../types.ts';
import { SYSTEM_CATEGORIES, formatCurrency, getCategoryById } from '../constants.ts';
import CategoryIcon from './CategoryIcon.tsx';
import { Search, Trash2, Calendar, Edit2, Filter, AlertCircle, X, ChevronRight } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  currencySymbol: string;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export default function ExpenseList({
  expenses,
  onDeleteExpense,
  onEditExpense,
  currencySymbol
}: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<PeriodFilter>('all');
  const [swipeActiveId, setSwipeActiveId] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // 1. Text Search matching description or notes
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Category matching
      const matchesCategory = selectedCategory === 'all' || expense.categoryId === selectedCategory;
      
      // 3. Time period compliance
      const expenseDateStr = expense.date; // YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      
      let matchesTime = true;
      if (timePeriod === 'today') {
        matchesTime = expenseDateStr === todayStr;
      } else if (timePeriod === 'week') {
        const getStartOfWeek = () => {
          const d = new Date();
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          return new Date(d.setDate(diff)).toISOString().split('T')[0];
        };
        matchesTime = expenseDateStr >= getStartOfWeek();
      } else if (timePeriod === 'month') {
        const currentMonthPrefix = new Date().toISOString().substring(0, 7); // YYYY-MM
        matchesTime = expenseDateStr.startsWith(currentMonthPrefix);
      } else if (timePeriod === 'year') {
        const currentYearPrefix = new Date().getFullYear().toString(); // YYYY
        matchesTime = expenseDateStr.startsWith(currentYearPrefix);
      }

      return matchesSearch && matchesCategory && matchesTime;
    }).sort((a, b) => b.date.localeCompare(a.date)); // descending date
  }, [expenses, searchTerm, selectedCategory, timePeriod]);

  // Total aggregator of current subset
  const subsetTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4" id="ios-ledger-viewport">
      {/* Search Input Bar (iOS Cupertino Style) */}
      <div className="relative">
        <span className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search descriptions, stores, tags..."
          className="w-full text-sm pl-10 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-neutral-800 text-neutral-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-xs"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Segmented Period Controls (Cupertino segment bar lookalike) */}
      <div className="bg-gray-100 dark:bg-neutral-800/80 p-0.5 rounded-xl flex">
        {(['all', 'today', 'week', 'month', 'year'] as PeriodFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setTimePeriod(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${
              timePeriod === tab
                ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Horizontal categories scroll filter */}
      <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 scrollbar-none touch-pan-x scroll-smooth" id="categories-scroll-filter">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 hover:brightness-105 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md'
              : 'bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-800'
          }`}
        >
          All categories
        </button>
        {SYSTEM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 active:scale-95 hover:brightness-105 cursor-pointer ${
              selectedCategory === cat.id
                ? 'text-white shadow-md'
                : 'bg-white dark:bg-[#1C1C1E] text-neutral-600 dark:text-neutral-400 border border-gray-100 dark:border-neutral-800'
            }`}
            style={{ 
              backgroundColor: selectedCategory === cat.id ? cat.color : undefined 
            }}
          >
            <CategoryIcon name={cat.icon} size={11} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subset Dashboard Counter (Group summary header) */}
      <div className="p-4 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 font-mono block">
            Filtered Total ({filteredExpenses.length} items)
          </span>
          <span className="text-2xl font-black block mt-0.5">
            {formatCurrency(subsetTotal, currencySymbol)}
          </span>
        </div>
        <div className="opacity-90">
          <Filter size={24} />
        </div>
      </div>

      {/* Expenses Ledger List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filteredExpenses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-12 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-neutral-800"
            >
              <AlertCircle className="mx-auto text-neutral-400 mb-2" size={32} />
              <p className="text-sm font-semibold text-neutral-500">No transactions match your filter</p>
              <p className="text-xs text-neutral-400 mt-1">Try resetting search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setTimePeriod('all');
                }}
                className="mt-4 text-xs font-bold text-blue-500 hover:underline"
              >
                Reset Filter
              </button>
            </motion.div>
          ) : (
            filteredExpenses.map((expense) => {
              const cat = getCategoryById(expense.categoryId);
              const isSwiped = swipeActiveId === expense.id;
              
              return (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-neutral-850 shadow-xs"
                >
                  {/* Swipe reveal action drawer underneath */}
                  <div className="absolute inset-y-0 right-0 w-36 bg-red-500 flex items-center justify-end pr-5 gap-4">
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="h-full px-5 text-white flex flex-col items-center justify-center hover:bg-red-650 transition-colors cursor-pointer"
                      title="Confirm Delete"
                    >
                      <Trash2 size={18} />
                      <span className="text-[10px] font-bold uppercase mt-1">Delete</span>
                    </button>
                  </div>

                  {/* Main Sliding expense item front-plate */}
                  <motion.div
                    animate={{ x: isSwiped ? -120 : 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                    onClick={() => {
                      // Close other swipes
                      if (swipeActiveId) {
                        setSwipeActiveId(null);
                      } else {
                        onEditExpense(expense);
                      }
                    }}
                    className="p-4 bg-white dark:bg-[#1C1C1E] flex items-center justify-between relative z-10 cursor-pointer select-none border-b border-neutral-50 dark:border-neutral-900 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Swipe toggler for screen reader or tiny tap helper */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSwipeActiveId(isSwiped ? null : expense.id);
                        }}
                        className="p-1 -ml-1 text-neutral-300 dark:text-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-400 active:scale-95 transition-all"
                        title="Slide action"
                      >
                        <ChevronRight size={14} className={`transform transition-transform duration-200 ${isSwiped ? 'rotate-180 text-blue-500' : ''}`} />
                      </button>

                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={18} />
                      </div>

                      <div className="max-w-[140px] xs:max-w-xs md:max-w-md">
                        <span className="font-semibold text-sm text-neutral-850 dark:text-neutral-100 line-clamp-1">
                          {expense.description}
                        </span>
                        {expense.notes && (
                          <span className="text-[11px] text-neutral-400 line-clamp-1 block italic">
                            "{expense.notes}"
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5 block flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="font-black text-sm text-neutral-950 dark:text-white">
                        -{formatCurrency(expense.amount, currencySymbol)}
                      </span>
                      <div className="flex flex-col gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditExpense(expense);
                          }}
                          className="p-1 rounded-md text-neutral-400 hover:text-blue-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
