import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { validateEmail } from '../../utils/validations';

export function ResetPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [storedCode, setStoredCode] = useState('');

  const { users } = useStore();

  const handleSendCode = async () => {
    setError('');
    const emailValidation = validateEmail(email);
    
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    setIsLoading(true);
    
    // Simular envio de código
    await new Promise(r => setTimeout(r, 1000));
    
    // Gerar código aleatório de 6 dígitos
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStoredCode(randomCode);

    // Alert com o código (em produção seria por email)
    Alert.alert(
      'Código de recuperação',
      `Seu código é: ${randomCode}\n\n(Em produção seria enviado por email)`,
      [{ text: 'OK', onPress: () => setStep('code') }]
    );

    setIsLoading(false);
  };

  const handleVerifyCode = () => {
    setError('');
    if (code !== storedCode) {
      setError('Código inválido. Tente novamente.');
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async () => {
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setIsLoading(true);
    
    // Simular atualização de senha
    await new Promise(r => setTimeout(r, 1000));

    Alert.alert(
      'Sucesso',
      'Sua senha foi redefinida com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );

    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Ionicons name="key-outline" size={48} color={Colors.primary} />
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            {step === 'email' && 'Informe seu e-mail para receber um código'}
            {step === 'code' && 'Digite o código enviado para seu e-mail'}
            {step === 'password' && 'Defina uma nova senha'}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {step === 'email' && (
            <>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={16} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <Button
                label={isLoading ? 'Enviando...' : 'Enviar código'}
                onPress={handleSendCode}
                disabled={isLoading}
                fullWidth
                size="lg"
                style={{ marginTop: Spacing.lg }}
              />
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={styles.label}>Código de verificação</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor={Colors.textTertiary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <Text style={styles.hintText}>Verifique seu e-mail para o código</Text>
              <Button
                label="Verificar código"
                onPress={handleVerifyCode}
                fullWidth
                size="lg"
                style={{ marginTop: Spacing.lg }}
              />
            </>
          )}

          {step === 'password' && (
            <>
              <Text style={styles.label}>Nova senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textTertiary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirme a senha"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <Button
                label={isLoading ? 'Atualizando...' : 'Redefinir senha'}
                onPress={handleResetPassword}
                disabled={isLoading}
                fullWidth
                size="lg"
                style={{ marginTop: Spacing.lg }}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  backBtn: { marginBottom: Spacing.base, width: 36, height: 36, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.sm },
  title: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm + 2 },
  eyeBtn: { padding: 4 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.errorBg, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  errorText: { flex: 1, fontSize: Typography.sm, color: Colors.error },
  hintText: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: -Spacing.md, marginBottom: Spacing.md },
});
