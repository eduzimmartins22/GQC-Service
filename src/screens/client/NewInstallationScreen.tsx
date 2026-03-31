import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { TicketPriority } from '../../types';
import { INSTALLATION_CATALOG, InstallationCategory, InstallationItem } from '../../data/installationCatalog';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

type InstallStep = 'category' | 'item' | 'details';

const PRIORITY_OPTIONS = [
  { value: TicketPriority.LOW,    label: 'Baixa',  color: Colors.textTertiary },
  { value: TicketPriority.MEDIUM, label: 'Média',  color: Colors.warning },
  { value: TicketPriority.HIGH,   label: 'Alta',   color: Colors.error },
];

export function NewInstallationScreen({ navigation }: any) {
  const { openTicket } = useStore();

  // Wizard state
  const [step, setStep]               = useState<InstallStep>('category');
  const [category, setCategory]       = useState<InstallationCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<InstallationItem | null>(null);
  const [extraDetails, setExtra]      = useState('');
  const [priority, setPriority]       = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [submitted, setSubmitted]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  // ── Navigate between steps
  const goBack = () => {
    if (step === 'item')    { setSelectedItem(null); setStep('category'); }
    if (step === 'details') { setStep(selectedItem ? 'item' : 'category'); }
  };

  const canProceedToDetails = selectedItem || category?.items.length === 0;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    await openTicket({
      title: `Instalação: ${category?.title}${selectedItem ? ' - ' + selectedItem.label : ''}`,
      description: `Solicitação de instalação de ${category?.title}`,
      priority,
      installationId:    selectedItem?.id || category?.id,
      installationTitle: selectedItem?.label || category?.title,
      installationCategory: category?.id,
      extraDetails:      extraDetails.trim() || undefined,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  // ── Success screen
  if (submitted) {
    return (
      <View style={styles.successWrap}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.statusFinished} />
        </View>
        <Text style={styles.successTitle}>Solicitação enviada!</Text>
        <Text style={styles.successSub}>
          Nossa equipe recebeu sua solicitação de instalação e entrará em contato em breve.
        </Text>
        <Button label="Voltar para início" onPress={() => navigation.navigate('ClientHome')} fullWidth size="lg" style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  const stepIndex = { category: 0, item: 1, details: 2 }[step];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        {['Categoria', 'Tipo', 'Detalhes'].map((label, i) => (
          <View key={i} style={styles.progressItem}>
            <View style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]}>
              {i < stepIndex
                ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                : <Text style={[styles.progressNum, i === stepIndex && styles.progressNumActive]}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.progressLabel, i === stepIndex && styles.progressLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── STEP 1: CATEGORY ── */}
        {step === 'category' && (
          <>
            <Text style={styles.stepTitle}>Qual é o tipo de instalação?</Text>
            <View style={styles.equipGrid}>
              {INSTALLATION_CATALOG.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.equipCard}
                  onPress={() => { setCategory(cat); setStep(cat.items.length > 0 ? 'item' : 'details'); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.equipIcon, { backgroundColor: cat.color + '18' }]}>
                    <Ionicons name={cat.icon as any} size={30} color={cat.color} />
                  </View>
                  <Text style={styles.equipTitle}>{cat.title}</Text>
                  {cat.items.length > 0 && (
                    <Text style={styles.equipSub}>{cat.items.length} opção{cat.items.length > 1 ? 's' : ''}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} style={{ marginTop: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── STEP 2: ITEM ── */}
        {step === 'item' && category && category.items.length > 0 && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.breadcrumb}>
              <Ionicons name={category.icon as any} size={16} color={category.color} />
              <Text style={[styles.breadcrumbText, { color: category.color }]}>{category.title}</Text>
            </View>
            <Text style={styles.stepTitle}>Selecione a opção</Text>
            {category.items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.listItem}
                onPress={() => { setSelectedItem(item); setStep('details'); }}
                activeOpacity={0.75}
              >
                <View style={styles.listItemLeft}>
                  <View style={[styles.listDot, { backgroundColor: category.color }]} />
                  <Text style={styles.listItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── STEP 3: DETAILS ── */}
        {step === 'details' && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>

            {/* Summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo da solicitação</Text>
              <SummaryRow icon="cog-outline" label="Instalação" value={selectedItem ? `${category?.title} — ${selectedItem.label}` : category?.title || ''} />
            </View>

            {/* Extra details */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Detalhes adicionais <Text style={styles.optional}>(opcional)</Text></Text>
              <TextInput
                style={styles.textArea}
                value={extraDetails}
                onChangeText={setExtra}
                placeholder="Informações sobre a instalação, local, horário de disponibilidade..."
                placeholderTextColor={Colors.textTertiary}
                multiline numberOfLines={4}
                textAlignVertical="top"
                maxLength={400}
              />
              <Text style={styles.charCount}>{extraDetails.length}/400</Text>
            </View>

            {/* Priority */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Prioridade</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_OPTIONS.map(p => {
                  const sel = priority === p.value;
                  return (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => setPriority(p.value)}
                      style={[styles.priorityBtn, sel && { borderColor: p.color, backgroundColor: p.color + '15' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.priorityLabel, { color: sel ? p.color : Colors.textSecondary }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Button
              label={submitting ? 'Enviando...' : 'Enviar Solicitação'}
              onPress={handleSubmit}
              disabled={submitting}
              fullWidth size="lg"
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon as any} size={15} color={Colors.textTertiary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successWrap: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successIcon: { marginBottom: Spacing.lg },
  successTitle: { fontSize: Typography.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  successSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  progressWrap: { flexDirection: 'row', backgroundColor: Colors.white, paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  progressItem: { flex: 1, alignItems: 'center', gap: 4 },
  progressDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  progressDotActive: { backgroundColor: Colors.primary },
  progressNum: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary },
  progressNumActive: { color: Colors.white },
  progressLabel: { fontSize: 9, color: Colors.textTertiary, fontWeight: '600' },
  progressLabelActive: { color: Colors.primary },

  content: { padding: Spacing.base, paddingBottom: 60 },

  stepTitle: { fontSize: Typography.md, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.base },

  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  equipCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: Radii.lg,
    padding: Spacing.md, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.sm,
  },
  equipIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  equipTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.textPrimary },
  equipSub: { fontSize: Typography.xs, color: Colors.textTertiary },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  backText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },

  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: 6, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  breadcrumbText: { fontSize: Typography.xs, fontWeight: '700' },

  listItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadows.sm,
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  listDot: { width: 8, height: 8, borderRadius: 4 },
  listItemText: { fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary, flex: 1 },

  summaryCard: { backgroundColor: Colors.primaryLight, borderRadius: Radii.lg, padding: Spacing.base, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30' },
  summaryTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  summaryLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },
  summaryValue: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: '600', lineHeight: 18 },

  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  optional: { color: Colors.textTertiary, fontWeight: '400' },
  textArea: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 100 },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radii.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.white },
  priorityLabel: { fontSize: Typography.sm, fontWeight: '600' },
});
