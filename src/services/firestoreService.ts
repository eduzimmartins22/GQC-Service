import {
  collection, addDoc, getDocs, getDoc, setDoc,
  updateDoc, deleteDoc, doc, query, where,
  onSnapshot, Timestamp, orderBy,
} from 'firebase/firestore';
import { FIREBASE_DB } from '../config/firebase';
import { User, Ticket, Notification, ChatMessage } from '../types';

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersService = {
  // Cria/atualiza documento do usuário usando o uid como ID do doc
  upsertUser: async (userId: string, userData: Partial<User & { password?: string }>) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'users', userId), {
        ...userData,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getUser: async (userId: string): Promise<(User & { password?: string }) | null> => {
    try {
      const snap = await getDoc(doc(FIREBASE_DB, 'users', userId));
      return snap.exists() ? (snap.data() as User & { password?: string }) : null;
    } catch {
      return null;
    }
  },

  getAllUsers: async (): Promise<(User & { password?: string })[]> => {
    try {
      const snapshot = await getDocs(collection(FIREBASE_DB, 'users'));
      return snapshot.docs.map(d => d.data() as User & { password?: string });
    } catch {
      return [];
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'users', userId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const ticketsService = {
  createTicket: async (ticketData: Omit<Ticket, 'id'> & { id?: string }) => {
    try {
      // Usa o id gerado localmente como ID do documento Firestore
      const id = ticketData.id ?? `t${Date.now()}`;
      await setDoc(doc(FIREBASE_DB, 'tickets', id), {
        ...ticketData,
        id,
        createdAt: ticketData.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateTicket: async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'tickets', ticketId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  deleteTicket: async (ticketId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'tickets', ticketId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const snap = await getDocs(collection(FIREBASE_DB, 'tickets'));
      return snap.docs.map(d => d.data() as Ticket);
    } catch {
      return [];
    }
  },

  getClientTickets: async (clientId: string): Promise<Ticket[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Ticket);
    } catch {
      return [];
    }
  },

  getTechnicianTickets: async (techId: string): Promise<Ticket[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('technicianId', '==', techId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Ticket);
    } catch {
      return [];
    }
  },

  deleteClientTickets: async (clientId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const deletes = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletes);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Listener em tempo real para todos os chamados
  subscribeToAllTickets: (callback: (tickets: Ticket[]) => void) => {
    return onSnapshot(collection(FIREBASE_DB, 'tickets'), snap => {
      callback(snap.docs.map(d => d.data() as Ticket));
    });
  },

  // Listener em tempo real para chamados do cliente
  subscribeToClientTickets: (clientId: string, callback: (tickets: Ticket[]) => void) => {
    const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => d.data() as Ticket));
    });
  },
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsService = {
  addNotification: async (notif: Notification) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'notifications', notif.id), notif);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'notifications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Notification);
    } catch {
      return [];
    }
  },

  markRead: async (notifId: string) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'notifications', notifId), { read: true });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  markAllRead: async (userId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'notifications'), where('userId', '==', userId), where('read', '==', false));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  subscribeToUserNotifications: (userId: string, callback: (notifs: Notification[]) => void) => {
    const q = query(collection(FIREBASE_DB, 'notifications'), where('userId', '==', userId));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => d.data() as Notification));
    });
  },
};

// ─── MESSAGES (CHAT) ──────────────────────────────────────────────────────────
export const messagesService = {
  sendMessage: async (msg: ChatMessage) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'messages', msg.id), msg);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getTicketMessages: async (ticketId: string): Promise<ChatMessage[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'messages'), where('ticketId', '==', ticketId));
      const snap = await getDocs(q);
      const msgs = snap.docs.map(d => d.data() as ChatMessage);
      return msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  },

  subscribeToTicketMessages: (ticketId: string, callback: (msgs: ChatMessage[]) => void) => {
    const q = query(collection(FIREBASE_DB, 'messages'), where('ticketId', '==', ticketId));
    return onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => d.data() as ChatMessage);
      callback(msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    });
  },
};
