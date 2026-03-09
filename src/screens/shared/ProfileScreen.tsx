import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ProfileScreen() {
  const { user, logout } = useStore();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel = user?.role === UserRole.TECHNICIAN ? 'Técnico' : 'Cliente';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>
            {user?.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <InfoRow icon="mail-outline" label="E-mail" value={user?.email || '-'} />
        <View style={styles.divider} />
        <InfoRow icon="call-outline" label="Telefone" value={user?.phone || 'Não informado'} />
      </View>

      {/* App info */}
      <View style={[styles.card, { marginTop: Spacing.sm }]}>
        <InfoRow icon="information-circle-outline" label="Versão" value="1.0.0 (Piloto)" />
        <View style={styles.divider} />
        <InfoRow icon="code-slash-outline" label="Ambiente" value="Validação" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={16} color={Colors.textTertiary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.base,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarInitials: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rolePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  roleLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    ...Shadows.sm,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.base },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, maxWidth: '55%' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.base,
    backgroundColor: Colors.errorBg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.errorLight,
  },
  logoutText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.error,
  },
});
