import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// Firebase configuration from /firebase-applet-config.json
const firebaseConfig = {
  projectId: "bold-syntax-0wfkz",
  appId: "1:469735694860:web:4b848729e50fa1c0000429",
  apiKey: "AIzaSyAIB8az3EmuWFeseRxy9yIA3VcxdYBrg48",
  authDomain: "bold-syntax-0wfkz.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-407a12e3-f00b-45ae-b37f-578b2674aa84",
  storageBucket: "bold-syntax-0wfkz.firebasestorage.app",
  messagingSenderId: "469735694860",
  measurementId: ""
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Auth helper functions
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Sync interface & types
import { Expense, MonthlyBudget } from '../types.ts';

export interface UserSettings {
  currency: string;
  budgetLimit: number;
  budgetEnabled: boolean;
  theme: string;
}

// Utility to recursively strip undefined values so Firestore does not throw errors
const removeUndefined = (obj: any): any => {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        result[key] = removeUndefined(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  });
  return result;
};

// Ensure user profile and fallback settings exist in Firestore
export const syncUserSettings = async (user: User, localSettings?: { currency: string; budget: MonthlyBudget; theme: string }): Promise<UserSettings> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      currency: data.currency || '₱',
      budgetLimit: typeof data.budgetLimit === 'number' ? data.budgetLimit : 10000,
      budgetEnabled: typeof data.budgetEnabled === 'boolean' ? data.budgetEnabled : true,
      theme: data.theme || 'light'
    };
  } else {
    // If user is brand new, create their configuration with current local settings or defaults
    const newSettings: UserSettings = {
      currency: localSettings?.currency || '₱',
      budgetLimit: localSettings?.budget?.limit || 10000,
      budgetEnabled: localSettings?.budget?.isEnabled !== false,
      theme: localSettings?.theme || 'light'
    };
    await setDoc(userDocRef, removeUndefined({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      ...newSettings,
      updatedAt: new Date()
    }));
    return newSettings;
  }
};

// Update specific user settings in Firestore
export const updateDbSettings = async (user: User, settings: Partial<UserSettings>) => {
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, removeUndefined({
    ...settings,
    updatedAt: new Date()
  }), { merge: true });
};

// Fetch user expenses from Firestore
export const fetchUserExpensesFromDb = async (user: User): Promise<Expense[]> => {
  const expensesColRef = collection(db, 'users', user.uid, 'expenses');
  const q = query(expensesColRef, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  
  const fetched: Expense[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    fetched.push({
      id: data.id || docSnap.id,
      amount: data.amount,
      description: data.description,
      date: data.date,
      categoryId: data.categoryId,
      notes: data.notes
    });
  });
  return fetched;
};

// Save single expense to Firestore
export const saveUserExpenseToDb = async (user: User, expense: Expense) => {
  const expenseDocRef = doc(db, 'users', user.uid, 'expenses', expense.id);
  await setDoc(expenseDocRef, removeUndefined({
    ...expense,
    createdAt: new Date()
  }));
};

// Delete single expense from Firestore
export const deleteUserExpenseFromDb = async (user: User, expenseId: string) => {
  const expenseDocRef = doc(db, 'users', user.uid, 'expenses', expenseId);
  await deleteDoc(expenseDocRef);
};

// Merge offline/local expenses into firestore when signing in for the first time
export const mergeLocalExpensesToDb = async (user: User, localExpenses: Expense[]) => {
  if (localExpenses.length === 0) return;
  const batch = writeBatch(db);
  localExpenses.forEach((exp) => {
    const ref = doc(db, 'users', user.uid, 'expenses', exp.id);
    batch.set(ref, removeUndefined({
      ...exp,
      createdAt: new Date()
    }), { merge: true });
  });
  await batch.commit();
};

// Delete all user expenses from Firestore
export const clearAllUserExpensesFromDb = async (user: User) => {
  const expensesColRef = collection(db, 'users', user.uid, 'expenses');
  const snap = await getDocs(expensesColRef);
  const batch = writeBatch(db);
  snap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
};
