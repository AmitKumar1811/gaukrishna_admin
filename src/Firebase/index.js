// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getFunctions } from "firebase/functions";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyUntukTesting00000000000",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gaukrishna-be8c8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gaukrishna-be8c8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gaukrishna-be8c8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:1234567890123456789012",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app, "gaukrishna-be8c8.firebasestorage.app");
export const messaging = getMessaging(app);
export const functions = getFunctions(app, "us-central1");
export default app;
