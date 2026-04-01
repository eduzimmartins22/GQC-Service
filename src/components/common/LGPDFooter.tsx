import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';

export function LGPDFooter() {
  const handlePrivacy = () => {
    // Link para política de privacidade (adicione sua URL aqui)
    Linking.openURL('https://seu-site.com/privacidade');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={styles.title}>Proteção de Dados LGPD</Text>
        </View>
        <Text style={styles.text}>
          Sua segurança é nossa prioridade. De acordo com a Lei Geral de Proteção de Dados (LGPD), garantimos a máxima segurança e sigilo de seus dados pessoais.
        </Text>
        <TouchableOpacity onPress={handlePrivacy} style={styles.link}>
          <Text style={styles.linkText}>Leia nossa Política de Privacidade →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + '20',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  content: {
    gap: Spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  link: {
    paddingTop: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
});
