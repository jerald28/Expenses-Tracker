import { Category } from './types.ts';

export const SYSTEM_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#FF9500', // Apple Orange
    textColor: 'text-orange-500',
    borderColor: 'border-orange-200 dark:border-orange-950',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#FF2D55', // Apple Pink
    textColor: 'text-pink-500',
    borderColor: 'border-pink-200 dark:border-pink-950',
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#007AFF', // Apple Blue
    textColor: 'text-blue-500',
    borderColor: 'border-blue-200 dark:border-blue-950',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#AF52DE', // Apple Purple
    textColor: 'text-purple-500',
    borderColor: 'border-purple-200 dark:border-purple-950',
  },
  {
    id: 'bills',
    name: 'Housing & Bills',
    icon: 'Home',
    color: '#34C759', // Apple Green
    textColor: 'text-green-500',
    borderColor: 'border-green-200 dark:border-green-950',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'Heart',
    color: '#FF3B30', // Apple Red
    textColor: 'text-red-500',
    borderColor: 'border-red-200 dark:border-red-950',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'Plane',
    color: '#5856D6', // Apple Indigo
    textColor: 'text-indigo-500',
    borderColor: 'border-indigo-200 dark:border-indigo-950',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: '#30B0C7', // Apple Teal
    textColor: 'text-teal-500',
    borderColor: 'border-teal-200 dark:border-teal-950',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'HelpCircle',
    color: '#8E8E93', // Apple Gray
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200 dark:border-gray-800',
  }
];

export const formatCurrency = (amount: number, currencySymbol: string = '$'): string => {
  return `${currencySymbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getCategoryById = (categoryId: string): Category => {
  return SYSTEM_CATEGORIES.find((cat) => cat.id === categoryId) || SYSTEM_CATEGORIES[SYSTEM_CATEGORIES.length - 1];
};
