import { create } from 'zustand/react';
import { User, Ticket, TicketStatus, TicketPriority, UserRole } from '../types';

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'u1',
    name: 'Carlos Oliveira',
    email: 'cliente@isaac.com',
    password: '123456',
    role: UserRole.CLIENT,
    phone: '(11) 99999-0001',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Ana Técnica',
    email: 'tecnico@isaac.com',
    password: '123456',
    role: UserRole.TECHNICIAN,
    phone: '(11) 99999-0002',
    createdAt: '2024-01-05T08:00:00Z',
  },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    ticketNumber: '#0001',
    title: 'Computador não liga',
    description: 'O computador da recepção não está ligando desde esta manhã. Já tentei trocar a tomada mas não funcionou.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2025-03-01T11:00:00Z',
  },
  {
    id: 't2',
    ticketNumber: '#0002',
    title: 'Impressora offline',
    description: 'A impressora do setor financeiro aparece como offline na rede. Precisamos urgente para fechar o mês.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    createdAt: '2025-03-03T14:00:00Z',
    updatedAt: '2025-03-03T14:00:00Z',
  },
  {
    id: 't3',
    ticketNumber: '#0003',
    title: 'Lentidão no sistema',
    description: 'O sistema de gestão está muito lento nas últimas horas, especialmente no módulo de relatórios.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    createdAt: '2025-03-05T16:30:00Z',
    updatedAt: '2025-03-05T16:30:00Z',
  },
  {
    id: 't4',
    ticketNumber: '#0004',
    title: 'Troca de mouse e teclado',
    description: 'Mouse e teclado da diretoria precisam ser substituídos, estão com defeito.',
    status: TicketStatus.FINISHED,
    priority: TicketPriority.LOW,
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-02-28T10:00:00Z',
    updatedAt: '2025-03-01T15:00:00Z',
    closedAt: '2025-03-01T15:00:00Z',
  },
];

// ─── STORE INTERFACE ───────────────────────────────────────────────────────────

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  // Tickets
  tickets: Ticket[];
  selectedTicket: Ticket | null;

  // Actions - Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Actions - Tickets
  setSelectedTicket: (ticket: Ticket | null) => void;
  openTicket: (data: { title: string; description: string; priority: TicketPriority }) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  assignTechnician: (ticketId: string, technicianId: string, technicianName: string) => void;

  // Selectors (computed)
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getMyTickets: () => Ticket[];
}

// ─── STORE ─────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>((set, get) => ({
  // ── Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  tickets: MOCK_TICKETS,
  selectedTicket: null,

  // ── Auth Actions
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    await new Promise(r => setTimeout(r, 800)); // simulate network

    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      const { password: _, ...user } = found;
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } else {
      set({ authError: 'E-mail ou senha incorretos.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, selectedTicket: null });
  },

  // ── Ticket Actions
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  openTicket: ({ title, description, priority }) => {
    const { user, tickets } = get();
    if (!user) return;

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      ticketNumber: `#${String(tickets.length + 1).padStart(4, '0')}`,
      title,
      description,
      status: TicketStatus.OPEN,
      priority,
      clientId: user.id,
      clientName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({ tickets: [newTicket, ...tickets] });
  },

  updateTicketStatus: (ticketId, status) => {
    const { tickets } = get();
    const updated = tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status,
            updatedAt: new Date().toISOString(),
            closedAt: status === TicketStatus.FINISHED ? new Date().toISOString() : t.closedAt,
          }
        : t
    );
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) || null });
  },

  assignTechnician: (ticketId, technicianId, technicianName) => {
    const { tickets } = get();
    const updated = tickets.map(t =>
      t.id === ticketId
        ? { ...t, technicianId, technicianName, updatedAt: new Date().toISOString() }
        : t
    );
    set({ tickets: updated });
  },

  // ── Selectors
  getTicketsByStatus: (status) => {
    const { tickets } = get();
    return tickets.filter(t => t.status === status);
  },

  getMyTickets: () => {
    const { tickets, user } = get();
    if (!user) return [];
    return tickets.filter(t => t.clientId === user.id);
  },
}));
