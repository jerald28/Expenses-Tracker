import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

app.use(express.json());

// Type interfaces matching types.ts
interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  notes?: string;
}

interface MonthlyBudget {
  limit: number;
  isEnabled: boolean;
}

interface DBState {
  expenses: Expense[];
  budget: MonthlyBudget;
  currency: string;
  theme: string;
}

// Initial seed default state
const SEED_DATE_TODAY = new Date().toISOString().split('T')[0];
const SEED_DATE_YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const SEED_DATE_2DAYSAGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const INITIAL_DB: DBState = {
  expenses: [],
  budget: { limit: 10000, isEnabled: true },
  currency: '₱',
  theme: 'light'
};

// Data helper methods
const readState = (): DBState => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading database file:', e);
  }
  return INITIAL_DB;
};

const writeState = (state: DBState): boolean => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing database file:', e);
    return false;
  }
};

// API: Check health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', datetime: new Date().toISOString() });
});

// API: Read all state
app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(state);
});

// API: Bulk update state (Syncing from frontend)
app.post('/api/state', (req, res) => {
  const newState = req.body as DBState;
  
  if (!newState || !Array.isArray(newState.expenses)) {
    res.status(400).json({ error: 'Invalid state structure.' });
    return;
  }

  const success = writeState(newState);
  if (success) {
    res.json({ success: true, message: 'App state updated successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to write application storage data to disk.' });
  }
});

// API: Get expenses list
app.get('/api/expenses', (req, res) => {
  const state = readState();
  res.json(state.expenses);
});

// API: Save / Edit expense
app.post('/api/expenses', (req, res) => {
  const expense = req.body as Expense;
  if (!expense || !expense.description || typeof expense.amount !== 'number') {
    res.status(400).json({ error: 'Invalid transaction parameters.' });
    return;
  }

  const state = readState();
  const existingIndex = state.expenses.findIndex(item => item.id === expense.id);

  if (existingIndex > -1) {
    state.expenses[existingIndex] = expense;
  } else {
    state.expenses.unshift(expense);
  }

  writeState(state);
  res.json({ success: true, expense });
});

// API: Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const state = readState();
  state.expenses = state.expenses.filter(item => item.id !== id);
  writeState(state);
  res.json({ success: true, message: `Removed expense ID: ${id}` });
});

// API: Update Budget
app.post('/api/budget', (req, res) => {
  const payload = req.body as { limit: number };
  if (payload === undefined || typeof payload.limit !== 'number') {
    res.status(400).json({ error: 'Invalid budget parameters.' });
    return;
  }

  const state = readState();
  state.budget.limit = payload.limit;
  writeState(state);
  res.json({ success: true, budget: state.budget });
});

// API: Update Currency
app.post('/api/currency', (req, res) => {
  const payload = req.body as { currency: string };
  if (!payload || !payload.currency) {
    res.status(400).json({ error: 'Invalid currency parameters.' });
    return;
  }

  const state = readState();
  state.currency = payload.currency;
  writeState(state);
  res.json({ success: true, currency: state.currency });
});

// API: Update Theme
app.post('/api/theme', (req, res) => {
  const payload = req.body as { theme: string };
  if (!payload || !payload.theme) {
    res.status(400).json({ error: 'Invalid theme parameters.' });
    return;
  }

  const state = readState();
  state.theme = payload.theme;
  writeState(state);
  res.json({ success: true, theme: state.theme });
});

// Vite middleware configuration for serving the frontend in production / development
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

setupServer();
