import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { DistanceWarning } from '../../components/common/DistanceWarning';
import { TicketPriority } from '../../types';
import { EQUIPMENT_CATALOG, EquipmentCategory, EquipmentSubtype } from '../../data/equipmentCatalog';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { calculateDistanceCost } from '../../utils/distanceCalculator';

type Step = 'equipment' | 'subtype' | 'symptom' | 'details';

const PRIORITY_OPTIONS = [
  { value: TicketPriority.LOW,    label: 'Baixa',  color: Colors.textTertiary },
  { value: TicketPriority.MEDIUM, label: 'Média',  color: Colors.warning },
  { value: TicketPriority.HIGH,   label: 'Alta',   color: Colors.error },
];

export function NewTicketScreen({ navigation }: any) {
  const { openTicket } = useStore();

  // Wizard state
  const [step, setStep]             = useState<Step>('equipment');
  const [equipment, setEquipment]   = useState<EquipmentCategory | null>(null);
  const [subtype, setSubtype]       = useState<EquipmentSubtype | null>(null);
  const [symptoms, setSymptoms]     = useState<string[]>([]);
  const [isOther, setIsOther]       = useState(false);
  const [otherText, setOtherText]   = useState('');
  const [extraDetails, setExtra]    = useState('');
  const [priority, setPriority]     = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [distanceKm, setDistanceKm] = useState<string>('');

  // ── Symptom toggle
  const toggleSymptom = (label: string) => {
    setSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  // ── Navigate between steps
  const goBack = () => {
    if (step === 'subtype')  { setSubtype(null);  setStep('equipment'); }
    if (step === 'symptom')  { setSymptoms([]);   setIsOther(false); setStep('subtype'); }
    if (step === 'details')  { setStep('symptom'); }
  };

  const canProceedToDetails = symptoms.length > 0 || (isOther && otherText.trim().length >= 3);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    const distance = distanceKm ? parseInt(distanceKm) : undefined;
    const distanceCost = distance ? calculateDistanceCost(distance) : null;

    await openTicket({
      title: '',
      description: isOther ? otherText.trim() : '',
      priority,
      equipmentId:    equipment?.id,
      equipmentTitle: equipment?.title,
      subtypeId:      subtype?.id,
      subtypeLabel:   subtype?.label,
      symptoms:       isOther ? ['Outros: ' + otherText.trim()] : symptoms,
      isOtherProblem: isOther,
      extraDetails:   extraDetails.trim() || undefined,
      distanceKm:     distance,
      travelCost:     distanceCost?.travelCost,
      hasDistanceWarning: distanceCost?.exceedsLimit,
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
        <Text style={styles.successTitle}>Chamado aberto!</Text>
        <Text style={styles.successSub}>
          Nossa equipe recebeu seu chamado e entrará em contato em breve.
        </Text>
        <Button label="Voltar para início" onPress={() => navigation.navigate('ClientHome')} fullWidth size="lg" style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  const stepIndex = { equipment: 0, subtype: 1, symptom: 2, details: 3 }[step];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        {['Equipamento', 'Tipo', 'Problema', 'Detalhes'].map((label, i) => (
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

        {/* ── STEP 1: EQUIPMENT ── */}
        {step === 'equipment' && (
          <>
            <Text style={styles.stepTitle}>Qual equipamento está com problema?</Text>
            <View style={styles.equipGrid}>
              {EQUIPMENT_CATALOG.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.equipCard}
                  onPress={() => { setEquipment(cat); setStep('subtype'); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.equipIcon, { backgroundColor: cat.color + '18' }]}>
                    {cat.image ? (
                      <Image source={cat.image} style={styles.equipImage} />
                    ) : (
                      <Ionicons name={cat.icon as any} size={30} color={cat.color} />
                    )}
                  </View>
                  <Text style={styles.equipTitle}>{cat.title}</Text>
                  <Text style={styles.equipSub}>{cat.subtypes.length} tipo{cat.subtypes.length > 1 ? 's' : ''}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} style={{ marginTop: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── STEP 2: SUBTYPE ── */}
        {step === 'subtype' && equipment && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.breadcrumb}>
              <Ionicons name={equipment.icon as any} size={16} color={equipment.color} />
              <Text style={[styles.breadcrumbText, { color: equipment.color }]}>{equipment.title}</Text>
            </View>
            <Text style={styles.stepTitle}>Selecione o tipo</Text>
            {equipment.subtypes.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={styles.listItem}
                onPress={() => { setSubtype(sub); setStep('symptom'); }}
                activeOpacity={0.75}
              >
                <View style={styles.listItemLeft}>
                  <View style={[styles.listDot, { backgroundColor: equipment.color }]} />
                  <Text style={styles.listItemText}>{sub.label}</Text>
                </View>
                <View style={styles.listItemRight}>
                  <Text style={styles.listItemCount}>{sub.symptoms.length} problemas</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── STEP 3: SYMPTOM ── */}
        {step === 'symptom' && equipment && subtype && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.breadcrumb}>
              <Ionicons name={equipment.icon as any} size={16} color={equipment.color} />
              <Text style={[styles.breadcrumbText, { color: equipment.color }]}>
                {equipment.title} › {subtype.label}
              </Text>
            </View>
            <Text style={styles.stepTitle}>Qual o problema? <Text style={styles.stepHint}>(pode marcar mais de um)</Text></Text>

            {subtype.symptoms.map(s => {
              const selected = symptoms.includes(s.label);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.checkItem, selected && styles.checkItemActive]}
                  onPress={() => { setIsOther(false); toggleSymptom(s.label); }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                    {selected && <Ionicons name="checkmark" size={13} color={Colors.white} />}
                  </View>
                  <Text style={[styles.checkLabel, selected && styles.checkLabelActive]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Outros */}
            <TouchableOpacity
              style={[styles.checkItem, isOther && styles.checkItemActive]}
              onPress={() => { setSymptoms([]); setIsOther(!isOther); }}
              activeOpacity={0.75}
            >
              <View style={[styles.checkbox, isOther && styles.checkboxActive]}>
                {isOther && <Ionicons name="checkmark" size={13} color={Colors.white} />}
              </View>
              <Text style={[styles.checkLabel, isOther && styles.checkLabelActive]}>Outros (descrever)</Text>
            </TouchableOpacity>

            {isOther && (
              <TextInput
                style={styles.otherInput}
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Descreva o problema..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoFocus
              />
            )}

            <Button
              label="Continuar"
              onPress={() => setStep('details')}
              disabled={!canProceedToDetails}
              fullWidth size="lg"
              style={{ marginTop: Spacing.lg }}
            />
          </>
        )}

        {/* ── STEP 4: DETAILS ── */}
        {step === 'details' && (
          <>
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Colors.primary} />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>

            {/* Summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo do chamado</Text>
              <SummaryRow icon="hardware-chip-outline" label="Equipamento" value={`${equipment?.title} — ${subtype?.label}`} />
              <SummaryRow icon="warning-outline" label="Problema(s)"
                value={isOther ? otherText : symptoms.join(' • ')} />
            </View>

           

            {/* Distance Warning */}
            {distanceKm && parseInt(distanceKm) > 0 && (
              <DistanceWarning distanceKm={parseInt(distanceKm)} showFullDetails={true} />
            )}

            {/* Extra details */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Detalhes adicionais <Text style={styles.optional}>(opcional)</Text></Text>
              <TextInput
                style={styles.textArea}
                value={extraDetails}
                onChangeText={setExtra}
                placeholder="Algum detalhe extra, horário de disponibilidade, aviso importante..."
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
              label={submitting ? 'Enviando...' : 'Abrir Chamado'}
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
  stepHint: { fontSize: Typography.sm, fontWeight: '400', color: Colors.textTertiary },

  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  equipCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: Radii.lg,
    padding: Spacing.md, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.sm,
  },
  equipIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  equipImage: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
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
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listItemCount: { fontSize: Typography.xs, color: Colors.textTertiary },

  checkItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base,
    marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border,
  },
  checkItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkLabel: { fontSize: Typography.base, color: Colors.textSecondary, flex: 1 },
  checkLabelActive: { color: Colors.primary, fontWeight: '700' },
  otherInput: {
    backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base,
    color: Colors.textPrimary, minHeight: 80, marginTop: Spacing.sm,
  },

  summaryCard: { backgroundColor: Colors.primaryLight, borderRadius: Radii.lg, padding: Spacing.base, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30' },
  summaryTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  summaryLabel: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },
  summaryValue: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: '600', lineHeight: 18 },

  fieldGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  optional: { color: Colors.textTertiary, fontWeight: '400' },
  distanceInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  distanceInput: { flex: 1, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary },
  distanceUnit: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary, marginLeft: Spacing.xs },
  textArea: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 100 },
  charCount: { fontSize: Typography.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radii.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.white },
  priorityLabel: { fontSize: Typography.sm, fontWeight: '600' },
});
