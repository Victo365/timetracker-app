import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyArQYSKaYvosXltnWEPs9q7rkUlJv81-IU",
  authDomain: "relatoria-de-horas.firebaseapp.com",
  projectId: "relatoria-de-horas",
  storageBucket: "relatoria-de-horas.firebasestorage.app",
  messagingSenderId: "121444750985",
  appId: "1:121444750985:web:08de893c897073e1725858",
  measurementId: "G-58B217L399"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore
export const db = getFirestore(app);
export { auth };