import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Button } from '../../components/common/Button';
import { TicketStatus, UserRole } from '../../types';
import { formatDateTime, WHATSAPP_NUMBER } from '../../utils/helpers';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function TicketDetailScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user, tickets, updateTicketStatus, setSelectedTicket } = useStore();

  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Chamado não encontrado.</Text>
      </View>
    );
  }

  const isTechnician = user?.role === UserRole.TECHNICIAN;

  const handleStatusChange = (newStatus: TicketStatus) => {
    const statusLabels: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Aberto',
      [TicketStatus.IN_PROGRESS]: 'Em andamento',
      [TicketStatus.FINISHED]: 'Finalizado',
    };
    Alert.alert(
      'Alterar status',
      `Alterar para "${statusLabels[newStatus]}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            updateTicketStatus(ticketId, newStatus);
          },
        },
      ]
    );
  };

  const handleWhatsApp = () => {
    const msg = `Olá! Gostaria de informações sobre o chamado ${ticket.ticketNumber}: ${ticket.title}`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Ticket header */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
          <StatusBadge status={ticket.status} />
        </View>
        <Text style={styles.title}>{ticket.title}</Text>
        <View style={styles.priorityRow}>
          <PriorityBadge priority={ticket.priority} />
          <Text style={styles.metaText}>
            Atualizado {formatDateTime(ticket.updatedAt)}
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>
      </View>

      {/* Info grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.card}>
          <InfoRow icon="person-outline" label="Cliente" value={ticket.clientName} />
          <Divider />
          <InfoRow
            icon="build-outline"
            label="Técnico"
            value={ticket.technicianName || 'Não atribuído'}
          />
          <Divider />
          <InfoRow icon="calendar-outline" label="Aberto em" value={formatDateTime(ticket.createdAt)} />
          {ticket.closedAt && (
            <>
              <Divider />
              <InfoRow icon="checkmark-outline" label="Finalizado em" value={formatDateTime(ticket.closedAt)} />
            </>
          )}
        </View>
      </View>

      {/* Actions */}
      {isTechnician && ticket.status !== TicketStatus.FINISHED && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <View style={styles.actionsRow}>
            {ticket.status === TicketStatus.OPEN && (
              <Button
                label="Iniciar atendimento"
                onPress={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                fullWidth
                size="md"
              />
            )}
            {ticket.status === TicketStatus.IN_PROGRESS && (
              <Button
                label="Finalizar chamado"
                onPress={() => handleStatusChange(TicketStatus.FINISHED)}
                fullWidth
                size="md"
              />
            )}
          </View>
        </View>
      )}

      {/* WhatsApp button - always available */}
      <TouchableOpacity style={styles.waCard} onPress={handleWhatsApp} activeOpacity={0.8}>
        <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        <View style={styles.waText}>
          <Text style={styles.waTitle}>Falar via WhatsApp</Text>
          <Text style={styles.waSubtitle}>Contato direto sobre este chamado</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={16} color={Colors.textTertiary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl, gap: Spacing.base },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  ticketNumber: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaText: { fontSize: Typography.xs, color: Colors.textTertiary },
  description: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.borderLight },

  actionsRow: { gap: Spacing.sm },

  waCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  waText: { flex: 1 },
  waTitle: { fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary },
  waSubtitle: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
});
