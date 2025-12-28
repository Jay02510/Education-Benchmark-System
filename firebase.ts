
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in the Firebase Console -> Project Settings -> General -> Your Apps
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
