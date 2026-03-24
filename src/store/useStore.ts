import { create } from 'zustand/react';
import { User, Ticket, TicketStatus, TicketPriority, UserRole, Notification, RegisterData, Address } from '../types';

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'u1',
    name: 'Carlos Oliveira',
    cpf: '123.456.789-00',
    email: 'cliente@isaac.com',
    password: '123456',
    role: UserRole.CLIENT,
    phone: '(11) 99999-0001',
    address: {
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 42',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Ana Técnica',
    cpf: '987.654.321-00',
    email: 'tecnico@isaac.com',
    password: '123456',
    role: UserRole.TECHNICIAN,
    phone: '(11) 99999-0002',
    address: {
      cep: '04038-001',
      street: 'Rua Vergueiro',
      number: '500',
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
    },
    createdAt: '2024-01-05T08:00:00Z',
  },
  {
    id: 'u3',
    name: 'Fernanda Lima',
    cpf: '111.222.333-44',
    email: 'fernanda@empresa.com',
    password: '123456',
    role: UserRole.CLIENT,
    phone: '(21) 98888-1111',
    address: {
      cep: '20040-020',
      street: 'Av. Rio Branco',
      number: '156',
      complement: 'Sala 301',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'u4',
    name: 'Roberto Mendes',
    cpf: '555.666.777-88',
    email: 'roberto@empresa.com',
    password: '123456',
    role: UserRole.CLIENT,
    phone: '(31) 97777-2222',
    address: {
      cep: '30130-110',
      street: 'Av. Afonso Pena',
      number: '1200',
      neighborhood: 'Centro',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    createdAt: '2024-02-15T10:00:00Z',
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
    category: 'Hardware',
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2025-03-01T11:00:00Z',
    notes: [
      {
        id: 'n1',
        ticketId: 't1',
        authorId: 'u2',
        authorName: 'Ana Técnica',
        content: 'Verificado: fonte de alimentação com defeito. Aguardando peça de reposição.',
        isFinalizationNote: false,
        createdAt: '2025-03-01T11:00:00Z',
      }
    ],
  },
  {
    id: 't2',
    ticketNumber: '#0002',
    title: 'Impressora offline',
    description: 'A impressora do setor financeiro aparece como offline na rede. Precisamos urgente para fechar o mês.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: 'Rede',
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
    category: 'Software',
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
    category: 'Hardware',
    clientId: 'u1',
    clientName: 'Carlos Oliveira',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-02-28T10:00:00Z',
    updatedAt: '2025-03-01T15:00:00Z',
    closedAt: '2025-03-01T15:00:00Z',
    finalizationNote: 'Substituídos mouse e teclado por modelos sem fio Logitech MK295. Para emparelhar novamente, pressione o botão Connect na parte inferior de cada periférico por 3 segundos. Mantenha o receptor USB sempre conectado na porta traseira do computador.',
    rating: 5,
    ratingComment: 'Ótimo atendimento, rápido e eficiente!',
  },
  {
    id: 't5',
    ticketNumber: '#0005',
    title: 'E-mail corporativo não envia',
    description: 'Não consigo enviar e-mails pelo Outlook. Recebo mensagem de erro de autenticação.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    category: 'Software',
    clientId: 'u3',
    clientName: 'Fernanda Lima',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2025-03-10T10:00:00Z',
  },
  {
    id: 't6',
    ticketNumber: '#0006',
    title: 'Sem acesso à internet',
    description: 'Toda a sala 2 está sem acesso à internet desde ontem à tarde.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    category: 'Rede',
    clientId: 'u3',
    clientName: 'Fernanda Lima',
    createdAt: '2025-03-12T09:00:00Z',
    updatedAt: '2025-03-12T09:00:00Z',
  },
  {
    id: 't7',
    ticketNumber: '#0007',
    title: 'Notebook travando constantemente',
    description: 'Notebook do gerente trava a cada 20 minutos, precisa reiniciar.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: 'Hardware',
    clientId: 'u4',
    clientName: 'Roberto Mendes',
    createdAt: '2025-03-14T11:00:00Z',
    updatedAt: '2025-03-14T11:00:00Z',
  },
  {
    id: 't8',
    ticketNumber: '#0008',
    title: 'Backup não está rodando',
    description: 'O backup automático noturno falhou nos últimos 3 dias. Arquivo de log indica erro de permissão.',
    status: TicketStatus.FINISHED,
    priority: TicketPriority.HIGH,
    category: 'Software',
    clientId: 'u4',
    clientName: 'Roberto Mendes',
    technicianId: 'u2',
    technicianName: 'Ana Técnica',
    createdAt: '2025-03-05T07:00:00Z',
    updatedAt: '2025-03-06T16:00:00Z',
    closedAt: '2025-03-06T16:00:00Z',
    finalizationNote: 'Corrigidas as permissões da pasta de destino do backup. O serviço agora roda com conta de serviço dedicada. Recomendo verificar o log de backup toda segunda-feira em: C:\\Logs\\Backup. Em caso de nova falha, reinicie o serviço "BackupService" no Gerenciador de Serviços do Windows.',
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    userId: 'u1',
    title: 'Chamado em andamento',
    body: 'Seu chamado #0001 foi assumido por Ana Técnica.',
    ticketId: 't1',
    read: false,
    createdAt: '2025-03-01T11:05:00Z',
  },
  {
    id: 'notif2',
    userId: 'u1',
    title: 'Chamado finalizado',
    body: 'Seu chamado #0004 foi finalizado. Confira as instruções deixadas pelo técnico.',
    ticketId: 't4',
    read: true,
    createdAt: '2025-03-01T15:10:00Z',
  },
  {
    id: 'notif3',
    userId: 'u2',
    title: 'Novo chamado aberto',
    body: 'Carlos Oliveira abriu um novo chamado: "Impressora offline" (Prioridade Média).',
    ticketId: 't2',
    read: false,
    createdAt: '2025-03-03T14:05:00Z',
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

  // Notifications
  notifications: Notification[];

  // Actions - Auth
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Actions - Tickets
  setSelectedTicket: (ticket: Ticket | null) => void;
  openTicket: (data: { title: string; description: string; priority: TicketPriority; category?: string }) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, finalizationNote?: string) => void;
  assignTechnician: (ticketId: string, technicianId: string, technicianName: string) => void;
  addNote: (ticketId: string, content: string) => void;
  rateTicket: (ticketId: string, rating: number, comment?: string) => void;

  // Actions - Notifications
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // Selectors
  getTicketsByStatus: (status: TicketStatus) => Ticket[];
  getMyTickets: () => Ticket[];
  getClientTickets: (clientId: string) => Ticket[];
  getClientsWithTickets: () => { clientId: string; clientName: string; tickets: Ticket[] }[];
  getMyNotifications: () => Notification[];
  getUnreadCount: () => number;
}

// ─── STORE ─────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  tickets: MOCK_TICKETS,
  selectedTicket: null,
  notifications: MOCK_NOTIFICATIONS,

  // ── Auth
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    await new Promise(r => setTimeout(r, 800));
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

  register: async (data: RegisterData) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 1000));

    const { user: _u, ...rest } = get() as any;
    const exists = MOCK_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase() || u.cpf === data.cpf);
    if (exists) {
      set({ isLoading: false });
      return { success: false, error: 'E-mail ou CPF já cadastrado.' };
    }

    const newUser: User & { password: string } = {
      id: `u${Date.now()}`,
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: UserRole.CLIENT,
      address: {
        cep: data.cep,
        street: '',
        number: data.addressNumber,
        complement: data.complement,
        neighborhood: '',
        city: '',
        state: '',
      },
      createdAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    const { password: _, ...user } = newUser;
    set({ user, isAuthenticated: true, isLoading: false });
    return { success: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, selectedTicket: null });
  },

  // ── Tickets
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),

  openTicket: ({ title, description, priority, category }) => {
    const { user, tickets, notifications } = get();
    if (!user) return;

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      ticketNumber: `#${String(tickets.length + 1).padStart(4, '0')}`,
      title,
      description,
      status: TicketStatus.OPEN,
      priority,
      category,
      clientId: user.id,
      clientName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
    };

    const newNotif: Notification = {
      id: `notif${Date.now()}`,
      userId: 'u2', // notifica técnico
      title: 'Novo chamado aberto',
      body: `${user.name} abriu: "${title}" (${priority === TicketPriority.HIGH ? 'Alta' : priority === TicketPriority.MEDIUM ? 'Média' : 'Baixa'} prioridade)`,
      ticketId: newTicket.id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    set({ tickets: [newTicket, ...tickets], notifications: [newNotif, ...notifications] });
  },

  updateTicketStatus: (ticketId, status, finalizationNote) => {
    const { tickets, notifications, user } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    const updated = tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status,
            updatedAt: new Date().toISOString(),
            closedAt: status === TicketStatus.FINISHED ? new Date().toISOString() : t.closedAt,
            finalizationNote: finalizationNote || t.finalizationNote,
          }
        : t
    );

    const newNotifs: Notification[] = [];
    if (ticket) {
      if (status === TicketStatus.IN_PROGRESS) {
        newNotifs.push({
          id: `notif${Date.now()}`,
          userId: ticket.clientId,
          title: 'Chamado em andamento',
          body: `Seu chamado ${ticket.ticketNumber} foi assumido. Em breve entraremos em contato.`,
          ticketId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (status === TicketStatus.FINISHED) {
        newNotifs.push({
          id: `notif${Date.now() + 1}`,
          userId: ticket.clientId,
          title: 'Chamado finalizado ✓',
          body: `Seu chamado ${ticket.ticketNumber} foi finalizado. Confira as instruções do técnico.`,
          ticketId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    set({
      tickets: updated,
      selectedTicket: updated.find(t => t.id === ticketId) || null,
      notifications: [...newNotifs, ...notifications],
    });
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

  addNote: (ticketId, content) => {
    const { tickets, user } = get();
    if (!user) return;
    const note = {
      id: `note${Date.now()}`,
      ticketId,
      authorId: user.id,
      authorName: user.name,
      content,
      isFinalizationNote: false,
      createdAt: new Date().toISOString(),
    };
    const updated = tickets.map(t =>
      t.id === ticketId
        ? { ...t, notes: [...(t.notes || []), note], updatedAt: new Date().toISOString() }
        : t
    );
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) || null });
  },

  rateTicket: (ticketId, rating, comment) => {
    const { tickets } = get();
    const updated = tickets.map(t =>
      t.id === ticketId ? { ...t, rating, ratingComment: comment } : t
    );
    set({ tickets: updated, selectedTicket: updated.find(t => t.id === ticketId) || null });
  },

  // ── Notifications
  markNotificationRead: (notifId) => {
    const { notifications } = get();
    set({ notifications: notifications.map(n => n.id === notifId ? { ...n, read: true } : n) });
  },

  markAllNotificationsRead: () => {
    const { notifications } = get();
    set({ notifications: notifications.map(n => ({ ...n, read: true })) });
  },

  // ── Selectors
  getTicketsByStatus: (status) => get().tickets.filter(t => t.status === status),

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
      if (!map.has(t.clientId)) {
        map.set(t.clientId, { clientId: t.clientId, clientName: t.clientName, tickets: [] });
      }
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
}));
