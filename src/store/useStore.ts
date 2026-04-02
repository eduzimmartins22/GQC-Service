import { create } from 'zustand/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, Ticket, TicketStatus, TicketPriority, UserRole,
  Notification, RegisterData, ChatMessage,
} from '../types';

// ─── STORAGE KEYS ──────────────────────────────────────────────────────────────
const KEY_TICKETS       = 'gcq_tickets';
const KEY_USERS         = 'gcq_users';
const KEY_NOTIFICATIONS = 'gcq_notifications';
const KEY_MESSAGES      = 'gcq_messages';

// ─── MOCK USERS ────────────────────────────────────────────────────────────────
const SEED_USERS: (User & { password: string })[] = [
  {
    id: 'u_isac', name: 'Isac', cpf: '000.000.000-00',
    email: 'tecnico@gcq.com', password: '123456', role: UserRole.TECHNICIAN,
    phone: '(27) 9988-5314',
    address: { cep: '29166654', street: 'Rua Buriti', number: 'S/N',
      neighborhood: 'Morada de Laranjeiras', city: 'Serra', state: 'ES' },
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'u_tecnico', name: 'Tecnico2', cpf: '111.111.111-11',
    email: 'tecnico2@gcq.com', password: '232323', role: UserRole.TECHNICIAN,
    phone: '(27) 9988-5314',
    address: { cep: '29166654', street: 'Rua Buriti', number: 'S/N',
      neighborhood: 'Morada de Laranjeiras', city: 'Serra', state: 'ES' },
    createdAt: '2026-04-01T08:30:00Z',
  },
  {
    id: 'u_Chico', name: 'Chico', cpf: '222.222.222-22',
    email: 'chico@gmail.com', password: '123123', role: UserRole.CLIENT,
    phone: '(27) 9988-5314',
    address: { cep: '29166654', street: 'Rua Buriti', number: 'S/N',
      neighborhood: 'Morada de Laranjeiras', city: 'Serra', state: 'ES' },
    createdAt: '2026-04-01T08:30:00Z',
  }
];

const SEED_TICKETS: Ticket[] = [
  // Removido: Dados DEMO para começar do zero com cliente real
];

const SEED_NOTIFICATIONS: Notification[] = [
  // Removido: Dados DEMO para começar do zero com cliente real
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

async function save(key: string, value: any) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

async function clearStorage() {
  try {
    await AsyncStorage.removeItem(KEY_USERS);
    await AsyncStorage.removeItem(KEY_TICKETS);
    await AsyncStorage.removeItem(KEY_NOTIFICATIONS);
    await AsyncStorage.removeItem(KEY_MESSAGES);
  } catch { /* ignore */ }
}

// ─── STORE INTERFACE ───────────────────────────────────────────────────────────
interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  notifications: Notification[];
  allMessages: Record<string, ChatMessage[]>; // keyed by ticketId
  hydrated: boolean;

  // Auth
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Tickets
  setSelectedTicket: (ticket: Ticket | null) => void;
  openTicket: (data: {
    title: string; description: string; priority: TicketPriority;
    equipmentId?: string; equipmentTitle?: string;
    subtypeId?: string; subtypeLabel?: string;
    symptoms?: string[]; isOtherProblem?: boolean; extraDetails?: string;
  }) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, finalizationNote?: string) => Promise<void>;
  addNote: (ticketId: string, content: string) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, comment?: string) => Promise<void>;
  refreshTickets: () => Promise<void>;

  // Chat
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  getMessages: (ticketId: string) => ChatMessage[];
  refreshMessages: (ticketId: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Selectors
  getMyTickets: () => Ticket[];
  getClientTickets: (clientId: string) => Ticket[];
  getClientsWithTickets: () => { clientId: string; clientName: string; tickets: Ticket[] }[];
  getMyNotifications: () => Notification[];
  getUnreadCount: () => number;
  getUnreadMessages: (ticketId: string) => number;
}

// ─── STORE ─────────────────────────────────────────────────────────────────────
export const useStore = create<StoreState>((set, get) => ({
  user: null, isAuthenticated: false, isLoading: false,
  authError: null, tickets: SEED_TICKETS, selectedTicket: null,
  notifications: SEED_NOTIFICATIONS, allMessages: {}, hydrated: false,

  // ── Hydrate from AsyncStorage on app start
  hydrate: async () => {
    const tickets       = await load(KEY_TICKETS,       SEED_TICKETS);
    const notifications = await load(KEY_NOTIFICATIONS, SEED_NOTIFICATIONS);
    const messages      = await load(KEY_MESSAGES,      {});
    set({ tickets, notifications, allMessages: messages, hydrated: true });
  },

  // ── Auth
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    await new Promise(r => setTimeout(r, 600));
    // Carregar usuários do AsyncStorage (inclui novos cadastros)
    const users = await load<(User & { password: string })[]>(KEY_USERS, SEED_USERS);
    const found = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _, ...user } = found;
      set({ user, isAuthenticated: true, isLoading: false });
      get().hydrate();
      return true;
    }
    set({ authError: 'E-mail ou senha incorretos.', isLoading: false });
    return false;
  },

  register: async (data) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 800));
    const users = await load<(User & { password: string })[]>(KEY_USERS, SEED_USERS);
    const exists = users.find(u =>
      u.email.toLowerCase() === data.email.toLowerCase() || u.cpf === data.cpf
    );
    if (exists) { set({ isLoading: false }); return { success: false, error: 'E-mail ou CPF já cadastrado.' }; }
    const newUser: User & { password: string } = {
      id: `u${Date.now()}`, name: data.name, cpf: data.cpf,
      email: data.email, phone: data.phone, password: data.password,
      role: UserRole.CLIENT,
      address: { cep: data.cep, street: '', number: data.addressNumber,
        complement: data.complement, neighborhood: '', city: '', state: '' },
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    await save(KEY_USERS, updated);
    const { password: _, ...user } = newUser;
    set({ user, isAuthenticated: true, isLoading: false });
    get().hydrate();
    return { success: true };
  },

  logout: () => set({ user: null, isAuthenticated: false, selectedTicket: null }),

  // ── Tickets
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  openTicket: async (data) => {
    const { user, tickets, notifications } = get();
    if (!user) return;
    const autoTitle = data.equipmentTitle && data.subtypeLabel
      ? `${data.equipmentTitle} — ${data.symptoms?.slice(0,2).join(', ') ?? 'Problema'}`
      : data.title;

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      ticketNumber: `#${String(tickets.length + 1).padStart(4, '0')}`,
      title: autoTitle,
      description: data.description || '',
      status: TicketStatus.OPEN,
      priority: data.priority,
      equipmentId: data.equipmentId,
      equipmentTitle: data.equipmentTitle,
      subtypeId: data.subtypeId,
      subtypeLabel: data.subtypeLabel,
      symptoms: data.symptoms,
      isOtherProblem: data.isOtherProblem,
      extraDetails: data.extraDetails,
      clientId: user.id,
      clientName: user.name,
      clientPhone: user.phone,
      clientCpf: user.cpf,
      clientEmail: user.email,
      clientAddress: user.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [], messages: [],
    };

    const newNotif: Notification = {
      id: `n${Date.now()}`, userId: 'u2',
      title: ' Novo chamado aberto',
      body: `${user.name}: ${autoTitle}`,
      ticketId: newTicket.id, read: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTickets = [newTicket, ...tickets];
    const updatedNotifs  = [newNotif, ...notifications];
    set({ tickets: updatedTickets, notifications: updatedNotifs });
    await save(KEY_TICKETS,       updatedTickets);
    await save(KEY_NOTIFICATIONS, updatedNotifs);
  },

  updateTicketStatus: async (ticketId, status, finalizationNote) => {
    const { tickets, notifications } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    const updated = tickets.map(t =>
      t.id === ticketId ? {
        ...t, status, updatedAt: new Date().toISOString(),
        closedAt: status === TicketStatus.FINISHED ? new Date().toISOString() : t.closedAt,
        finalizationNote: finalizationNote ?? t.finalizationNote,
      } : t
    );
    const newNotifs: Notification[] = [];
    if (ticket) {
      if (status === TicketStatus.IN_PROGRESS) {
        newNotifs.push({ id: `n${Date.now()}`, userId: ticket.clientId,
          title: ' Técnico a caminho', body: `Seu chamado ${ticket.ticketNumber} foi assumido!`,
          ticketId, read: false, createdAt: new Date().toISOString() });
      } else if (status === TicketStatus.FINISHED) {
        newNotifs.push({ id: `n${Date.now()+1}`, userId: ticket.clientId,
          title: ' Chamado finalizado', body: `${ticket.ticketNumber} foi finalizado. Veja as instruções.`,
          ticketId, read: false, createdAt: new Date().toISOString() });
      }
    }
    const allNotifs = [...newNotifs, ...notifications];
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) ?? null, notifications: allNotifs });
    await save(KEY_TICKETS, updated);
    await save(KEY_NOTIFICATIONS, allNotifs);
  },

  addNote: async (ticketId, content) => {
    const { tickets, user } = get();
    if (!user) return;
    const note = { id: `note${Date.now()}`, ticketId, authorId: user.id,
      authorName: user.name, content, isFinalizationNote: false, createdAt: new Date().toISOString() };
    const updated = tickets.map(t =>
      t.id === ticketId ? { ...t, notes: [...(t.notes ?? []), note], updatedAt: new Date().toISOString() } : t
    );
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) ?? null });
    await save(KEY_TICKETS, updated);
  },

  rateTicket: async (ticketId, rating, comment) => {
    const { tickets } = get();
    const updated = tickets.map(t => t.id === ticketId ? { ...t, rating, ratingComment: comment } : t);
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) ?? null });
    await save(KEY_TICKETS, updated);
  },

  refreshTickets: async () => {
    const tickets = await load(KEY_TICKETS, SEED_TICKETS);
    set({ tickets });
  },

  // ── Chat (AsyncStorage backend)
  sendMessage: async (ticketId, content) => {
    const { user, allMessages } = get();
    if (!user || !content.trim()) return;
    const msg: ChatMessage = {
      id: `msg${Date.now()}`,
      ticketId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    const existing = allMessages[ticketId] ?? [];
    const updated  = { ...allMessages, [ticketId]: [...existing, msg] };
    set({ allMessages: updated });
    await save(KEY_MESSAGES, updated);

    // Also add notification to the other party
    const { tickets, notifications } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const recipientId = user.role === UserRole.CLIENT
        ? ticket.technicianId : ticket.clientId;
      if (recipientId) {
        const notif: Notification = {
          id: `n${Date.now()}`, userId: recipientId,
          title: ` ${user.name}`,
          body: content.trim().slice(0, 60),
          ticketId, read: false, createdAt: new Date().toISOString(),
        };
        const allNotifs = [notif, ...notifications];
        set({ notifications: allNotifs });
        await save(KEY_NOTIFICATIONS, allNotifs);
      }
    }
  },

  getMessages: (ticketId) => {
    return get().allMessages[ticketId] ?? [];
  },

  refreshMessages: async (ticketId) => {
    const all = await load<Record<string, ChatMessage[]>>(KEY_MESSAGES, {});
    set({ allMessages: all });
  },

  // ── Notifications
  markNotificationRead: async (id) => {
    const { notifications } = get();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    set({ notifications: updated });
    await save(KEY_NOTIFICATIONS, updated);
  },

  markAllNotificationsRead: async () => {
    const { notifications } = get();
    const updated = notifications.map(n => ({ ...n, read: true }));
    set({ notifications: updated });
    await save(KEY_NOTIFICATIONS, updated);
  },

  // ── Selectors
  getMyTickets: () => {
    const { tickets, user } = get();
    if (!user) return [];
    return tickets.filter(t => t.clientId === user.id);
  },
  getClientTickets: (clientId) => get().tickets.filter(t => t.clientId === clientId),
  getClientsWithTickets: () => {
    const { tickets } = get();
    const map = new Map<string, { clientId: string; clientName: string; tickets: Ticket[] }>();
    for (const t of tickets) {
      if (!map.has(t.clientId)) map.set(t.clientId, { clientId: t.clientId, clientName: t.clientName, tickets: [] });
      map.get(t.clientId)!.tickets.push(t);
    }
    return Array.from(map.values()).sort((a, b) => a.clientName.localeCompare(b.clientName));
  },
  getMyNotifications: () => {
    const { notifications, user } = get();
    if (!user) return [];
    return notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getUnreadCount: () => {
    const { notifications, user } = get();
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.read).length;
  },
  getUnreadMessages: (ticketId) => {
    const { allMessages, user } = get();
    if (!user) return 0;
    return (allMessages[ticketId] ?? []).filter(m => m.senderId !== user.id && !m.read).length;
  },
}));
