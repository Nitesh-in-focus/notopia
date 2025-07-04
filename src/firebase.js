// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD7QF3P_R30UG2STQKh1UF7jTiI9yU0VKs",
  authDomain: "notopia-ff103.firebaseapp.com",
  projectId: "notopia-ff103",
  storageBucket: "notopia-ff103.firebasestorage.app",
  messagingSenderId: "774125536351",
  appId: "1:774125536351:web:f61bed1bfe04955e4687ea",
  measurementId: "G-DETRS0C444",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Firestore with modern offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// ✅ Auth
export const auth = getAuth(app);
export { db };
