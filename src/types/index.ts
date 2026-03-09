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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;        // ex: #0042
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  clientId: string;
  clientName: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  // Prepared for future phases:
  location?: string;           // Phase 2: geolocation
  attachments?: string[];      // Phase 2: photo uploads
  category?: string;           // Phase 2: ticket categories
  rating?: number;             // Phase 2: client satisfaction rating
  notes?: TicketNote[];        // Phase 2: internal notes
}

export interface TicketNote {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
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

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  ClientTabs: undefined;
  TechnicianTabs: undefined;
  TicketDetail: { ticketId: string };
  NewTicket: undefined;
};

export type ClientTabParamList = {
  ClientHome: undefined;
  MyTickets: undefined;
  Profile: undefined;
};

export type TechnicianTabParamList = {
  TechnicianHome: undefined;
  AllTickets: undefined;
  Profile: undefined;
};

// ─── STORE ────────────────────────────────────────────────────────────────────

export interface AppState {
  auth: AuthState;
  tickets: Ticket[];
  selectedTicket: Ticket | null;
}
