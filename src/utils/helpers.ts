import { TicketStatus, TicketPriority } from '../types';
import { Colors } from '../constants/theme';

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string | undefined | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export const statusConfig = {
  [TicketStatus.OPEN]: {
    label: 'Aberto',
    color: Colors.statusOpen,
    bg: Colors.statusOpenBg,
    icon: 'radio-button-on',
  },
  [TicketStatus.IN_PROGRESS]: {
    label: 'Em andamento',
    color: Colors.statusInProgress,
    bg: Colors.statusInProgressBg,
    icon: 'sync',
  },
  [TicketStatus.FINISHED]: {
    label: 'Finalizado',
    color: Colors.statusFinished,
    bg: Colors.statusFinishedBg,
    icon: 'checkmark-circle',
  },
};

export const priorityConfig = {
  [TicketPriority.LOW]: {
    label: 'Baixa',
    color: Colors.priorityLow,
    icon: 'arrow-down',
  },
  [TicketPriority.MEDIUM]: {
    label: 'Média',
    color: Colors.priorityMedium,
    icon: 'remove',
  },
  [TicketPriority.HIGH]: {
    label: 'Alta',
    color: Colors.priorityHigh,
    icon: 'arrow-up',
  },
};

export const WHATSAPP_NUMBER = '5527988525314'; 

export function openWhatsApp(ticketNumber?: string): void {
  const msg = ticketNumber
    ? `Olá! Gostaria de informações sobre o chamado ${ticketNumber}.`
    : 'Olá! Preciso de suporte técnico.';
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  // Linking.openURL(url) — import Linking from expo-linking in components
  console.log('WhatsApp URL:', url);
}
