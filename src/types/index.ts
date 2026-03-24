// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum UserRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ─── MODELS ───────────────────────────────────────────────────────────────────

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: Address;
  avatarUrl?: string;
  createdAt: string;
}

export interface TicketNote {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  isFinalizationNote: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  clientId: string;
  clientName: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  finalizationNote?: string;
  notes?: TicketNote[];
  rating?: number;
  ratingComment?: string;
  location?: string;
  attachments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  ticketId?: string;
  read: boolean;
  createdAt: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  cep: string;
  addressNumber: string;
  complement?: string;
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ClientTabs: undefined;
  TechnicianTabs: undefined;
  TicketDetail: { ticketId: string };
  NewTicket: undefined;
  ClientTickets: { clientId: string; clientName: string };
  Notifications: undefined;
  RateTicket: { ticketId: string };
};

export type ClientTabParamList = {
  ClientHome: undefined;
  MyTickets: undefined;
  Profile: undefined;
};

export type TechnicianTabParamList = {
  TechnicianHome: undefined;
  ClientsByTech: undefined;
  Profile: undefined;
};

export interface AppState {
  auth: AuthState;
  tickets: Ticket[];
  selectedTicket: Ticket | null;
}
