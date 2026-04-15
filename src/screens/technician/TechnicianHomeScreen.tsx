import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { TicketCard } from '../../components/cards/TicketCard';
import { TicketStatus } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

type FilterTab = TicketStatus | 'all';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: TicketStatus.OPEN, label: 'Abertos' },
  { key: TicketStatus.IN_PROGRESS, label: 'Andamento' },
  { key: TicketStatus.FINISHED, label: 'Finalizados' },
];

export function TechnicianHomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { user, tickets, setSelectedTicket, getUnreadCount, clearAllTickets } = useStore();
  const unread = getUnreadCount();

  const open = tickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgress = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const finished = tickets.filter(t => t.status === TicketStatus.FINISHED).length;

  const filtered = activeTab === 'all' ? tickets : tickets.filter(t => t.status === activeTab);
  const sorted = [...filtered].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const firstName = user?.name.split(' ')[0];

  const handleClearTickets = () => {
    Alert.alert('Limpar chamados', 'Deseja remover TODOS os chamados? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: clearAllTickets },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {firstName} 🔧</Text>
          <Text style={styles.subtitle}>Painel do técnico</Text>
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
          <View style={styles.urgencyPill}>
            <View style={styles.urgencyDot} />
            <Text style={styles.urgencyText}>{open} urgente{open !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard value={open} label="Abertos" icon="radio-button-on" color={Colors.statusOpen} bg={Colors.statusOpenBg} />
        <StatCard value={inProgress} label="Andamento" icon="sync" color={Colors.statusInProgress} bg={Colors.statusInProgressBg} />
        <StatCard value={finished} label="Finalizados" icon="checkmark-circle" color={Colors.statusFinished} bg={Colors.statusFinishedBg} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ticket list */}
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={48} color={Colors.statusFinished} />
          <Text style={styles.emptyText}>Nenhum chamado nesta categoria.</Text>
        </View>
      ) : (
        <>
          {sorted.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={t => { setSelectedTicket(t); navigation.navigate('TicketDetail', { ticketId: t.id }); }}
            />
          ))}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: Spacing.sm, 
              marginTop: Spacing.lg, 
              padding: Spacing.base, 
              backgroundColor: Colors.errorBg, 
              borderRadius: Radii.lg, 
              borderWidth: 1, 
              borderColor: Colors.errorLight 
            }} 
            onPress={handleClearTickets} 
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={{ fontSize: Typography.base, fontWeight: '600', color: Colors.error }}>Limpar chamados</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ value, label, icon, color, bg }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={20} color={color} />
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
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: Colors.error, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  urgencyPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.statusOpenBg, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radii.full },
  urgencyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusOpen },
  urgencyText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.statusOpen },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statValue: { fontSize: Typography.xl, fontWeight: '800' },
  statLabel: { fontSize: Typography.xs, fontWeight: '600', textAlign: 'center' },
  tabsWrap: { flexGrow: 0, marginBottom: Spacing.base },
  tabs: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.xs },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radii.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  empty: { alignItems: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
});
