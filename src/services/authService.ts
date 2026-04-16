import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../config/firebase';

export const authService = {
  register: async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await signOut(FIREBASE_AUTH);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(FIREBASE_AUTH, callback);
  },
};
