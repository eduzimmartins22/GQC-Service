import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { validateCPF, validateCEP, validateEmail, validatePhone, validateRequired } from '../../utils/validations';

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
  error?: string;
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, maxLength, autoCapitalize, rightIcon, error }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : {}]}>
        <Ionicons name={icon as any} size={16} color={error ? Colors.error : Colors.textTertiary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType || 'default'}
          secureTextEntry={secureTextEntry || false}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize || 'sentences'}
          autoCorrect={false}
        />
        {rightIcon}
      </View>
      {error && error.length > 0 ? (
        <View style={styles.errorMsg}>
          <Ionicons name="alert-circle-outline" size={12} color={Colors.error} />
          <Text style={styles.errorMsgText}>{String(error)}</Text>
        </View>
      ) : null}
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, isLoading } = useStore();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameValidation = validateRequired(name, 'Nome');
    if (!nameValidation.valid) errors.name = nameValidation.message;

    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.valid) errors.cpf = cpfValidation.message;

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) errors.phone = phoneValidation.message;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) errors.email = emailValidation.message;

    const passwordValidation = validateRequired(password, 'Senha');
    if (!passwordValidation.valid) errors.password = passwordValidation.message;
    else if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres';

    const cepValidation = validateCEP(cep);
    if (!cepValidation.valid) errors.cep = cepValidation.message;

    const numberValidation = validateRequired(addressNumber, 'Número');
    if (!numberValidation.valid) errors.addressNumber = numberValidation.message;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

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
      setFieldErrors({ form: result.error || 'Erro ao cadastrar.' });
    }
  };

  const isValid =
    !fieldErrors.name &&
    !fieldErrors.cpf &&
    !fieldErrors.phone &&
    !fieldErrors.email &&
    !fieldErrors.password &&
    !fieldErrors.cep &&
    !fieldErrors.addressNumber;

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

          <Field label="Nome completo *" icon="person-outline" value={name} onChangeText={(v) => { setName(v); setFieldErrors({ ...fieldErrors, name: '' }); }} placeholder="Seu nome completo" error={fieldErrors.name} />
          <Field label="CPF *" icon="card-outline" value={cpf} onChangeText={(v) => { setCpf(formatCPF(v)); setFieldErrors({ ...fieldErrors, cpf: '' }); }} placeholder="000.000.000-00" keyboardType="numeric" maxLength={14} autoCapitalize="none" error={fieldErrors.cpf} />
          <Field label="Telefone / WhatsApp *" icon="call-outline" value={phone} onChangeText={(v) => { setPhone(formatPhone(v)); setFieldErrors({ ...fieldErrors, phone: '' }); }} placeholder="(00) 00000-0000" keyboardType="phone-pad" maxLength={15} error={fieldErrors.phone} />
          <Field label="E-mail *" icon="mail-outline" value={email} onChangeText={(v) => { setEmail(v); setFieldErrors({ ...fieldErrors, email: '' }); }} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" error={fieldErrors.email} />
          <Field label="Senha *" icon="lock-closed-outline" value={password} onChangeText={(v) => { setPassword(v); setFieldErrors({ ...fieldErrors, password: '' }); }} placeholder="Mínimo 6 caracteres" secureTextEntry={!showPassword} autoCapitalize="none" error={fieldErrors.password} rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} /></TouchableOpacity>} />
        </View>

        <View style={[styles.card, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionTitle}>Localização</Text>

          <Field label="CEP *" icon="location-outline" value={cep} onChangeText={(v) => { setCep(formatCEP(v)); setFieldErrors({ ...fieldErrors, cep: '' }); }} placeholder="00000-000" keyboardType="numeric" maxLength={9} error={fieldErrors.cep} />
          <Field label="Número *" icon="home-outline" value={addressNumber} onChangeText={(v) => { setAddressNumber(v); setFieldErrors({ ...fieldErrors, addressNumber: '' }); }} placeholder="Ex: 42" keyboardType="numeric" error={fieldErrors.addressNumber} />
          <Field label="Complemento" icon="business-outline" value={complement} onChangeText={setComplement} placeholder="Apto, Sala, Bloco... (opcional)" />
        </View>

        {fieldErrors.form ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{fieldErrors.form}</Text>
          </View>
        ) : null}

        <Button label={isLoading ? 'Cadastrando...' : 'Criar conta'} onPress={handleRegister} disabled={!isValid || isLoading} fullWidth size="lg" style={{ marginTop: Spacing.lg }} />

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
  inputWrapperError: { borderColor: Colors.error, backgroundColor: Colors.errorBg },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, paddingVertical: Spacing.sm + 2 },
  eyeBtn: { padding: 4 },
  errorMsg: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorMsgText: { fontSize: Typography.xs, color: Colors.error, flex: 1 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.errorBg, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.sm },
  errorText: { flex: 1, fontSize: Typography.sm, color: Colors.error },
  loginHint: { textAlign: 'center', marginTop: Spacing.lg, fontSize: Typography.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontWeight: '700' },
});
