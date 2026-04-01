import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { LGPDFooter } from '../../components/common/LGPDFooter';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

const SAVED_EMAIL_KEY    = 'gcq_saved_email';
const BIOMETRIC_KEY      = 'gcq_biometric_enabled';
const SAVED_PASSWORD_KEY = 'gcq_saved_password';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | null>(null);
  const [checking, setChecking] = useState(true);

  const { login, isLoading, authError } = useStore();

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled   = await LocalAuthentication.isEnrolledAsync();
        const types      = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (compatible && enrolled) {
          setBiometricAvailable(true);
          setBiometricType(
            types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
              ? 'face' : 'fingerprint'
          );
        }

        const storedEmail = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
        const bioEnabled  = await SecureStore.getItemAsync(BIOMETRIC_KEY);

        if (storedEmail) { setSavedEmail(storedEmail); setEmail(storedEmail); }
        if (bioEnabled === 'true') setBiometricEnabled(true);
      } catch { /* emulator/web — silently ignore */ }
      setChecking(false);
    })();
  }, []);

  useEffect(() => {
    if (!checking && biometricEnabled && savedEmail && biometricAvailable) {
      handleBiometricLogin();
    }
  }, [checking]);

  const handleBiometricLogin = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Entrar na GCQ Manutenções',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });
      if (result.success) {
        const savedPwd = await SecureStore.getItemAsync(SAVED_PASSWORD_KEY);
        if (savedPwd && savedEmail) await login(savedEmail, savedPwd);
      }
    } catch { /* cancelled */ }
  }, [savedEmail, login]);

  const handleLogin = async () => {
    const success = await login(email.trim(), password);
    if (success) {
      try {
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email.trim());
        if (biometricAvailable) {
          await SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password);
        }
      } catch { /* silently ignore */ }
    }
  };

  const toggleBiometric = async () => {
    const next = !biometricEnabled;
    setBiometricEnabled(next);
    try {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, next ? 'true' : 'false');
      if (next && password) await SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password);
    } catch { /* silently ignore */ }
  };

  const bioIcon  = biometricType === 'face' ? 'scan-outline' : 'finger-print-outline';
  const bioLabel = biometricType === 'face' ? 'Face ID' : 'Digital';

  if (checking) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo da empresa */}
        <View style={styles.logoArea}>
          <View style={styles.logoImgWrap}>
            <Image
              source={require('../../../assets/logo_gcq.jpg')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTag}>Sistema de chamados</Text>
        </View>

        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>
          <Text style={styles.cardSubtitle}>
            {savedEmail ? 'Bem-vindo de volta!' : 'Acesse com suas credenciais'}
          </Text>

          {/* Email */}
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
              {savedEmail && email === savedEmail && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.statusFinished} />
              )}
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle biometria */}
          {biometricAvailable && savedEmail && (
            <TouchableOpacity style={styles.biometricToggle} onPress={toggleBiometric} activeOpacity={0.7}>
              <View style={styles.biometricLeft}>
                <Ionicons name={bioIcon as any} size={20} color={biometricEnabled ? Colors.primary : Colors.textTertiary} />
                <Text style={[styles.biometricText, biometricEnabled && styles.biometricTextActive]}>
                  Entrar com {bioLabel}
                </Text>
              </View>
              <View style={[styles.toggle, biometricEnabled && styles.toggleOn]}>
                <View style={[styles.toggleThumb, biometricEnabled && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
          )}

          {/* Erro */}
          {authError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Botão entrar */}
          <Button
            label={isLoading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            disabled={!email.trim() || !password || isLoading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          {/* Botão biometria rápida */}
          {biometricAvailable && biometricEnabled && savedEmail && (
            <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin} activeOpacity={0.8}>
              <Ionicons name={bioIcon as any} size={22} color={Colors.primary} />
              <Text style={styles.biometricBtnText}>Entrar com {bioLabel}</Text>
            </TouchableOpacity>
          )}

          {/* Link cadastro */}
          <Text style={styles.registerHint}>
            Não tem conta?{' '}
            <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
              Criar conta
            </Text>
          </Text>
        </View>
      </ScrollView>
      <LGPDFooter />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  container:   { flex: 1, backgroundColor: Colors.primary },
  scroll:      { flexGrow: 1, padding: Spacing.xl, paddingTop: 56, paddingBottom: 40 },

  logoArea: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoImgWrap: {
    width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  logoImg: { width: 136, height: 136, borderRadius: 68 },
  appTag: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, marginTop: 4 },

  card: { backgroundColor: Colors.white, borderRadius: Radii.xl, padding: Spacing.xl, ...Shadows.lg },
  cardTitle:    { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },

  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radii.md, backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md, minHeight: 48,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm },
  eyeBtn: { padding: Spacing.xs },

  biometricToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, marginBottom: Spacing.sm },
  biometricLeft:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  biometricText:       { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  biometricTextActive: { color: Colors.primary, fontWeight: '700' },
  toggle:      { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn:    { backgroundColor: Colors.primary },
  toggleThumb:    { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
  toggleThumbOn:  { alignSelf: 'flex-end' },

  errorBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorBg, borderRadius: Radii.sm, padding: Spacing.sm, marginBottom: Spacing.base, gap: Spacing.xs },
  errorText: { fontSize: Typography.sm, color: Colors.error, flex: 1 },

  loginBtn: { marginTop: Spacing.sm },

  biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.md, padding: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radii.lg },
  biometricBtnText: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },

  registerHint: { textAlign: 'center', marginTop: Spacing.lg, fontSize: Typography.sm, color: Colors.textSecondary },
  registerLink: { color: Colors.primary, fontWeight: '700' },
});
