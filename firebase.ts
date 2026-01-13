import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEU4LcXgR4fby4-PgwYh_HRrucWkQ9S4I",
  authDomain: "benchmark-ai-app.firebaseapp.com",
  projectId: "benchmark-ai-app",
  storageBucket: "benchmark-ai-app.firebasestorage.app",
  messagingSenderId: "473159328676",
  appId: "1:473159328676:web:85cb8024d9bf0c92e7d731"
};

// Singleton initialization pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Offline Persistence with error handling to prevent startup crashes
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence: multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence: not supported');
        }
    });
}