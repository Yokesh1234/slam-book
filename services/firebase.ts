import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHrWVchcWOT31By3AtnEzvLxYy-VzrLKw",
  authDomain: "slam-book-app-85578.firebaseapp.com",
  projectId: "slam-book-app-85578",
  storageBucket: "slam-book-app-85578.appspot.com", // ✅ FIXED
  messagingSenderId: "685811264602",
  appId: "1:685811264602:web:ace07970a6098e91a87c63"
};

// Initialize Firebase safely (no duplicate app error)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
