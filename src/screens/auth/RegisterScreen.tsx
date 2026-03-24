import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

function formatCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

interface FieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  maxLength?: number;
  autoCapitalize?: any;
  rightIcon?: React.ReactNode;
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, maxLength, autoCapitalize, rightIcon }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon as any} size={16} color={Colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || 'sentences'}
          autoCorrect={false}
        />
        {rightIcon}
      </View>
    </View>
  );
}

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cep, setCep] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [error, setError] = useState('');

  const { register, isLoading } = useStore();

  const isValid =
    name.trim().length >= 3 &&
    cpf.replace(/\D/g, '').length === 11 &&
    phone.replace(/\D/g, '').length >= 10 &&
    email.includes('@') &&
    password.length >= 6 &&
    cep.replace(/\D/g, '').length === 8 &&
    addressNumber.trim().length > 0;

  const handleRegister = async () => {
    setError('');
    const result = await register({
      name: name.trim(),
      cpf,
      email: email.trim().toLowerCase(),
      phone,
      password,
      cep,
      addressNumber: addressNumber.trim(),
      complement: complement.trim() || undefined,
    });
    if (!result.success) {
      setError(result.error || 'Erro ao cadastrar.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados pessoais</Text>

          <Field label="Nome completo *" icon="person-outline" value={name} onChangeText={setName} placeholder="Seu nome completo" />
          <Field label="CPF *" icon="card-outline" value={cpf} onChangeText={v => setCpf(formatCPF(v))} placeholder="000.000.000-00" keyboardType="numeric" maxLength={14} autoCapitalize="none" />
          <Field label="Telefone / WhatsApp *" icon="call-outline" value={phone} onChangeText={v => setPhone(formatPhone(v))} placeholder="(00) 00000-0000" keyboardType="phone-pad" maxLength={15} />
          <Field label="E-mail *" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Field
            label="Senha *"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={[styles.card, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionTitle}>Localização</Text>

          <Field label="CEP *" icon="location-outline" value={cep} onChangeText={v => setCep(formatCEP(v))} placeholder="00000-000" keyboardType="numeric" maxLength={9} />
          <Field label="Número *" icon="home-outline" value={addressNumber} onChangeText={setAddressNumber} placeholder="Ex: 42" keyboardType="numeric" />
          <Field label="Complemento" icon="business-outline" value={complement} onChangeText={setComplement} placeholder="Apto, Sala, Bloco... (opcional)" />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          label={isLoading ? 'Cadastrando...' : 'Criar conta'}
          onPress={handleRegister}
          disabled={!isValid || isLoading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />

        <Text style={styles.loginHint}>
          Já tem conta?{' '}
          <Text style={styles.loginLink} onPress={() => navigation.goBack()}>Entrar</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  backBtn: { marginBottom: Spacing.base, width: 36, height: 36, justifyContent: 'center' },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    ...Shadows.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.md, paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm + 2 },
  eyeBtn: { padding: 4 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.errorBg, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.sm },
  errorText: { flex: 1, fontSize: Typography.sm, color: Colors.error },
  loginHint: { textAlign: 'center', marginTop: Spacing.lg, fontSize: Typography.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' },
});
