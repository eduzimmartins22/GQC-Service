import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';
import { calculateDistanceCost, formatDistance, formatCurrency } from '../../utils/distanceCalculator';

interface DistanceWarningProps {
  distanceKm: number;
  showFullDetails?: boolean;
}

export function DistanceWarning({ distanceKm, showFullDetails = true }: DistanceWarningProps) {
  const cost = calculateDistanceCost(distanceKm);

  if (!cost.exceedsLimit && !showFullDetails) {
    return null; // Don't show if no warning needed and not showing all details
  }

  return (
    <View style={[styles.container, cost.exceedsLimit && styles.containerWarning]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={cost.exceedsLimit ? 'alert-circle-outline' : 'checkmark-circle-outline'}
          size={20}
          color={cost.exceedsLimit ? Colors.warning : Colors.success}
        />
      </View>

      <View style={styles.content}>
        {cost.exceedsLimit ? (
          <>
            <Text style={styles.warningTitle}>Custo de trajeto</Text>
            <Text style={styles.warningMessage}>{cost.message}</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Distância:</Text>
                <Text style={styles.summaryValue}>{formatDistance(cost.totalDistance)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Limite gratuito:</Text>
                <Text style={styles.summaryValue}>{formatDistance(cost.freeLimit)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Excesso:</Text>
                <Text style={styles.summaryValue}>{formatDistance(cost.excessKm)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.costLabel}>Valor total:</Text>
                <Text style={styles.costValue}>{formatCurrency(cost.travelCost)}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.successTitle}>Sem custo de trajeto</Text>
            <Text style={styles.successMessage}>
              {formatDistance(distanceKm)} — Dentro do limite de {formatDistance(cost.freeLimit)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.successLight,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    gap: Spacing.sm,
  },
  containerWarning: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning + '30',
  },
  iconContainer: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  successTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 4,
  },
  successMessage: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  warningTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  costLabel: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  costValue: {
    fontSize: Typography.base,
    color: Colors.warning,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
});
