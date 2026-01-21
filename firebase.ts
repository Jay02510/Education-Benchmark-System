
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEU4LcXgR4fby4-PgwYh_HRrucWkQ9S4I",
  authDomain: "benchmark-ai-app.firebaseapp.com",
  projectId: "benchmark-ai-app",
  storageBucket: "benchmark-ai-app.firebasestorage.app",
  messagingSenderId: "473159328676",
  appId: "1:473159328676:web:85cb8024d9bf0c92e7d731"
};

// Singleton pattern for Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services with the explicit app instance
export const auth = getAuth(app);

// Use modern Firestore initialization with persistent local cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
