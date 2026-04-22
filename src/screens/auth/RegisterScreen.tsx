import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/common/Button';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { validateCPF, validateCEP, validateEmail, validatePhone, validateRequired, validateCNPJ } from '../../utils/validations';

// ─── FORMATADORES ──────────────────────────────────────────────────────────────

function formatCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatCNPJ(v: string): string {
  // Remove tudo que não é número e limita a 14 dígitos
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2)  return d;
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function formatCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

// ─── FIELD COMPONENT ──────────────────────────────────────────────────────────
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
      <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
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
      {!!error && (
        <View style={styles.errorMsg}>
          <Ionicons name="alert-circle-outline" size={12} color={Colors.error} />
          <Text style={styles.errorMsgText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── REGISTER SCREEN ──────────────────────────────────────────────────────────
export function RegisterScreen({ navigation }: any) {
  const [name, setName]                   = useState('');
  const [useCNPJ, setUseCNPJ]             = useState(false);
  const [cpfCnpj, setCpfCnpj]             = useState('');
  const [phone, setPhone]                 = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [cep, setCep]                     = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement]       = useState('');
  const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({});

  const { register, isLoading } = useStore();

  // Limpa erro de um campo específico sem apagar os outros
  const clearError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

  // Troca CPF/CNPJ — limpa o campo e o erro
  const switchDocType = (cnpj: boolean) => {
    setUseCNPJ(cnpj);
    setCpfCnpj('');
    clearError('cpfCnpj');
  };

  // Handler separado para o campo CPF/CNPJ — sem reforçar máscara no loop
  const handleDocChange = (raw: string) => {
    const formatted = useCNPJ ? formatCNPJ(raw) : formatCPF(raw);
    setCpfCnpj(formatted);
    clearError('cpfCnpj');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validateRequired(name, 'Nome').valid)
      errors.name = validateRequired(name, 'Nome').message;

    const docValidation = useCNPJ ? validateCNPJ(cpfCnpj) : validateCPF(cpfCnpj);
    if (!docValidation.valid) errors.cpfCnpj = docValidation.message;

    const phoneV = validatePhone(phone);
    if (!phoneV.valid) errors.phone = phoneV.message;

    const emailV = validateEmail(email);
    if (!emailV.valid) errors.email = emailV.message;

    if (!password || password.length < 6)
      errors.password = 'A senha deve ter pelo menos 6 caracteres';

    const cepV = validateCEP(cep);
    if (!cepV.valid) errors.cep = cepV.message;

    if (!validateRequired(addressNumber, 'Número').valid)
      errors.addressNumber = validateRequired(addressNumber, 'Número').message;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const result = await register({
      name: name.trim(),
      cpf: cpfCnpj,
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>
        </View>

        {/* ── DADOS PESSOAIS ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados pessoais</Text>

          <Field
            label="Nome completo *" icon="person-outline"
            value={name}
            onChangeText={v => { setName(v); clearError('name'); }}
            placeholder="Seu nome completo"
            error={fieldErrors.name}
          />

          {/* Toggle CPF / CNPJ */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, !useCNPJ && styles.toggleBtnActive]}
              onPress={() => switchDocType(false)}
            >
              <Text style={[styles.toggleBtnText, !useCNPJ && styles.toggleBtnTextActive]}>CPF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, useCNPJ && styles.toggleBtnActive]}
              onPress={() => switchDocType(true)}
            >
              <Text style={[styles.toggleBtnText, useCNPJ && styles.toggleBtnTextActive]}>CNPJ</Text>
            </TouchableOpacity>
          </View>

          <Field
            label={useCNPJ ? 'CNPJ *' : 'CPF *'}
            icon="card-outline"
            value={cpfCnpj}
            onChangeText={handleDocChange}
            placeholder={useCNPJ ? '00.000.000/0000-00' : '000.000.000-00'}
            keyboardType="numeric"
            maxLength={useCNPJ ? 18 : 14}
            autoCapitalize="none"
            error={fieldErrors.cpfCnpj}
          />

          <Field
            label="Telefone / WhatsApp *" icon="call-outline"
            value={phone}
            onChangeText={v => { setPhone(formatPhone(v)); clearError('phone'); }}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            maxLength={15}
            error={fieldErrors.phone}
          />

          <Field
            label="E-mail *" icon="mail-outline"
            value={email}
            onChangeText={v => { setEmail(v); clearError('email'); }}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldErrors.email}
          />

          <Field
            label="Senha *" icon="lock-closed-outline"
            value={password}
            onChangeText={v => { setPassword(v); clearError('password'); }}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={fieldErrors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* ── LOCALIZAÇÃO ── */}
        <View style={[styles.card, { marginTop: Spacing.md }]}>
          <Text style={styles.sectionTitle}>Localização</Text>

          <Field
            label="CEP *" icon="location-outline"
            value={cep}
            onChangeText={v => { setCep(formatCEP(v)); clearError('cep'); }}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
            error={fieldErrors.cep}
          />
          <Field
            label="Número *" icon="home-outline"
            value={addressNumber}
            onChangeText={v => { setAddressNumber(v); clearError('addressNumber'); }}
            placeholder="Ex: 42"
            keyboardType="numeric"
            error={fieldErrors.addressNumber}
          />
          <Field
            label="Complemento" icon="business-outline"
            value={complement}
            onChangeText={setComplement}
            placeholder="Apto, Sala, Bloco... (opcional)"
          />
        </View>

        {/* Erro geral */}
        {!!fieldErrors.form && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{fieldErrors.form}</Text>
          </View>
        )}

        <Button
          label={isLoading ? 'Cadastrando...' : 'Criar conta'}
          onPress={handleRegister}
          disabled={isLoading}
          fullWidth size="lg"
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
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.base, ...Shadows.sm },
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
  toggleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  toggleBtn: { flex: 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background, alignItems: 'center' },
  toggleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleBtnText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  toggleBtnTextActive: { color: Colors.primary },
});
