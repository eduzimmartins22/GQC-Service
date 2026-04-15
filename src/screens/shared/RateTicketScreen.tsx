 import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function RateTicketScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { tickets, rateTicket } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!ticket) return null;

  if (submitted) {
    return (
      <View style={styles.successWrap}>
        <Ionicons name="star" size={64} color={Colors.warning} />
        <Text style={styles.successTitle}>Obrigado pela avaliação!</Text>
        <Text style={styles.successSub}>Seu feedback nos ajuda a melhorar o serviço.</Text>
        <Button label="Voltar" onPress={() => navigation.goBack()} fullWidth size="lg" style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) return;
    rateTicket(ticketId, rating, comment.trim() || undefined);
    setSubmitted(true);
  };

  const stars = [1, 2, 3, 4, 5];
  const labels = ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Como foi o atendimento?</Text>
        <Text style={styles.ticketNum}>{ticket.ticketNumber} · {ticket.title}</Text>

        <View style={styles.starsRow}>
          {stars.map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
              <Ionicons
                name={s <= rating ? 'star' : 'star-outline'}
                size={44}
                color={s <= rating ? Colors.warning : Colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text style={styles.ratingLabel}>{labels[rating]}</Text>
        )}

        <Text style={styles.commentLabel}>Deixe um comentário (opcional)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="O que você achou do serviço?"
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>

      <Button
        label="Enviar avaliação"
        onPress={handleSubmit}
        disabled={rating === 0}
        fullWidth
        size="lg"
        style={{ marginTop: Spacing.base }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base },
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.xl, ...Shadows.sm },
  heading: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  ticketNum: { fontSize: Typography.sm, color: Colors.textTertiary, marginBottom: Spacing.xl },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  ratingLabel: { textAlign: 'center', fontSize: Typography.base, fontWeight: '700', color: Colors.warning, marginBottom: Spacing.lg },
  commentLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  commentInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  successWrap: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  successTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.lg },
  successSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
