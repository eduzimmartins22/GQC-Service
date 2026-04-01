import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity
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

    if (!validateRequired(name, 'Nome').valid) errors.name = 'Nome obrigatório';
    if (!validateCPF(cpf).valid) errors.cpf = 'CPF inválido';
    if (!validatePhone(phone).valid) errors.phone = 'Telefone inválido';
    if (!validateEmail(email).valid) errors.email = 'Email inválido';
    if (!password || password.length < 6) errors.password = 'Senha mínima de 6 caracteres';
    if (!validateCEP(cep).valid) errors.cep = 'CEP inválido';
    if (!addressNumber) errors.addressNumber = 'Número obrigatório';

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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>

        <TextInput placeholder="Nome" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="CPF" value={cpf} onChangeText={(v) => setCpf(formatCPF(v))} style={styles.input} />
        <TextInput placeholder="Telefone" value={phone} onChangeText={(v) => setPhone(formatPhone(v))} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
        <TextInput placeholder="Senha" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.input} />

        <TextInput placeholder="CEP" value={cep} onChangeText={(v) => setCep(formatCEP(v))} style={styles.input} />
        <TextInput placeholder="Número" value={addressNumber} onChangeText={setAddressNumber} style={styles.input} />
        <TextInput placeholder="Complemento" value={complement} onChangeText={setComplement} style={styles.input} />

        <Button label="Criar conta" onPress={handleRegister} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8
  }
});