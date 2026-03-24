import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useStore();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel = user?.role === UserRole.TECHNICIAN ? 'Técnico' : 'Cliente';
  const addr = user?.address;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
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

      {/* Personal data */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Dados pessoais</Text>
        <InfoRow icon="mail-outline" label="E-mail" value={user?.email || '-'} />
        <Divider />
        <InfoRow icon="call-outline" label="Telefone" value={user?.phone || 'Não informado'} />
        <Divider />
        <InfoRow icon="card-outline" label="CPF" value={user?.cpf || 'Não informado'} />
      </View>

      {/* Address */}
      {addr && (
        <View style={[styles.card, { marginTop: Spacing.sm }]}>
          <Text style={styles.sectionLabel}>Localização</Text>
          <InfoRow icon="location-outline" label="CEP" value={addr.cep} />
          <Divider />
          <InfoRow icon="home-outline" label="Número" value={addr.number} />
          {addr.complement ? (
            <>
              <Divider />
              <InfoRow icon="business-outline" label="Complemento" value={addr.complement} />
            </>
          ) : null}
          {addr.street ? (
            <>
              <Divider />
              <InfoRow icon="map-outline" label="Endereço" value={`${addr.street}, ${addr.neighborhood}`} />
              <Divider />
              <InfoRow icon="flag-outline" label="Cidade" value={`${addr.city} - ${addr.state}`} />
            </>
          ) : null}
        </View>
      )}

      {/* App info */}
      <View style={[styles.card, { marginTop: Spacing.sm }]}>
        <Text style={styles.sectionLabel}>Aplicativo</Text>
        <InfoRow icon="information-circle-outline" label="Versão" value="1.0.0" />
        <Divider />
        <InfoRow icon="code-slash-outline" label="Ambiente" value="Piloto" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
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

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.base }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  avatarInitials: { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  name: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  rolePill: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full },
  roleLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, ...Shadows.sm, overflow: 'hidden' },
  sectionLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textTertiary, padding: Spacing.base, paddingBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, maxWidth: '55%' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.xl, padding: Spacing.base, backgroundColor: Colors.errorBg, borderRadius: Radii.lg, borderWidth: 1, borderColor: Colors.errorLight },
  logoutText: { fontSize: Typography.base, fontWeight: '600', color: Colors.error },
});
