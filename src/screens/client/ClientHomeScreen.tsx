import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { TicketCard } from '../../components/cards/TicketCard';
import { Button } from '../../components/common/Button';
import { TicketStatus, TicketPriority } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { WHATSAPP_NUMBER } from '../../utils/helpers';

export function ClientHomeScreen({ navigation }: any) {
  const { user, getMyTickets, setSelectedTicket, getUnreadCount } = useStore();
  const myTickets = getMyTickets();
  const unread = getUnreadCount();

  const open = myTickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgress = myTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const finished = myTickets.filter(t => t.status === TicketStatus.FINISHED).length;
  const activeTickets = myTickets.filter(t => t.status !== TicketStatus.FINISHED).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
  const pendingRating = myTickets.filter(t => t.status === TicketStatus.FINISHED && !t.rating);

  const firstName = user?.name.split(' ')[0];

  const handleTicketPress = (ticket: any) => {
    setSelectedTicket(ticket);
    navigation.navigate('TicketDetail', { ticketId: ticket.id });
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Preciso de suporte técnico.')}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
          <Text style={styles.subtitle}>Acompanhe seus chamados</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name={unread > 0 ? 'notifications' : 'notifications-outline'} size={22} color={unread > 0 ? Colors.primary : Colors.textSecondary} />
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWhatsApp} style={styles.iconBtn}>
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={open} label="Abertos" color={Colors.statusOpen} bg={Colors.statusOpenBg} />
        <StatCard value={inProgress} label="Andamento" color={Colors.statusInProgress} bg={Colors.statusInProgressBg} />
        <StatCard value={finished} label="Finalizados" color={Colors.statusFinished} bg={Colors.statusFinishedBg} />
      </View>

      {/* Pending ratings banner */}
      {pendingRating.length > 0 && (
        <TouchableOpacity
          style={styles.ratingBanner}
          onPress={() => { setSelectedTicket(pendingRating[0]); navigation.navigate('RateTicket', { ticketId: pendingRating[0].id }); }}
          activeOpacity={0.85}
        >
          <Ionicons name="star-outline" size={20} color={Colors.warning} />
          <Text style={styles.ratingBannerText}>
            Você tem {pendingRating.length} chamado{pendingRating.length > 1 ? 's' : ''} para avaliar
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
        </TouchableOpacity>
      )}

      {/* New ticket CTA */}
      <Button label="+ Abrir Novo Chamado" onPress={() => navigation.navigate('NewTicket')} fullWidth size="lg" style={styles.newBtn} />

      {/* Active tickets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chamados ativos</Text>
        {activeTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.statusFinished} />
            <Text style={styles.emptyTitle}>Tudo em dia!</Text>
            <Text style={styles.emptyText}>Você não tem chamados abertos no momento.</Text>
          </View>
        ) : activeTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} onPress={handleTicketPress} />
        ))}
      </View>
    </ScrollView>
  );
}

function StatCard({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingTop: Spacing.sm },
  greeting: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: Colors.error, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: { flex: 1, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center' },
  statValue: { fontSize: Typography.xxl, fontWeight: '800' },
  statLabel: { fontSize: Typography.xs, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  ratingBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FFFBEB', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  ratingBannerText: { flex: 1, fontSize: Typography.sm, fontWeight: '600', color: Colors.warning },
  newBtn: { marginBottom: Spacing.xl },
  section: {},
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.md, fontWeight: '600', color: Colors.textPrimary },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
});
