import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { TicketStatus } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ClientsByTechScreen({ navigation }: any) {
  const { getClientsWithTickets } = useStore();
  const [search, setSearch] = useState('');

  const clients = getClientsWithTickets();
  const filtered = clients.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar cliente..."
          placeholderTextColor={Colors.textTertiary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
          </View>
        ) : filtered.map(client => {
          const open = client.tickets.filter(t => t.status === TicketStatus.OPEN).length;
          const inProgress = client.tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
          const finished = client.tickets.filter(t => t.status === TicketStatus.FINISHED).length;
          const hasActive = open + inProgress > 0;

          return (
            <TouchableOpacity
              key={client.clientId}
              style={styles.card}
              onPress={() => navigation.navigate('ClientTickets', {
                clientId: client.clientId,
                clientName: client.clientName,
              })}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.avatar, hasActive && styles.avatarActive]}>
                  <Text style={styles.avatarText}>
                    {(client.clientName ?? '?').split(' ').filter((n: string) => n.length > 0).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.clientName}</Text>
                  <Text style={styles.clientMeta}>
                    {client.tickets.length} chamado{client.tickets.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.badges}>
                {open > 0 && (
                  <View style={[styles.badge, { backgroundColor: Colors.statusOpenBg }]}>
                    <Text style={[styles.badgeText, { color: Colors.statusOpen }]}>{open} ab.</Text>
                  </View>
                )}
                {inProgress > 0 && (
                  <View style={[styles.badge, { backgroundColor: Colors.statusInProgressBg }]}>
                    <Text style={[styles.badgeText, { color: Colors.statusInProgress }]}>{inProgress} and.</Text>
                  </View>
                )}
                {finished > 0 && (
                  <View style={[styles.badge, { backgroundColor: Colors.statusFinishedBg }]}>
                    <Text style={[styles.badgeText, { color: Colors.statusFinished }]}>{finished} fin.</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarActive: { backgroundColor: Colors.primary },
  avatarText: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  clientInfo: { flex: 1 },
  clientName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  clientMeta: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radii.full },
  badgeText: { fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
});
