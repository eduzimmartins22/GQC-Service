// Versão web — react-native-maps não funciona no browser
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii } from '../../constants/theme';

export function TrackingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Ionicons name="map-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.title}>Disponível no app</Text>
      <Text style={styles.sub}>O rastreamento funciona no dispositivo Android ou iOS.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.xl, gap: Spacing.md },
  title: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.lg },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
});
