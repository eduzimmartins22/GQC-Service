import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'E-mail enviado',
        'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha em breve.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Esqueci minha senha</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.description}>
            Digite seu e-mail cadastrado e enviaremos instruções para redefinir sua senha.
          </Text>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Reset button */}
          <Button
            label={isLoading ? 'Enviando...' : 'Enviar instruções'}
            onPress={handleResetPassword}
            disabled={!email.trim() || isLoading}
            fullWidth
            size="lg"
            style={styles.resetBtn}
          />

          {/* Back to login hint */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>
              Lembrou sua senha? <Text style={styles.backToLoginLink}>Voltar ao login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.xl },

  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xxl,
  },
  backBtn: { marginRight: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, flex: 1 },

  content: { alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },

  description: {
    fontSize: Typography.base, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.xxl,
    lineHeight: 24,
  },

  fieldGroup: { width: '100%', marginBottom: Spacing.lg },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radii.md, backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md, minHeight: 48,
    ...Shadows.sm,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },

  resetBtn: { marginTop: Spacing.md },

  backToLogin: { marginTop: Spacing.xl },
  backToLoginText: { fontSize: Typography.sm, color: Colors.textSecondary },
  backToLoginLink: { color: Colors.primary, fontWeight: '700' },
});