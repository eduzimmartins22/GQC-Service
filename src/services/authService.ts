import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../config/firebase';

export const authService = {
  // Registrar novo usuário
  register: async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(FIREBASE_AUTH);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Monitora usuário autenticado
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(FIREBASE_AUTH, callback);
  }
};
