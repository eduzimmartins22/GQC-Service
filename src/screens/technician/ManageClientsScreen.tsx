import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ManageClientsScreen({ navigation }: any) {
  const { users, clearClient, user: currentUser } = useStore();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  // Filtrar apenas clientes (não técnicos)
  const clients = users.filter(u => u.role === 'CLIENT' && u.id !== currentUser?.id);

  const toggleClient = (id: string) => {
    const newSet = new Set(selectedClients);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedClients(newSet);
  };

  const handleClearSelected = () => {
    if (selectedClients.size === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um cliente para remover');
      return;
    }

    Alert.alert(
      'Remover clientes',
      `Deseja remover ${selectedClients.size} cliente(s)? Todos os seus chamados também serão removidos. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            for (const clientId of selectedClients) {
              await clearClient(clientId);
            }
            setSelectedClients(new Set());
            Alert.alert('Sucesso', 'Cliente(s) removido(s) com sucesso');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="people-outline" size={48} color={Colors.primary} />
          <Text style={styles.title}>Gerenciar clientes</Text>
          <Text style={styles.subtitle}>
            {clients.length === 0 ? 'Nenhum cliente registrado' : `Total: ${clients.length} cliente(s)`}
          </Text>
        </View>

        {clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-remove-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Nenhum cliente para gerenciar</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.selectionBar}>
                <TouchableOpacity
                  style={styles.selectAllBtn}
                  onPress={() => {
                    if (selectedClients.size === clients.length) {
                      setSelectedClients(new Set());
                    } else {
                      setSelectedClients(new Set(clients.map(c => c.id)));
                    }
                  }}
                >
                  <Ionicons
                    name={selectedClients.size === clients.length ? 'checkbox' : 'checkbox-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.selectAllText}>
                    {selectedClients.size === clients.length ? 'Desselecionar tudo' : 'Selecionar tudo'}
                  </Text>
                </TouchableOpacity>
                {selectedClients.size > 0 && (
                  <Text style={styles.selectedCount}>{selectedClients.size} selecionado(s)</Text>
                )}
              </View>

              {clients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.clientItem}
                  onPress={() => toggleClient(client.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={selectedClients.has(client.id) ? 'checkbox' : 'checkbox-outline'}
                    size={20}
                    color={selectedClients.has(client.id) ? Colors.error : Colors.textTertiary}
                  />
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientEmail} numberOfLines={1}>{client.email}</Text>
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </View>
                  {selectedClients.has(client.id) && (
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {clients.length > 0 && selectedClients.size > 0 && (
        <View style={styles.footer}>
          <Button
            label={`Remover ${selectedClients.size} cliente(s)`}
            onPress={handleClearSelected}
            fullWidth
            size="lg"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  backBtn: { marginBottom: Spacing.base, width: 36, height: 36, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.sm },
  title: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  selectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  selectAllText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },
  selectedCount: { fontSize: Typography.xs, color: Colors.textSecondary, backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.full },
  clientItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  clientInfo: { flex: 1 },
  clientName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  clientEmail: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  clientPhone: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
