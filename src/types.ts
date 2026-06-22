export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon string key
  color: string; // Tailwind bg color class prefix or hex
  textColor: string; // Tailwind text color class
  borderColor: string; // Tailwind border styling
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string format YYYY-MM-DD
  categoryId: string;
  notes?: string;
}

export interface MonthlyBudget {
  limit: number;
  isEnabled: boolean;
}

export type TabType = 'dashboard' | 'history' | 'add' | 'settings';
export type ThemeType = 'light' | 'dark';
