import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
  FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Attachment, TicketStatus, UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  selected: boolean;
}

export function AttachmentScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user, tickets, addAttachment } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(ticket?.attachments || []);

  if (!ticket) {
    return <View style={styles.center}><Text style={styles.grayText}>Chamado não encontrado.</Text></View>;
  }

  const isTech = user?.role === UserRole.TECHNICIAN;
  const canAddAttachments = isTech && ticket.status === TicketStatus.IN_PROGRESS;

  const handleUploadFile = async () => {
    if (!attachmentName.trim()) {
      Alert.alert('Erro', 'Digite um nome para o arquivo');
      return;
    }

    setUploading(true);
    // Simular upload de arquivo
    setTimeout(() => {
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: attachmentName,
        fileType: 'application/pdf',
        fileSize: 2048576,
        fileUrl: 'https://example.com/files/' + attachmentName,
        uploadedBy: user?.name || 'Técnico',
        uploadedAt: new Date().toISOString(),
      };

      setAttachments([...attachments, newAttachment]);
      addAttachment(ticketId, newAttachment);
      setAttachmentName('');
      setShowUploadModal(false);
      setUploading(false);

      Alert.alert('Sucesso', 'Arquivo enviado com sucesso!');
    }, 1500);
  };

  const handleDeleteAttachment = (id: string) => {
    Alert.alert('Deletar arquivo', 'Tem certeza que deseja deletar este arquivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => {
          setAttachments(attachments.filter(a => a.id !== id));
        },
      },
    ]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header Info */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
              <Text style={styles.ticketTitle}>{ticket.title}</Text>
            </View>
            {canAddAttachments && (
              <View style={styles.badge}>
                <Ionicons name="lock-open-outline" size={14} color={Colors.success} />
                <Text style={styles.badgeText}>Desbloqueado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Upload Section (only for technician in progress) */}
        {canAddAttachments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adicionar Anexos</Text>
            <Button
              label="+ Selecionar arquivo"
              onPress={() => setShowUploadModal(true)}
              fullWidth
              size="lg"
              icon="cloud-upload-outline"
            />
          </View>
        )}

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arquivos anexados</Text>
            {attachments.map(attachment => (
              <View key={attachment.id} style={styles.attachmentItem}>
                <View style={styles.attachmentIcon}>
                  <Ionicons name="document-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>{attachment.fileName}</Text>
                  <View style={styles.attachmentMeta}>
                    <Text style={styles.attachmentSize}>{formatFileSize(attachment.fileSize)}</Text>
                    <Text style={styles.attachmentDot}>•</Text>
                    <Text style={styles.attachmentDate}>{new Date(attachment.uploadedAt).toLocaleDateString()}</Text>
                    <Text style={styles.attachmentDot}>•</Text>
                    <Text style={styles.attachmentAuthor}>{attachment.uploadedBy}</Text>
                  </View>
                </View>
                <View style={styles.attachmentActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Alert.alert('Download', 'Iniciando download do arquivo...')}
                  >
                    <Ionicons name="download-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  {canAddAttachments && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDeleteAttachment(attachment.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-attach-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>
              {canAddAttachments ? 'Nenhum arquivo anexado ainda' : 'Sem arquivos anexados'}
            </Text>
            {canAddAttachments && (
              <Text style={styles.emptySubtext}>
                Adicione fotos ou documentos relevantes para este chamado
              </Text>
            )}
          </View>
        )}

      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => !uploading && setShowUploadModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Anexar arquivo</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome do arquivo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Foto do dano, Relatório técnico"
                  placeholderTextColor={Colors.textTertiary}
                  value={attachmentName}
                  onChangeText={setAttachmentName}
                  editable={!uploading}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoBoldText}>Tipos de arquivo aceitos:</Text>
                  <Text style={styles.infoText}>PDF, Imagens (JPG, PNG), Documentos (DOC, DOCX)</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoBoldText}>Tamanho máximo:</Text>
                  <Text style={styles.infoText}>10 MB por arquivo</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                label={uploading ? 'Enviando...' : 'Enviar arquivo'}
                onPress={handleUploadFile}
                disabled={uploading || !attachmentName.trim()}
                fullWidth
                size="lg"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grayText: { color: Colors.textTertiary, fontSize: Typography.base },

  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base, marginBottom: Spacing.lg, ...Shadows.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ticketNumber: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  ticketTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  badge: { flexDirection: 'row', gap: 4, backgroundColor: Colors.successLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radii.sm, alignItems: 'center' },
  badgeText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.success },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.base },

  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  attachmentIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  attachmentInfo: { flex: 1 },
  attachmentName: { fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary },
  attachmentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  attachmentSize: { fontSize: Typography.xs, color: Colors.textTertiary },
  attachmentDot: { color: Colors.textTertiary },
  attachmentDate: { fontSize: Typography.xs, color: Colors.textTertiary },
  attachmentAuthor: { fontSize: Typography.xs, color: Colors.textTertiary },
  attachmentActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl, marginTop: Spacing.xl },
  emptyText: { fontSize: Typography.base, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.md },
  emptySubtext: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  modalBody: { padding: Spacing.base },
  modalFooter: { padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.border },

  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary },

  infoBox: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  infoBoldText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  infoText: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
});
