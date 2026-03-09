import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { TicketCard } from '../../components/cards/TicketCard';
import { TicketStatus } from '../../types';
import { statusConfig } from '../../utils/helpers';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

type FilterTab = TicketStatus | 'all';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: TicketStatus.OPEN, label: 'Abertos' },
  { key: TicketStatus.IN_PROGRESS, label: 'Em andamento' },
  { key: TicketStatus.FINISHED, label: 'Finalizados' },
];

export function TechnicianHomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user, tickets, setSelectedTicket } = useStore();

  const open = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgress = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const finished = tickets.filter(t => t.status === TicketStatus.FINISHED).length;

  const filtered = activeTab === 'all' ? tickets : tickets.filter(t => t.status === activeTab);

  // Sort: high priority first, then by updatedAt
  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleTicketPress = (ticket: any) => {
    setSelectedTicket(ticket);
    navigation.navigate('TicketDetail', { ticketId: ticket.id });
  };

  const firstName = user?.name.split(' ')[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName} 🔧</Text>
          <Text style={styles.subtitle}>Painel do técnico</Text>
        </View>
        <View style={styles.urgencyPill}>
          <View style={styles.urgencyDot} />
          <Text style={styles.urgencyText}>{open} urgente{open !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          value={open}
          label="Abertos"
          icon="radio-button-on"
          color={Colors.statusOpen}
          bg={Colors.statusOpenBg}
        />
        <StatCard
          value={inProgress}
          label="Em andamento"
          icon="sync"
          color={Colors.statusInProgress}
          bg={Colors.statusInProgressBg}
        />
        <StatCard
          value={finished}
          label="Finalizados"
          icon="checkmark-circle"
          color={Colors.statusFinished}
          bg={Colors.statusFinishedBg}
        />
        <StatCard
          value={tickets.length}
          label="Total"
          icon="list"
          color={Colors.textSecondary}
          bg={Colors.borderLight}
        />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ticket list */}
      <View style={styles.list}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.statusFinished} />
            <Text style={styles.emptyTitle}>Nenhum chamado aqui</Text>
          </View>
        ) : (
          sorted.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={handleTicketPress}
              showClient
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  value,
  label,
  icon,
  color,
  bg,
}: {
  value: number;
  label: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  greeting: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.statusOpenBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    gap: 6,
  },
  urgencyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusOpen },
  urgencyText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.statusOpen },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '47.5%',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: 4,
  },
  statValue: { fontSize: Typography.xxl, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: Typography.xs, fontWeight: '600' },

  tabsScroll: { marginBottom: Spacing.base },
  tabs: { gap: Spacing.xs, paddingRight: Spacing.base },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  tabLabelActive: { color: Colors.white },

  list: {},
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.md, fontWeight: '600', color: Colors.textPrimary },
});
