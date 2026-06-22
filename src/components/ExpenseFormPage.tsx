import React, { useState, useEffect } from 'react';
import { Expense } from '../types.ts';
import { SYSTEM_CATEGORIES } from '../constants.ts';
import CategoryIcon from './CategoryIcon.tsx';
import { Calendar, Tag, FileText, Check, Trash2, ArrowLeft } from 'lucide-react';

interface ExpenseFormPageProps {
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  expenseToEdit?: Expense | null;
  currencySymbol: string;
}

export default function ExpenseFormPage({
  onClose,
  onSave,
  onDelete,
  expenseToEdit,
  currencySymbol
}: ExpenseFormPageProps) {
  // State variables for form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Hydrate fields if editing
  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setCategoryId(expenseToEdit.categoryId);
      setDate(expenseToEdit.date);
      setNotes(expenseToEdit.notes || '');
    } else {
      // Defaults for a new entry
      setDescription('');
      setAmount('');
      setCategoryId('food');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [expenseToEdit]);

  // Form submission dispatcher
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!description.trim()) {
      setError('Please add a merchant name or description.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a positive valid amount.');
      return;
    }

    if (!date) {
      setError('Please specify the transaction date.');
      return;
    }

    onSave({
      ...(expenseToEdit && { id: expenseToEdit.id }),
      description: description.trim(),
      amount: parsedAmount,
      categoryId,
      date,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="space-y-6" id="add-expense-page-container">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            type="button"
            className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer active:scale-95"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {expenseToEdit ? 'Edit Transaction' : 'Record Expense'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {expenseToEdit ? 'Customize entry parameters' : 'Log a brand new expense session'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Amount Input Layout */}
        <div className="bg-white dark:bg-[#151518] rounded-2xl p-5 border border-neutral-200/40 dark:border-neutral-800/50 space-y-2 text-center">
          <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
            Transaction Amount
          </label>
          <div className="relative inline-flex items-center justify-center max-w-xs mx-auto">
            <span className="text-3xl font-black text-neutral-400 dark:text-neutral-600 mr-2 select-none">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-center text-4xl font-black bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-blue-500 text-neutral-950 dark:text-white outline-hidden py-1 px-2 placeholder-neutral-300 dark:placeholder-neutral-700"
              autoFocus
              required
            />
          </div>
        </div>

        {/* Fields and Category Grid container card */}
        <div className="bg-white dark:bg-[#151518] rounded-2xl p-5 border border-neutral-200/40 dark:border-neutral-800/50 space-y-4">
          
          {/* Merchant DESCRIPTION */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText size={12} /> Merchant / Description
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Starbucks, Grocery store, Grab taxi"
              className="w-full text-sm p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/60 text-neutral-950 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction DATE */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar size={12} /> Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/60 text-neutral-950 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                required
              />
            </div>

            {/* Notes details */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 uppercase tracking-wider">
                Details (Optional)
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. dinner with friends, travel details"
                className="w-full text-sm p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/60 text-neutral-950 dark:text-white focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Category layout */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag size={12} /> Select Category
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="grid-category-selection">
              {SYSTEM_CATEGORIES.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3 rounded-xl flex flex-row items-center gap-2 text-left transition-all cursor-pointer border ${
                      isSelected 
                        ? 'text-white font-bold border-transparent' 
                        : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200/40 dark:border-neutral-800/60 hover:brightness-95 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? cat.color : undefined,
                    }}
                  >
                    <div 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20' : 'bg-white dark:bg-neutral-800 shadow-xs'
                      }`}
                      style={{ color: isSelected ? '#FFFFFF' : cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={13} />
                    </div>
                    <span className="text-xs tracking-tight truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Save & Delete actions */}
        <div className="flex gap-3.5 pt-3">
          {expenseToEdit && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(expenseToEdit.id);
                onClose();
              }}
              className="flex-1 p-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Delete this transaction"
            >
              <Trash2 size={16} /> Delete Entry
            </button>
          )}
          
          <button
            type="submit"
            className="flex-3 p-3.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Check size={16} /> Save Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
