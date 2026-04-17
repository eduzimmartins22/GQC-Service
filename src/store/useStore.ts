import { create } from 'zustand/react';
import {
  User, Ticket, TicketStatus, TicketPriority, UserRole,
  Notification, RegisterData, ChatMessage,
} from '../types';
import { authService } from '../services/authService';
import {
  usersService, ticketsService,
  notificationsService, messagesService,
} from '../services/firestoreService';

// ─── TÉCNICOS SEED (fallback — não usam Firebase Auth) ────────────────────────
const SEED_TECHNICIANS: (User & { password: string })[] = [
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
];

// ─── STORE INTERFACE ───────────────────────────────────────────────────────────
interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  notifications: Notification[];
  allMessages: Record<string, ChatMessage[]>;
  users: (User & { password?: string })[];
  hydrated: boolean;
  _unsubscribeTickets: (() => void) | null;
  _unsubscribeNotifications: (() => void) | null;

  hydrate: (overrideUser?: User) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAllTickets: () => Promise<void>;
  clearClient: (clientId: string) => Promise<void>;

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

  sendMessage: (ticketId: string, content: string) => Promise<void>;
  getMessages: (ticketId: string) => ChatMessage[];
  refreshMessages: (ticketId: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

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
  authError: null, tickets: [], selectedTicket: null,
  notifications: [], allMessages: {}, users: [], hydrated: false,
  _unsubscribeTickets: null, _unsubscribeNotifications: null,

  // ── Registra listeners Firestore em tempo real
  hydrate: async (overrideUser?: User) => {
    const user = overrideUser ?? get().user;
    if (!user) {
      console.log('[Store] hydrate cancelado: user null');
      return;
    }

    console.log('[Store] hydrate iniciado para:', user.email, '| role:', user.role);

    // Cancela listeners anteriores
    get()._unsubscribeTickets?.();
    get()._unsubscribeNotifications?.();

    // Carrega lista de usuários (para o técnico ver clientes)
    const allUsers = await usersService.getAllUsers();
    set({ users: allUsers, hydrated: true });
    console.log('[Store] usuarios carregados:', allUsers.length);

    // Registra listener de tickets
    let unsubTickets: () => void;
    if (user.role === UserRole.TECHNICIAN) {
      unsubTickets = ticketsService.subscribeToAllTickets(tickets => {
        console.log('[Store] tickets atualizados (técnico):', tickets.length);
        set({ tickets });
      });
    } else {
      unsubTickets = ticketsService.subscribeToClientTickets(user.id, tickets => {
        console.log('[Store] tickets atualizados (cliente):', tickets.length);
        set({ tickets });
      });
    }

    // Registra listener de notificações
    const unsubNotifs = notificationsService.subscribeToUserNotifications(user.id, notifications => {
      set({ notifications });
    });

    set({ _unsubscribeTickets: unsubTickets, _unsubscribeNotifications: unsubNotifs });
    console.log('[Store] listeners registrados com sucesso');
  },

  // ── Login
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    console.log('[Store] tentando login:', email);

    // 1. Tenta Firebase Auth (clientes cadastrados via register)
    const authResult = await authService.login(email, password);
    console.log('[Store] Firebase Auth resultado:', authResult.success);

    if (authResult.success) {
      // Busca dados do usuário no Firestore
      const userData = await usersService.getUser(authResult.user.uid);
      console.log('[Store] userData do Firestore:', userData ? 'encontrado' : 'NÃO encontrado');

      if (userData) {
        const { password: _pw, ...cleanUser } = userData;
        const user = cleanUser as User;
        set({ user, isAuthenticated: true, isLoading: false });
        await get().hydrate(user);
        return true;
      } else {
        // Firebase Auth ok mas sem doc no Firestore — cria documento na hora
        console.log('[Store] criando doc Firestore para usuário Firebase existente');
        const minimalUser: User = {
          id: authResult.user.uid,
          name: authResult.user.displayName ?? email.split('@')[0],
          cpf: '',
          email: authResult.user.email ?? email,
          phone: '',
          role: UserRole.CLIENT,
          createdAt: new Date().toISOString(),
        };
        await usersService.upsertUser(minimalUser.id, minimalUser);
        set({ user: minimalUser, isAuthenticated: true, isLoading: false });
        await get().hydrate(minimalUser);
        return true;
      }
    }

    // 2. Fallback: técnicos seed (login local, sem Firebase Auth)
    const found = SEED_TECHNICIANS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      console.log('[Store] login via seed technician:', found.name);
      const { password: _pw, ...user } = found;
      set({ user, isAuthenticated: true, isLoading: false });
      await get().hydrate(user);
      return true;
    }

    console.log('[Store] login falhou');
    set({ authError: 'E-mail ou senha incorretos.', isLoading: false });
    return false;
  },

  // ── Register
  register: async (data) => {
    set({ isLoading: true });
    const authResult = await authService.register(data.email, data.password);
    if (!authResult.success) {
      const msg = authResult.error?.includes('email-already-in-use')
        ? 'E-mail já cadastrado.'
        : authResult.error ?? 'Erro ao criar conta.';
      set({ isLoading: false });
      return { success: false, error: msg };
    }

    const newUser: User = {
      id: authResult.user.uid,
      name: data.name, cpf: data.cpf,
      email: data.email, phone: data.phone,
      role: UserRole.CLIENT,
      address: {
        cep: data.cep, street: '', number: data.addressNumber,
        complement: data.complement, neighborhood: '', city: '', state: '',
      },
      createdAt: new Date().toISOString(),
    };

    await usersService.upsertUser(newUser.id, newUser);
    console.log('[Store] novo usuário salvo no Firestore:', newUser.id);
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    await get().hydrate(newUser);
    return { success: true };
  },

  // ── Logout
  logout: async () => {
    get()._unsubscribeTickets?.();
    get()._unsubscribeNotifications?.();
    await authService.logout();
    set({
      user: null, isAuthenticated: false, selectedTicket: null,
      tickets: [], notifications: [], allMessages: {},
      _unsubscribeTickets: null, _unsubscribeNotifications: null,
    });
  },

  clearAllTickets: async () => {
    const { tickets } = get();
    await Promise.all(tickets.map(t => ticketsService.deleteTicket(t.id)));
    set({ tickets: [] });
  },

  clearClient: async (clientId: string) => {
    await usersService.deleteUser(clientId);
    await ticketsService.deleteClientTickets(clientId);
    const { users, tickets } = get();
    set({
      users: users.filter(u => u.id !== clientId),
      tickets: tickets.filter(t => t.clientId !== clientId),
    });
  },

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  openTicket: async (data) => {
    const { user, tickets } = get();
    if (!user) return;

    const autoTitle = data.equipmentTitle && data.subtypeLabel
      ? `${data.equipmentTitle} — ${data.symptoms?.slice(0, 2).join(', ') ?? 'Problema'}`
      : data.title;

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      ticketNumber: `#${String(tickets.length + 1).padStart(4, '0')}`,
      title: autoTitle, description: data.description || '',
      status: TicketStatus.OPEN, priority: data.priority,
      equipmentId: data.equipmentId, equipmentTitle: data.equipmentTitle,
      subtypeId: data.subtypeId, subtypeLabel: data.subtypeLabel,
      symptoms: data.symptoms, isOtherProblem: data.isOtherProblem,
      extraDetails: data.extraDetails,
      clientId: user.id, clientName: user.name, clientPhone: user.phone,
      clientCpf: user.cpf, clientEmail: user.email, clientAddress: user.address,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      notes: [], messages: [],
    };

    const result = await ticketsService.createTicket(newTicket);
    console.log('[Store] openTicket resultado:', result);

    await notificationsService.addNotification({
      id: `n${Date.now()}`, userId: 'u_isac',
      title: '🔔 Novo chamado aberto',
      body: `${user.name}: ${autoTitle}`,
      ticketId: newTicket.id, read: false,
      createdAt: new Date().toISOString(),
    });
  },

  updateTicketStatus: async (ticketId, status, finalizationNote) => {
    const { tickets } = get();
    const ticket = tickets.find(t => t.id === ticketId);

    await ticketsService.updateTicket(ticketId, {
      status,
      updatedAt: new Date().toISOString(),
      ...(status === TicketStatus.FINISHED && { closedAt: new Date().toISOString() }),
      ...(finalizationNote && { finalizationNote }),
    });

    if (ticket) {
      let notifTitle = '';
      let notifBody = '';
      if (status === TicketStatus.IN_PROGRESS) {
        notifTitle = '🚗 Técnico a caminho';
        notifBody = `Seu chamado ${ticket.ticketNumber} foi assumido!`;
      } else if (status === TicketStatus.FINISHED) {
        notifTitle = '✅ Chamado finalizado';
        notifBody = `${ticket.ticketNumber} foi finalizado. Veja as instruções.`;
      }
      if (notifTitle) {
        await notificationsService.addNotification({
          id: `n${Date.now()}`, userId: ticket.clientId,
          title: notifTitle, body: notifBody,
          ticketId, read: false, createdAt: new Date().toISOString(),
        });
      }
    }
  },

  addNote: async (ticketId, content) => {
    const { user, tickets } = get();
    if (!user) return;
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const note = {
      id: `note${Date.now()}`, ticketId, authorId: user.id,
      authorName: user.name, content, isFinalizationNote: false,
      createdAt: new Date().toISOString(),
    };
    await ticketsService.updateTicket(ticketId, { notes: [...(ticket.notes ?? []), note] });
  },

  rateTicket: async (ticketId, rating, comment) => {
    await ticketsService.updateTicket(ticketId, { rating, ratingComment: comment });
  },

  refreshTickets: async () => {
    const { user } = get();
    if (!user) return;
    const tickets = user.role === UserRole.TECHNICIAN
      ? await ticketsService.getAllTickets()
      : await ticketsService.getClientTickets(user.id);
    set({ tickets });
  },

  sendMessage: async (ticketId, content) => {
    const { user, tickets } = get();
    if (!user || !content.trim()) return;
    const msg: ChatMessage = {
      id: `msg${Date.now()}`, ticketId,
      senderId: user.id, senderName: user.name, senderRole: user.role,
      content: content.trim(), createdAt: new Date().toISOString(), read: false,
    };
    await messagesService.sendMessage(msg);

    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const recipientId = user.role === UserRole.CLIENT ? ticket.technicianId : ticket.clientId;
      if (recipientId) {
        await notificationsService.addNotification({
          id: `n${Date.now()}`, userId: recipientId,
          title: `💬 ${user.name}`, body: content.trim().slice(0, 60),
          ticketId, read: false, createdAt: new Date().toISOString(),
        });
      }
    }
  },

  getMessages: (ticketId) => get().allMessages[ticketId] ?? [],

  refreshMessages: async (ticketId) => {
    const msgs = await messagesService.getTicketMessages(ticketId);
    const { allMessages } = get();
    set({ allMessages: { ...allMessages, [ticketId]: msgs } });
  },

  markNotificationRead: async (id) => {
    await notificationsService.markRead(id);
  },

  markAllNotificationsRead: async () => {
    const { user } = get();
    if (!user) return;
    await notificationsService.markAllRead(user.id);
  },

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
      if (!map.has(t.clientId))
        map.set(t.clientId, { clientId: t.clientId, clientName: t.clientName, tickets: [] });
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
