import {
  collection, getDocs, getDoc, setDoc,
  updateDoc, deleteDoc, doc, query, where,
  onSnapshot, Timestamp,
} from 'firebase/firestore';
import { FIREBASE_DB } from '../config/firebase';
import { User, Ticket, Notification, ChatMessage } from '../types';

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersService = {
  upsertUser: async (userId: string, userData: Partial<User & { password?: string }>) => {
    try {
      const clean = Object.fromEntries(
        Object.entries({ ...userData, updatedAt: new Date().toISOString() })
          .filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(FIREBASE_DB, 'users', userId), clean, { merge: true });
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] upsertUser error:', error);
      return { success: false, error: error.message };
    }
  },

  getUser: async (userId: string): Promise<(User & { password?: string }) | null> => {
    try {
      const snap = await getDoc(doc(FIREBASE_DB, 'users', userId));
      return snap.exists() ? (snap.data() as User & { password?: string }) : null;
    } catch (error: any) {
      console.error('[Firestore] getUser error:', error);
      return null;
    }
  },

  getAllUsers: async (): Promise<(User & { password?: string })[]> => {
    try {
      const snapshot = await getDocs(collection(FIREBASE_DB, 'users'));
      return snapshot.docs.map(d => d.data() as User & { password?: string });
    } catch (error: any) {
      console.error('[Firestore] getAllUsers error:', error);
      return [];
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'users', userId));
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] deleteUser error:', error);
      return { success: false, error: error.message };
    }
  },
};

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const ticketsService = {
  createTicket: async (ticketData: Ticket) => {
    try {
      // Firestore não aceita campos undefined — remove-os antes de salvar
      const clean = Object.fromEntries(
        Object.entries({
          ...ticketData,
          createdAt: ticketData.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(FIREBASE_DB, 'tickets', ticketData.id), clean);
      console.log('[Firestore] ticket criado:', ticketData.id);
      return { success: true, id: ticketData.id };
    } catch (error: any) {
      console.error('[Firestore] createTicket error:', error);
      return { success: false, error: error.message };
    }
  },

  updateTicket: async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      // Firestore não aceita campos undefined — remove-os antes de salvar
      const clean = Object.fromEntries(
        Object.entries({ ...updates, updatedAt: new Date().toISOString() })
          .filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(FIREBASE_DB, 'tickets', ticketId), clean);
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] updateTicket error:', error);
      return { success: false, error: error.message };
    }
  },

  deleteTicket: async (ticketId: string) => {
    try {
      await deleteDoc(doc(FIREBASE_DB, 'tickets', ticketId));
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] deleteTicket error:', error);
      return { success: false, error: error.message };
    }
  },

  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      const snap = await getDocs(collection(FIREBASE_DB, 'tickets'));
      return snap.docs.map(d => d.data() as Ticket);
    } catch (error: any) {
      console.error('[Firestore] getAllTickets error:', error);
      return [];
    }
  },

  getClientTickets: async (clientId: string): Promise<Ticket[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Ticket);
    } catch (error: any) {
      console.error('[Firestore] getClientTickets error:', error);
      return [];
    }
  },

  deleteClientTickets: async (clientId: string) => {
    try {
      const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] deleteClientTickets error:', error);
      return { success: false, error: error.message };
    }
  },

  // Listener em tempo real — TODOS os tickets (para técnico)
  subscribeToAllTickets: (callback: (tickets: Ticket[]) => void): (() => void) => {
    console.log('[Firestore] subscribeToAllTickets iniciado');
    const unsub = onSnapshot(
      collection(FIREBASE_DB, 'tickets'),
      (snap) => {
        const tickets = snap.docs.map(d => d.data() as Ticket);
        console.log('[Firestore] tickets recebidos (técnico):', tickets.length);
        callback(tickets);
      },
      (error) => {
        console.error('[Firestore] subscribeToAllTickets erro:', error.code, error.message);
      }
    );
    return unsub;
  },

  // Listener em tempo real — tickets do cliente
  subscribeToClientTickets: (clientId: string, callback: (tickets: Ticket[]) => void): (() => void) => {
    console.log('[Firestore] subscribeToClientTickets iniciado para:', clientId);
    const q = query(collection(FIREBASE_DB, 'tickets'), where('clientId', '==', clientId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const tickets = snap.docs.map(d => d.data() as Ticket);
        console.log('[Firestore] tickets recebidos (cliente):', tickets.length);
        callback(tickets);
      },
      (error) => {
        console.error('[Firestore] subscribeToClientTickets erro:', error.code, error.message);
      }
    );
    return unsub;
  },
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsService = {
  addNotification: async (notif: Notification) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'notifications', notif.id), notif);
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] addNotification error:', error);
      return { success: false, error: error.message };
    }
  },

  markRead: async (notifId: string) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'notifications', notifId), { read: true });
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] markRead error:', error);
      return { success: false, error: error.message };
    }
  },

  markAllRead: async (userId: string) => {
    try {
      const q = query(
        collection(FIREBASE_DB, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] markAllRead error:', error);
      return { success: false, error: error.message };
    }
  },

  subscribeToUserNotifications: (userId: string, callback: (notifs: Notification[]) => void): (() => void) => {
    console.log('[Firestore] subscribeToUserNotifications iniciado para:', userId);
    const q = query(collection(FIREBASE_DB, 'notifications'), where('userId', '==', userId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map(d => d.data() as Notification));
      },
      (error) => {
        console.error('[Firestore] subscribeToUserNotifications erro:', error.code, error.message);
      }
    );
    return unsub;
  },
};

// ─── MESSAGES (CHAT) ──────────────────────────────────────────────────────────
export const messagesService = {
  sendMessage: async (msg: ChatMessage) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'messages', msg.id), msg);
      return { success: true };
    } catch (error: any) {
      console.error('[Firestore] sendMessage error:', error);
      return { success: false, error: error.message };
    }
  },

  getTicketMessages: async (ticketId: string): Promise<ChatMessage[]> => {
    try {
      const q = query(collection(FIREBASE_DB, 'messages'), where('ticketId', '==', ticketId));
      const snap = await getDocs(q);
      const msgs = snap.docs.map(d => d.data() as ChatMessage);
      return msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch (error: any) {
      console.error('[Firestore] getTicketMessages error:', error);
      return [];
    }
  },

  subscribeToTicketMessages: (ticketId: string, callback: (msgs: ChatMessage[]) => void): (() => void) => {
    const q = query(collection(FIREBASE_DB, 'messages'), where('ticketId', '==', ticketId));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map(d => d.data() as ChatMessage);
        callback(msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      },
      (error) => {
        console.error('[Firestore] subscribeToTicketMessages erro:', error.code, error.message);
      }
    );
    return unsub;
  },
};
