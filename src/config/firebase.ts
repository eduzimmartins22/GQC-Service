import { initializeApp } from 'firebase/app';
import { getAuth } from 'src/firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKxBuQSD8VLccdxAqfRkf65jZVl9M_uEw",
  authDomain: "gcq-manuntencoes.firebaseapp.com",
  projectId: "gcq-manuntencoes",
  storageBucket: "gcq-manuntencoes.firebasestorage.app",
  messagingSenderId: "627901093530",
  appId: "1:627901093530:web:07ccdeeae99401d328f123"
};

export const FIREBASE_APP  = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB   = getFirestore(FIREBASE_APP);
