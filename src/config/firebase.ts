import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️  SUBSTITUA pelos dados do seu projeto:
// Firebase Console → ⚙️ Configurações → Apps → Aplicativo Web (</>)
const firebaseConfig = {
  apiKey: "SEU_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-id",
  appId: "seu-app-id",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB   = getFirestore(FIREBASE_APP);
