if (typeof window === 'undefined') {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      // @ts-ignore
      delete globalThis.localStorage;
    } catch (e) {}
  }
}

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage }from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: You need to replace the placeholder values below with your actual
// Firebase project's configuration. You can find these in your Firebase
// project settings.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
// This check prevents an error when the environment variables are not set.
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  console.warn("Firebase config is missing. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set.");
  // Provide a dummy app to prevent the app from crashing.
  // This will result in Firebase features failing, but the app itself will run.
  app = !getApps().length ? initializeApp({}) : getApp();
}


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };