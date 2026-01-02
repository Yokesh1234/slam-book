
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * PRODUCTION NOTE: Replace the placeholders below with your actual Firebase project settings.
 * You can find these in your Firebase Console: Project Settings > General > Your apps.
 */
const firebaseConfig = {

  apiKey: "AIzaSyBHrWVchcWOT31By3AtnEzvLxYy-VzrLKw",

  authDomain: "slam-book-app-85578.firebaseapp.com",

  projectId: "slam-book-app-85578",

  storageBucket: "slam-book-app-85578.firebasestorage.app",

  messagingSenderId: "685811264602",

  appId: "1:685811264602:web:ace07970a6098e91a87c63"

};


// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Simple check to warn if the config is still using placeholders
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase configuration placeholders detected. Please update services/firebase.ts with your credentials.");
}
