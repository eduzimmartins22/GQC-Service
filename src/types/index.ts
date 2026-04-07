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

// ── Chat message between client and technician
export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;          // "outros" description or auto-generated
  status: TicketStatus;
  priority: TicketPriority;

  // ── Equipment structure (new)
  equipmentId?: string;         // e.g. 'elevador'
  equipmentTitle?: string;      // e.g. 'Elevador'
  subtypeId?: string;           // e.g. 'hidraulico'
  subtypeLabel?: string;        // e.g. '1 — Hidráulico'
  symptoms?: string[];          // e.g. ['Elétrico', 'Sem força']
  isOtherProblem?: boolean;     // true if "Outros"
  extraDetails?: string;        // optional detail box

  // ── Installation
  installationId?: string;      // e.g. 'elevador_inst'
  installationTitle?: string;   // e.g. 'Elevador'
  installationCategory?: string;// e.g. 'instalacao_equipamentos'

  // ── Distance and travel costs
  distanceKm?: number;          // Total distance (ida e volta) in km
  travelCost?: number;          // R$ cost for excess distance
  hasDistanceWarning?: boolean; // true if distance > 60km

  // ── Legacy / extra
  category?: string;

  // ── Client info snapshot (captured at ticket creation)
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientCpf?: string;
  clientEmail?: string;
  clientAddress?: Address;

  technicianId?: string;
  technicianName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  finalizationNote?: string;
  notes?: TicketNote[];
  messages?: ChatMessage[];
  rating?: number;
  ratingComment?: string;
  location?: string;
  attachments?: Attachment[];
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
  cnpj?: string;
  email: string;
  phone: string;
  password: string;
  cep: string;
  addressNumber: string;
  complement?: string;
}

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
  Tracking: { ticketId: string };
  Chat: { ticketId: string };
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
