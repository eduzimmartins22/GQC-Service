import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../../types';
import { StatusBadge } from '../common/Badges';
import { timeAgo, priorityConfig } from '../../utils/helpers';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

interface TicketCardProps {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
  showClient?: boolean;
}

export function TicketCard({ ticket, onPress, showClient = false }: TicketCardProps) {
  const priority = priorityConfig[ticket.priority];

  return (
    <TouchableOpacity
      onPress={() => onPress(ticket)}
      activeOpacity={0.8}
      style={styles.card}
    >
      {/* Priority accent bar */}
      <View style={[styles.accentBar, { backgroundColor: priority.color }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
          <StatusBadge status={ticket.status} />
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {ticket.title}
        </Text>

        {/* Description preview */}
        <Text style={styles.description} numberOfLines={2}>
          {ticket.description}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {showClient && (
              <View style={styles.meta}>
                <Ionicons name="person-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.metaText}>{ticket.clientName}</Text>
              </View>
            )}
            {ticket.technicianName && (
              <View style={styles.meta}>
                <Ionicons name="build-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.metaText}>{ticket.technicianName}</Text>
              </View>
            )}
          </View>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{timeAgo(ticket.updatedAt)}</Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketNumber: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  chevron: {
    marginRight: Spacing.sm,
  },
});
