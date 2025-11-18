import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBFANMQuATp0aKJaavSOHuV_52aRSERBx4",
  authDomain: "topx-app.firebaseapp.com",
  projectId: "topx-app",
  // storageBucket: "topx-app.firebasestorage.app",
  storageBucket: "topx-app.appspot.com",
  messagingSenderId: "711505854276",
  appId: "1:711505854276:web:89a1fa2cee940a594be111",
  measurementId: "G-7MLWWG8KDJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// Simple no-op function - reCAPTCHA handled automatically by Firebase
export const initializeRecaptcha = async () => {
  // Firebase v9+ handles reCAPTCHA automatically
  // No manual initialization needed
  return Promise.resolve();
};

export { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

export default app;