import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvcrZt1Z6SGUVcBIhfeGKnLuk-2I_J2Ds",
  authDomain: "the-house-app-23225.firebaseapp.com",
  projectId: "the-house-app-23225",
  storageBucket: "the-house-app-23225.firebasestorage.app",
  messagingSenderId: "85518695125",
  appId: "1:85518695125:android:04f1db11f25f20ee79005c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc
};
