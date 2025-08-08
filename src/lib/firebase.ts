
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDzfjJoXHXUxBxV8vQidAz7oFCEy5CSJTI",
  authDomain: "retailer-emi-assist-kiwfo.firebaseapp.com",
  projectId: "retailer-emi-assist-kiwfo",
  storageBucket: "retailer-emi-assist-kiwfo.firebasestorage.app",
  messagingSenderId: "167466574794",
  appId: "1:167466574794:web:07102b06a5d2478c4ae533"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
