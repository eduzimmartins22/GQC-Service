// Importações necessárias
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAKxBuQSD8VLccdxAqfRkf65jZVl9M_uEw",
  authDomain: "gcq-manuntencoes.firebaseapp.com",
  projectId: "gcq-manuntencoes",
  storageBucket: "gcq-manuntencoes.firebasestorage.app",
  messagingSenderId: "627901093530",
  appId: "1:627901093530:web:07ccdeeae99401d328f123"
};


const app = initializeApp(firebaseConfig);


export const FIREBASE_APP = app;
export const FIREBASE_AUTH = getAuth(app);
export const FIREBASE_DB = getFirestore(app);