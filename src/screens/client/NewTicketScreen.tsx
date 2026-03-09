import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { TicketPriority } from '../../types';
import { priorityConfig } from '../../utils/helpers';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

const PRIORITIES = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH];

export function NewTicketScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [submitted, setSubmitted] = useState(false);

  const { openTicket } = useStore();

  const isValid = title.trim().length >= 3 && description.trim().length >= 10;

  const handleSubmit = () => {
    if (!isValid) return;
    openTicket({ title: title.trim(), description: description.trim(), priority });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.statusFinished} />
        </View>
        <Text style={styles.successTitle}>Chamado aberto!</Text>
        <Text style={styles.successText}>
          Nossa equipe recebeu seu chamado e em breve entrará em contato.
        </Text>
        <Button
          label="Voltar para início"
          onPress={() => navigation.navigate('ClientHome')}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.xl }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Título do problema *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Computador não liga"
            placeholderTextColor={Colors.textTertiary}
            maxLength={80}
          />
          <Text style={styles.charCount}>{title.length}/80</Text>
        </View>

        {/* Description field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Descreva o problema *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva com detalhes o que está acontecendo, quando começou, o que já foi tentado..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Priority */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => {
              const config = priorityConfig[p];
              const selected = priority === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityBtn,
                    selected && { borderColor: config.color, backgroundColor: `${config.color}15` },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priorityLabel, { color: selected ? config.color : Colors.textSecondary }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>
            Ao abrir o chamado, um número único será gerado para acompanhamento.
          </Text>
        </View>

        <Button
          label="Abrir Chamado"
          onPress={handleSubmit}
          disabled={!isValid}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    ...Shadows.sm,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  priorityLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.primary,
    lineHeight: 16,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
