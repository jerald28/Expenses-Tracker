import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

// Firebase configuration (project: pesus-tracker-9453a)
// Note: Firebase web config values are public identifiers, not secrets.
// Access is protected by Firestore security rules and Auth authorized domains.
const firebaseConfig = {
  apiKey: "AIzaSyBGV5L8z6H4awoVkdhaUjSTnqjUPOQ-POM",
  authDomain: "pesus-tracker-9453a.firebaseapp.com",
  projectId: "pesus-tracker-9453a",
  storageBucket: "pesus-tracker-9453a.firebasestorage.app",
  messagingSenderId: "125069845800",
  appId: "1:125069845800:web:bccbd3101abf53ed951c1d",
  firestoreDatabaseId: "(default)"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const firebaseApp = app;
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || "(default)";

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
