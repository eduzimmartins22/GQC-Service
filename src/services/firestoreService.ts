import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { FIREBASE_DB } from '../config/firebase';

// ── USERS (Usuários)
export const usersService = {
  // Criar usuário (APÓS registrar no Firebase Auth)
  createUser: async (userId: string, userData: any) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'users', userId), {
        ...userData,
        createdAt: Timestamp.now()
      });
      return { success: true };
    } catch {
      // Se não existe, cria
      await addDoc(collection(FIREBASE_DB, 'users'), {
        id: userId,
        ...userData,
        createdAt: Timestamp.now()
      });
      return { success: true };
    }
  },

  // Obter usuário
  getUser: async (userId: string) => {
    try {
      const snap = await getDoc(doc(FIREBASE_DB, 'users', userId));
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  // Obter todos os usuários
  getAllUsers: async () => {
    try {
      const snapshot = await getDocs(collection(FIREBASE_DB, 'users'));
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
};

// ── TICKETS (Chamados)
export const ticketsService = {
  // Criar chamado
  createTicket: async (ticketData: any) => {
    try {
      const docRef = await addDoc(collection(FIREBASE_DB, 'tickets'), {
        ...ticketData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return { success: false, error };
    }
  },

  // Obter chamados do cliente
  getClientTickets: async (clientId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return [];
    }
  },

  // Obter chamados do técnico
  getTechnicianTickets: async (techId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('technicianId', '==', techId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return [];
    }
  },

  // Obter todos os chamados
  getAllTickets: async () => {
    try {
      const snapshot = await getDocs(collection(FIREBASE_DB, 'tickets'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return [];
    }
  },

  // Atualizar chamado
  updateTicket: async (ticketId: string, updates: any) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'tickets', ticketId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      return { success: false, error };
    }
  },

  // Deletar chamado
  deleteTicket: async (ticketId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'tickets', ticketId));
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar chamado:', error);
      return { success: false, error };
    }
  },

  // Listener em tempo real (novo!)
  subscribeToClientTickets: (clientId: string, callback: any) => {
    const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
    return onSnapshot(q, snapshot => {
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(tickets);
    });
  }
};
