import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { timeAgo } from '../../utils/helpers';

export function NotificationsScreen({ navigation }: any) {
  const { getMyNotifications, markNotificationRead, markAllNotificationsRead, setSelectedTicket, tickets } = useStore();
  const notifs = getMyNotifications();
  const unread = notifs.filter(n => !n.read).length;

  const handlePress = (notifId: string, ticketId?: string) => {
    markNotificationRead(notifId);
    if (ticketId) {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
        navigation.navigate('TicketDetail', { ticketId });
      }
    }
  };

  return (
    <View style={styles.container}>
      {unread > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsRead}>
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {notifs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Sem notificações</Text>
          </View>
        ) : notifs.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[styles.card, !n.read && styles.cardUnread]}
            onPress={() => handlePress(n.id, n.ticketId)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, !n.read && styles.iconUnread]}>
              <Ionicons
                name={!n.read ? 'notifications' : 'notifications-outline'}
                size={20}
                color={!n.read ? Colors.primary : Colors.textTertiary}
              />
            </View>
            <View style={styles.content}>
              <Text style={[styles.title, !n.read && styles.titleUnread]}>{n.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{n.body}</Text>
              <Text style={styles.time}>{timeAgo(n.createdAt)}</Text>
            </View>
            {!n.read && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base },
  markAllBtn: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  markAllText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  iconUnread: { backgroundColor: Colors.primaryLight },
  content: { flex: 1 },
  title: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  titleUnread: { color: Colors.textPrimary },
  body: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 18 },
  time: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
});
