import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { User } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ClearClientsScreen({ navigation }: any) {
  const { clearClients, getAllClients } = useStore();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      const allClients = await getAllClients();
      setClients(allClients);
      setLoading(false);
    };
    loadClients();
  }, []);

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleClearSelected = () => {
    if (selectedClients.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um cliente para remover.');
      return;
    }

    Alert.alert(
      'Confirmar remoção',
      `Deseja remover ${selectedClients.length} cliente${selectedClients.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita e removerá também todos os chamados desses clientes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await clearClients(selectedClients);
            setSelectedClients([]);
            // Reload clients after deletion
            const updatedClients = await getAllClients();
            setClients(updatedClients);
            Alert.alert('Sucesso', 'Clientes removidos com sucesso.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Carregando clientes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Limpar Clientes</Text>
        <Text style={styles.subtitle}>
          Selecione os clientes que deseja remover permanentemente
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {clients.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
          </View>
        ) : clients.map(client => {
          const isSelected = selectedClients.includes(client.id);

          return (
            <TouchableOpacity
              key={client.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleClient(client.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  )}
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientMeta}>{client.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedClients.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearSelected}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
            <Text style={styles.clearBtnText}>
              Remover {selectedClients.length} cliente{selectedClients.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: Typography.base, color: Colors.textSecondary },
  header: { padding: Spacing.lg, backgroundColor: Colors.white, ...Shadows.sm },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  cardSelected: { borderWidth: 2, borderColor: Colors.primary },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  checkbox: {
    width: 24, height: 24, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  clientInfo: { flex: 1 },
  clientName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  clientMeta: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textTertiary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg, ...Shadows.lg,
  },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.error, borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  clearBtnText: { fontSize: Typography.base, fontWeight: '700', color: Colors.white },
});