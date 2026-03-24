import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../../store/useStore';
import { TicketCard } from '../../components/cards/TicketCard';
import { TicketStatus } from '../../types';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: TicketStatus.OPEN, label: 'Abertos' },
  { key: TicketStatus.IN_PROGRESS, label: 'Andamento' },
  { key: TicketStatus.FINISHED, label: 'Finalizados' },
];

export function ClientTicketsScreen({ route, navigation }: any) {
  const { clientId, clientName } = route.params;
  const { getClientTickets, setSelectedTicket } = useStore();
  const [activeTab, setActiveTab] = useState<string>('all');

  const tickets = getClientTickets(clientId);
  const filtered = activeTab === 'all' ? tickets : tickets.filter(t => t.status === activeTab);
  const sorted = [...filtered].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {TABS.map(tab => (
          <View
            key={tab.key}
            onTouchEnd={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.base, paddingTop: 0, paddingBottom: 48 }}>
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum chamado nesta categoria.</Text>
          </View>
        ) : sorted.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onPress={t => { setSelectedTicket(t); navigation.navigate('TicketDetail', { ticketId: t.id }); }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabsWrap: { flexGrow: 0, marginBottom: Spacing.md },
  tabs: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
});
