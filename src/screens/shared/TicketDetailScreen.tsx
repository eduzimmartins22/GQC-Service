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
  const { user, tickets, updateTicketStatus, addNote, getUnreadMessages } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);

  const [showFinalModal, setShowFinalModal] = useState(false);
  const [finalNote, setFinalNote]           = useState('');
  const [showNoteModal, setShowNoteModal]   = useState(false);
  const [noteText, setNoteText]             = useState('');

  if (!ticket) {
    return <View style={styles.center}><Text style={styles.grayText}>Chamado não encontrado.</Text></View>;
  }

  const isTech   = user?.role === UserRole.TECHNICIAN;
  const isClient = user?.role === UserRole.CLIENT;
  const canRate  = isClient && ticket.status === TicketStatus.FINISHED && !ticket.rating;
  const unreadMsgs = getUnreadMessages(ticketId);

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (newStatus === TicketStatus.FINISHED) { setShowFinalModal(true); return; }
    Alert.alert('Alterar status', 'Confirmar alteração?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => updateTicketStatus(ticketId, newStatus) },
    ]);
  };

  const handleFinalize = () => {
    updateTicketStatus(ticketId, TicketStatus.FINISHED, finalNote.trim() || undefined);
    setShowFinalModal(false); setFinalNote('');
  };

  const handleAddNote = () => {
    if (noteText.trim().length < 5) return;
    addNote(ticketId, noteText.trim());
    setNoteText(''); setShowNoteModal(false);
  };

  const handleWhatsApp = () => {
    const msg = `Olá! Chamado ${ticket.ticketNumber}: ${ticket.title}`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  };

  const handleMapsLink = () => {
    const addr = ticket.clientAddress;
    if (!addr) return;
    // Construir endereço filtrando campos vazios
    const parts = [
      addr.street,
      addr.number,
      addr.complement,
      addr.neighborhood,
      addr.city,
      addr.state,
      addr.cep,
    ].filter(p => p && p.trim() !== '');
    const query = encodeURIComponent(parts.join(', '));
    if (!query) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── HEADER CARD ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            <StatusBadge status={ticket.status} />
          </View>
          <Text style={styles.title}>{ticket.title}</Text>
          <View style={styles.tagsRow}>
            <PriorityBadge priority={ticket.priority} />
            {ticket.equipmentTitle && (
              <View style={styles.pill}><Text style={styles.pillText}>{ticket.equipmentTitle}</Text></View>
            )}
            <Text style={styles.metaText}>Atualizado {formatDateTime(ticket.updatedAt)}</Text>
          </View>
        </View>

        {/* ── EQUIPMENT & SYMPTOMS ── */}
        {(ticket.subtypeLabel || (ticket.symptoms && ticket.symptoms.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipamento e problema</Text>
            <View style={styles.card}>
              {ticket.subtypeLabel && (
                <InfoRow icon="settings-outline" label="Tipo" value={ticket.subtypeLabel} />
              )}
              {ticket.symptoms && ticket.symptoms.length > 0 && (
                <>
                  <Divider />
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Ionicons name="warning-outline" size={15} color={Colors.textTertiary} />
                      <Text style={styles.infoLabel}>Sintomas</Text>
                    </View>
                    <View style={styles.symptomsWrap}>
                      {ticket.symptoms.map((s, i) => (
                        <View key={i} style={styles.symptomPill}>
                          <Text style={styles.symptomText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
              {ticket.extraDetails && (
                <>
                  <Divider />
                  <InfoRow icon="document-text-outline" label="Detalhe extra" value={ticket.extraDetails} />
                </>
              )}
              {ticket.description && ticket.description.length > 0 && (
                <>
                  <Divider />
                  <InfoRow icon="chatbox-outline" label="Descrição" value={ticket.description} />
                </>
              )}
            </View>
          </View>
        )}

        {/* ── CLIENT INFO (full detail for technician) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isTech ? '👤 Informações do cliente' : 'Informações'}
          </Text>
          <View style={styles.card}>
            <InfoRow icon="person-outline"       label="Nome"     value={ticket.clientName} />
            {ticket.clientPhone && <><Divider /><InfoRow icon="call-outline" label="Telefone" value={ticket.clientPhone} /></>}
            {ticket.clientCpf   && <><Divider /><InfoRow icon="card-outline" label="CPF"      value={ticket.clientCpf} /></>}
            {ticket.clientEmail && <><Divider /><InfoRow icon="mail-outline" label="E-mail"   value={ticket.clientEmail} /></>}
            {ticket.technicianName && (
              <><Divider /><InfoRow icon="build-outline" label="Técnico" value={ticket.technicianName} /></>
            )}
            <Divider />
            <InfoRow icon="calendar-outline" label="Aberto em" value={formatDateTime(ticket.createdAt)} />
            {ticket.closedAt && (
              <><Divider /><InfoRow icon="checkmark-circle-outline" label="Finalizado em" value={formatDateTime(ticket.closedAt)} /></>
            )}
          </View>
        </View>

        {/* ── ADDRESS / LOCATION (technician gets map link) ── */}
        {ticket.clientAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Localização do cliente</Text>
            <View style={styles.card}>
              <InfoRow icon="location-outline" label="CEP" value={ticket.clientAddress.cep} />
              {ticket.clientAddress.street && (
                <>
                  <Divider />
                  <InfoRow icon="map-outline" label="Endereço"
                    value={`${ticket.clientAddress.street}, ${ticket.clientAddress.number}${ticket.clientAddress.complement ? ' — ' + ticket.clientAddress.complement : ''}`} />
                  <Divider />
                  <InfoRow icon="flag-outline" label="Bairro / Cidade"
                    value={`${ticket.clientAddress.neighborhood}, ${ticket.clientAddress.city} - ${ticket.clientAddress.state}`} />
                </>
              )}
              {isTech && (
                <>
                  <Divider />
                  <TouchableOpacity style={styles.mapsBtn} onPress={handleMapsLink} activeOpacity={0.8}>
                    <Ionicons name="navigate" size={16} color={Colors.white} />
                    <Text style={styles.mapsBtnText}>Abrir no Google Maps</Text>
                    <Ionicons name="open-outline" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* ── FINALIZATION NOTE ── */}
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

        {/* ── RATING ── */}
        {ticket.rating && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação</Text>
            <View style={styles.card}>
              <View style={styles.ratingRow}>
                {[1,2,3,4,5].map(s => (
                  <Ionicons key={s} name={s <= ticket.rating! ? 'star' : 'star-outline'} size={22} color={Colors.warning} />
                ))}
                <Text style={styles.ratingNum}>{ticket.rating}/5</Text>
              </View>
              {ticket.ratingComment && <Text style={styles.ratingComment}>"{ticket.ratingComment}"</Text>}
            </View>
          </View>
        )}

        {/* ── INTERNAL NOTES (technician only) ── */}
        {isTech && ticket.notes && ticket.notes.length > 0 && (
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

        {/* ── CHAT BUTTON ── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', { ticketId })}
            activeOpacity={0.85}
          >
            <View style={styles.chatBtnLeft}>
              <View style={styles.chatIcon}>
                <Ionicons name="chatbubbles" size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.chatBtnTitle}>
                  {isTech ? 'Mensagens com o cliente' : 'Mensagens com o técnico'}
                </Text>
                <Text style={styles.chatBtnSub}>Chat do chamado</Text>
              </View>
            </View>
            {unreadMsgs > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadMsgs}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── TECHNICIAN ACTIONS ── */}
        {isTech && ticket.status !== TicketStatus.FINISHED && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações do técnico</Text>
            <View style={styles.actionsCard}>
              {ticket.status === TicketStatus.IN_PROGRESS && (
                <TouchableOpacity
                  style={styles.trackingBtn}
                  onPress={() => navigation.navigate('Tracking', { ticketId })}
                  activeOpacity={0.85}
                >
                  <View style={styles.trackingLeft}>
                    <View style={styles.trackingIcon}><Ionicons name="navigate" size={18} color={Colors.white} /></View>
                    <View>
                      <Text style={styles.trackingTitle}>Navegar até o cliente</Text>
                      <Text style={styles.trackingSub}>Abrir mapa de rastreamento</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
              {ticket.status === TicketStatus.OPEN && (
                <Button label="Assumir chamado" onPress={() => handleStatusChange(TicketStatus.IN_PROGRESS)} fullWidth style={{ marginBottom: Spacing.sm }} />
              )}
              {ticket.status === TicketStatus.IN_PROGRESS && (
                <Button label="Finalizar chamado" onPress={() => handleStatusChange(TicketStatus.FINISHED)} fullWidth style={{ marginTop: Spacing.sm, backgroundColor: Colors.statusFinished }} />
              )}
              <TouchableOpacity style={styles.addNoteBtn} onPress={() => setShowNoteModal(true)}>
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.addNoteText}>Adicionar nota interna</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── CLIENT ACTIONS ── */}
        {isClient && (
          <View style={styles.section}>
            {ticket.status === TicketStatus.IN_PROGRESS && (
              <TouchableOpacity style={styles.trackingBtn} onPress={() => navigation.navigate('Tracking', { ticketId })} activeOpacity={0.85}>
                <View style={styles.trackingLeft}>
                  <View style={styles.trackingIcon}><Ionicons name="navigate" size={18} color={Colors.white} /></View>
                  <View>
                    <Text style={styles.trackingTitle}>Acompanhar técnico</Text>
                    <Text style={styles.trackingSub}>Ver localização em tempo real</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
            {canRate && (
              <Button label="⭐ Avaliar atendimento"
                onPress={() => navigation.navigate('RateTicket', { ticketId })}
                fullWidth style={{ marginBottom: Spacing.sm, backgroundColor: Colors.warning }} />
            )}
            <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={styles.waBtnText}>Falar com suporte via WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── FINALIZATION MODAL ── */}
      <Modal visible={showFinalModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nota de finalização</Text>
              <TouchableOpacity onPress={() => setShowFinalModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Deixe uma instrução ou dica para o cliente (opcional).</Text>
            <TextInput
              style={styles.modalInput} value={finalNote} onChangeText={setFinalNote}
              placeholder="Ex: Instale o driver X antes de reiniciar..."
              placeholderTextColor={Colors.textTertiary}
              multiline numberOfLines={5} textAlignVertical="top" maxLength={600} autoFocus
            />
            <Text style={styles.charCount}>{finalNote.length}/600</Text>
            <Button label="Finalizar chamado" onPress={handleFinalize} fullWidth size="lg" style={{ marginTop: Spacing.md, backgroundColor: Colors.statusFinished }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── ADD NOTE MODAL ── */}
      <Modal visible={showNoteModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nota interna</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Registre informações sobre o atendimento.</Text>
            <TextInput
              style={styles.modalInput} value={noteText} onChangeText={setNoteText}
              placeholder="Ex: Verificado problema na fonte de alimentação..."
              placeholderTextColor={Colors.textTertiary}
              multiline numberOfLines={4} textAlignVertical="top" maxLength={400} autoFocus
            />
            <Button label="Salvar nota" onPress={handleAddNote} disabled={noteText.trim().length < 5} fullWidth size="lg" style={{ marginTop: Spacing.md }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | undefined }) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={15} color={Colors.textTertiary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>{value.trim()}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: Spacing.base }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grayText: { color: Colors.textSecondary },

  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, ...Shadows.sm, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.base, paddingBottom: Spacing.sm },
  ticketNumber: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  title: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, flexWrap: 'wrap' },
  pill: { backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full },
  pillText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.primary },
  metaText: { fontSize: Typography.xs, color: Colors.textTertiary },

  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.4 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: Spacing.base, gap: Spacing.sm },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, maxWidth: '58%', textAlign: 'right' },

  symptomsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', maxWidth: '60%' },
  symptomPill: { backgroundColor: Colors.errorBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full },
  symptomText: { fontSize: 11, fontWeight: '700', color: Colors.error },

  mapsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, margin: Spacing.base, borderRadius: Radii.md, padding: Spacing.md },
  mapsBtnText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.white, flex: 1, textAlign: 'center' },

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

  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primaryLight, borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primary + '30' },
  chatBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  chatIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  chatBtnTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  chatBtnSub: { fontSize: Typography.xs, color: Colors.primary, opacity: 0.7 },
  unreadBadge: { backgroundColor: Colors.error, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: '800' },

  actionsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base, ...Shadows.sm },
  trackingBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primaryLight, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.primary + '30' },
  trackingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  trackingIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  trackingTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  trackingSub: { fontSize: Typography.xs, color: Colors.primary, opacity: 0.7, marginTop: 2 },
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, justifyContent: 'center' },
  addNoteText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },

  waBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.white, borderRadius: Radii.lg, ...Shadows.sm, borderWidth: 1, borderColor: '#E8F5E8' },
  waBtnText: { fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.overlay },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  modalTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  modalSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, lineHeight: 18 },
  modalInput: { backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 100 },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
});
