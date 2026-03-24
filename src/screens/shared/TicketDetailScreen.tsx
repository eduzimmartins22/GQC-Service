import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Linking, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { Button } from '../../components/common/Button';
import { TicketStatus, UserRole } from '../../types';
import { formatDateTime, WHATSAPP_NUMBER, timeAgo } from '../../utils/helpers';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function TicketDetailScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user, tickets, updateTicketStatus, addNote } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);

  const [showFinalizationModal, setShowFinalizationModal] = useState(false);
  const [finalizationNote, setFinalizationNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (!ticket) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Chamado não encontrado.</Text>
      </View>
    );
  }

  const isTechnician = user?.role === UserRole.TECHNICIAN;
  const isClient = user?.role === UserRole.CLIENT;
  const canRate = isClient && ticket.status === TicketStatus.FINISHED && !ticket.rating;

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (newStatus === TicketStatus.FINISHED) {
      setShowFinalizationModal(true);
      return;
    }
    const labels: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Aberto',
      [TicketStatus.IN_PROGRESS]: 'Em andamento',
      [TicketStatus.FINISHED]: 'Finalizado',
    };
    Alert.alert('Alterar status', `Alterar para "${labels[newStatus]}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => updateTicketStatus(ticketId, newStatus) },
    ]);
  };

  const handleFinalize = () => {
    if (finalizationNote.trim().length < 10) {
      Alert.alert('Atenção', 'Deixe uma nota de finalização para o cliente (mínimo 10 caracteres).');
      return;
    }
    updateTicketStatus(ticketId, TicketStatus.FINISHED, finalizationNote.trim());
    setShowFinalizationModal(false);
    setFinalizationNote('');
  };

  const handleAddNote = () => {
    if (noteText.trim().length < 5) return;
    addNote(ticketId, noteText.trim());
    setNoteText('');
    setShowAddNote(false);
  };

  const handleWhatsApp = () => {
    const msg = `Olá! Gostaria de informações sobre o chamado ${ticket.ticketNumber}: ${ticket.title}`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            <StatusBadge status={ticket.status} />
          </View>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.priorityRow}>
            <PriorityBadge priority={ticket.priority} />
            {ticket.category && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{ticket.category}</Text>
              </View>
            )}
            <Text style={styles.metaText}>Atualizado {formatDateTime(ticket.updatedAt)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{ticket.description}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.card}>
            <InfoRow icon="person-outline" label="Cliente" value={ticket.clientName} />
            <Divider />
            <InfoRow icon="build-outline" label="Técnico" value={ticket.technicianName || 'Não atribuído'} />
            <Divider />
            <InfoRow icon="calendar-outline" label="Aberto em" value={formatDateTime(ticket.createdAt)} />
            {ticket.closedAt && (
              <>
                <Divider />
                <InfoRow icon="checkmark-circle-outline" label="Finalizado em" value={formatDateTime(ticket.closedAt)} />
              </>
            )}
          </View>
        </View>

        {/* Finalization note (visible to client when finished) */}
        {ticket.finalizationNote && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Instrução do técnico</Text>
            <View style={[styles.card, styles.finalizationCard]}>
              <View style={styles.finalizationHeader}>
                <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
                <Text style={styles.finalizationBy}>Nota de {ticket.technicianName}</Text>
              </View>
              <Text style={styles.finalizationText}>{ticket.finalizationNote}</Text>
            </View>
          </View>
        )}

        {/* Rating (if exists) */}
        {ticket.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação do cliente</Text>
            <View style={styles.card}>
              <View style={styles.ratingRow}>
                {[1,2,3,4,5].map(s => (
                  <Ionicons key={s} name={s <= ticket.rating! ? 'star' : 'star-outline'} size={20} color={Colors.warning} />
                ))}
                <Text style={styles.ratingNum}>{ticket.rating}/5</Text>
              </View>
              {ticket.ratingComment && (
                <Text style={styles.ratingComment}>"{ticket.ratingComment}"</Text>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {(ticket.notes && ticket.notes.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas internas</Text>
            {ticket.notes.map(note => (
              <View key={note.id} style={[styles.card, styles.noteCard]}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteAuthor}>{note.authorName}</Text>
                  <Text style={styles.noteTime}>{timeAgo(note.createdAt)}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Technician actions */}
        {isTechnician && ticket.status !== TicketStatus.FINISHED && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações do técnico</Text>
            <View style={styles.actionsCard}>
              {ticket.status === TicketStatus.OPEN && (
                <Button
                  label="Assumir chamado"
                  onPress={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                  fullWidth
                  style={{ marginBottom: Spacing.sm }}
                />
              )}
              {ticket.status === TicketStatus.IN_PROGRESS && (
                <Button
                  label="Finalizar chamado"
                  onPress={() => handleStatusChange(TicketStatus.FINISHED)}
                  fullWidth
                  style={{ marginBottom: Spacing.sm, backgroundColor: Colors.statusFinished }}
                />
              )}
              <TouchableOpacity style={styles.addNoteBtn} onPress={() => setShowAddNote(true)}>
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.addNoteText}>Adicionar nota interna</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Client actions */}
        {isClient && (
          <View style={styles.section}>
            {canRate && (
              <Button
                label="⭐ Avaliar atendimento"
                onPress={() => navigation.navigate('RateTicket', { ticketId })}
                fullWidth
                style={{ marginBottom: Spacing.sm, backgroundColor: Colors.warning }}
              />
            )}
            <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.waBtnText}>Falar com suporte via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Finalization Modal */}
      <Modal visible={showFinalizationModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nota de finalização</Text>
              <TouchableOpacity onPress={() => setShowFinalizationModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Deixe uma instrução ou dica para o cliente sobre o serviço realizado.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={finalizationNote}
              onChangeText={setFinalizationNote}
              placeholder="Ex: Instalado novo driver da impressora. Para reconectar no futuro, acesse Configurações > Impressoras..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={600}
              autoFocus
            />
            <Text style={styles.charCount}>{finalizationNote.length}/600</Text>
            <Button
              label="Finalizar chamado"
              onPress={handleFinalize}
              disabled={finalizationNote.trim().length < 10}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.md, backgroundColor: Colors.statusFinished }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={showAddNote} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nota interna</Text>
              <TouchableOpacity onPress={() => setShowAddNote(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Registre informações relevantes sobre o chamado.</Text>
            <TextInput
              style={styles.modalInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Ex: Verificado problema na placa de rede..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={400}
              autoFocus
            />
            <Button
              label="Salvar nota"
              onPress={handleAddNote}
              disabled={noteText.trim().length < 5}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={15} color={Colors.textTertiary} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textSecondary },

  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, ...Shadows.sm, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingBottom: Spacing.sm },
  ticketNumber: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textTertiary },
  title: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, flexWrap: 'wrap' },
  metaText: { fontSize: Typography.xs, color: Colors.textTertiary },
  categoryPill: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full },
  categoryText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.primary },

  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.3 },
  description: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 22, padding: Spacing.base },

  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, maxWidth: '55%' },

  finalizationCard: { borderLeftWidth: 3, borderLeftColor: Colors.warning },
  finalizationHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.base, paddingBottom: Spacing.sm },
  finalizationBy: { fontSize: Typography.sm, fontWeight: '700', color: Colors.warning },
  finalizationText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: 22, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.base, paddingBottom: Spacing.sm },
  ratingNum: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginLeft: Spacing.sm },
  ratingComment: { fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic', paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },

  noteCard: { marginBottom: Spacing.sm },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, paddingBottom: Spacing.xs },
  noteAuthor: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary },
  noteTime: { fontSize: Typography.xs, color: Colors.textTertiary },
  noteContent: { fontSize: Typography.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, lineHeight: 18 },

  actionsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base, ...Shadows.sm },
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, justifyContent: 'center' },
  addNoteText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },

  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.white, borderRadius: Radii.lg, ...Shadows.sm, borderWidth: 1, borderColor: '#E8F5E8' },
  waBtnText: { fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.overlay },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  modalSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 18 },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
});
