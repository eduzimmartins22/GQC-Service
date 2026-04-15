import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ClearTicketsScreen({ navigation }: any) {
  const { tickets, clearAllTickets } = useStore();
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

  const toggleTicket = (id: string) => {
    const newSet = new Set(selectedTickets);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTickets(newSet);
  };

  const handleClearSelected = () => {
    if (selectedTickets.size === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um chamado para limpar');
      return;
    }

    Alert.alert(
      'Limpar chamados',
      `Deseja remover ${selectedTickets.size} chamado(s)? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearAllTickets();
            setSelectedTickets(new Set());
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpar todos os chamados',
      'Deseja remover TODOS os chamados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllTickets();
            navigation.goBack();
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
          <Ionicons name="trash-outline" size={48} color={Colors.error} />
          <Text style={styles.title}>Limpar chamados</Text>
          <Text style={styles.subtitle}>
            {tickets.length === 0
              ? 'Nenhum chamado para limpar'
              : `Total: ${tickets.length} chamado(s)`}
          </Text>
        </View>

        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Nenhum chamado registrado</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.selectionBar}>
                <TouchableOpacity
                  style={styles.selectAllBtn}
                  onPress={() => {
                    if (selectedTickets.size === tickets.length) {
                      setSelectedTickets(new Set());
                    } else {
                      setSelectedTickets(new Set(tickets.map(t => t.id)));
                    }
                  }}
                >
                  <Ionicons
                    name={selectedTickets.size === tickets.length ? 'checkbox' : 'checkbox-outline'}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.selectAllText}>
                    {selectedTickets.size === tickets.length ? 'Desselecionar tudo' : 'Selecionar tudo'}
                  </Text>
                </TouchableOpacity>
                {selectedTickets.size > 0 && (
                  <Text style={styles.selectedCount}>{selectedTickets.size} selecionado(s)</Text>
                )}
              </View>

              {tickets.map(ticket => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.ticketItem}
                  onPress={() => toggleTicket(ticket.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={selectedTickets.has(ticket.id) ? 'checkbox' : 'checkbox-outline'}
                    size={20}
                    color={selectedTickets.has(ticket.id) ? Colors.error : Colors.textTertiary}
                  />
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                    <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {tickets.length > 0 && (
        <View style={styles.footer}>
          <Button
            label={selectedTickets.size > 0 ? `Limpar ${selectedTickets.size}` : 'Limpar todos'}
            onPress={selectedTickets.size > 0 ? handleClearSelected : handleClearAll}
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
  ticketItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  ticketInfo: { flex: 1 },
  ticketNumber: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  ticketTitle: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
