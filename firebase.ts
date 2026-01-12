
import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Offline Persistence
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn('Firestore persistence failed: Browser not supported');
        }
    });
}
