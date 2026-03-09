import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TicketStatus, TicketPriority } from '../../types';
import { statusConfig, priorityConfig } from '../../utils/helpers';
import { Typography, Spacing, Radii } from '../../constants/theme';

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <View style={[styles.badge, styles.priorityBadge]}>
      <Text style={[styles.label, { color: config.color }]}>↑ {config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    gap: 5,
  },
  priorityBadge: {
    backgroundColor: 'transparent',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
