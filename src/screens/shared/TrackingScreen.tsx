import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { calculateHaversineDistance, calculateDistanceCost } from '../../utils/distanceCalculator';

// ── Safe import — react-native-maps crashes on web bundler
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (isNative) {
  // Dynamic require only runs on native, never seen by web bundler
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

// ── Mock coordinates (São Paulo centro)
const MOCK_CLIENT_COORD = { latitude: -23.5505, longitude: -46.6333 };
const MOCK_TECH_START   = { latitude: -23.5620, longitude: -46.6550 };

function interpolateRoute(from: any, to: any, steps: number) {
  return Array.from({ length: steps }, (_, i) => ({
    latitude:  from.latitude  + (to.latitude  - from.latitude)  * (i / (steps - 1)),
    longitude: from.longitude + (to.longitude - from.longitude) * (i / (steps - 1)),
  }));
}

const ROUTE_STEPS = 60;
const MOVE_INTERVAL_MS = 2000;

export function TrackingScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user, tickets } = useStore();
  const ticket = tickets.find((t: any) => t.id === ticketId);
  const isTechnician = user?.role === UserRole.TECHNICIAN;

  const [techCoord, setTechCoord] = useState(MOCK_TECH_START);
  const [clientCoord] = useState(MOCK_CLIENT_COORD);
  const [routeCoords] = useState(() => interpolateRoute(MOCK_TECH_START, MOCK_CLIENT_COORD, ROUTE_STEPS));
  const [stepIndex, setStepIndex] = useState(0);
  const [eta, setEta] = useState(12);
  const [arrived, setArrived] = useState(false);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [distance, setDistance] = useState(0);
  const [distanceCost, setDistanceCost] = useState<any>(null);

  const mapRef = useRef<any>(null);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request GPS
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && isTechnician) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setTechCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setUsingRealLocation(true);
        }
      } catch { /* silently ignore on emulator */ }
    })();
  }, [isTechnician]);

  // Simulate movement
  useEffect(() => {
    if (arrived) return;
    moveTimer.current = setInterval(() => {
      setStepIndex(prev => {
        const next = prev + 1;
        if (next >= ROUTE_STEPS - 1) {
          clearInterval(moveTimer.current!);
          setArrived(true);
          setEta(0);
          return ROUTE_STEPS - 1;
        }
        setTechCoord(routeCoords[next]);
        setEta(Math.round(12 * (1 - next / ROUTE_STEPS)));
        mapRef.current?.animateCamera({ center: routeCoords[next] }, { duration: 800 });
        return next;
      });
    }, MOVE_INTERVAL_MS);
    return () => { if (moveTimer.current) clearInterval(moveTimer.current); };
  }, [arrived, routeCoords]);

  // Calculate distance between tech and client (only for technician)
  useEffect(() => {
    if (!isTechnician) return;
    const dist = calculateHaversineDistance(
      techCoord.latitude,
      techCoord.longitude,
      clientCoord.latitude,
      clientCoord.longitude
    );
    setDistance(dist);
    setDistanceCost(calculateDistanceCost(dist));
  }, [techCoord, clientCoord, isTechnician]);

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chamado não encontrado.</Text>
      </View>
    );
  }

  // Web fallback
  if (!isNative || !MapView || !ticket) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="map-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.fallbackTitle}>Mapa disponível no app</Text>
        <Text style={styles.fallbackText}>
          {!ticket ? 'Chamado não encontrado.' : 'O rastreamento funciona no dispositivo Android ou iOS.\nNão está disponível na versão web.'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const region = {
    latitude:       (techCoord.latitude  + clientCoord.latitude)  / 2,
    longitude:      (techCoord.longitude + clientCoord.longitude) / 2,
    latitudeDelta:  Math.abs(techCoord.latitude  - clientCoord.latitude)  * 2.4 + 0.01,
    longitudeDelta: Math.abs(techCoord.longitude - clientCoord.longitude) * 2.4 + 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={false}
        showsCompass={false}
      >
        {/* Rota percorrida (cinza) */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords.slice(0, Math.min(stepIndex + 1, routeCoords.length))}
            strokeColor={Colors.border}
            strokeWidth={4}
          />
        )}
        {/* Rota restante (azul) */}
        {routeCoords.length > 0 && stepIndex < routeCoords.length && (
          <Polyline
            coordinates={routeCoords.slice(stepIndex)}
            strokeColor={Colors.primary}
            strokeWidth={5}
          />
        )}
        {/* Marcador do técnico — carro */}
        <Marker coordinate={techCoord} anchor={{ x: 0.5, y: 0.5 }} title="Técnico">
          <View style={styles.techMarker}>
            <Ionicons name="car" size={20} color={Colors.white} />
          </View>
        </Marker>
        {/* Marcador do cliente — destino */}
        <Marker coordinate={clientCoord} title={ticket.clientName}>
          <View style={styles.clientMarkerWrap}>
            <View style={styles.clientMarker}>
              <Ionicons name="home" size={18} color={Colors.white} />
            </View>
            <View style={styles.markerPin} />
          </View>
        </Marker>
      </MapView>

      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {isTechnician ? `Navegando: ${ticket.clientName}` : 'Técnico a caminho'}
        </Text>
        {usingRealLocation && (
          <View style={styles.gpsPill}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS</Text>
          </View>
        )}
      </View>

      {/* Card inferior */}
      <View style={styles.bottomCard}>
        {arrived ? (
          <View style={styles.arrivedRow}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.statusFinished} />
            <View>
              <Text style={styles.arrivedTitle}>
                {isTechnician ? 'Você chegou!' : 'Técnico chegou!'}
              </Text>
              <Text style={styles.arrivedSub}>
                {isTechnician ? 'Você está no local do cliente.' : 'Abra a porta para o técnico.'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.etaRow}>
            <View style={styles.etaBlock}>
              <Text style={styles.etaValue}>{eta}</Text>
              <Text style={styles.etaLabel}>min</Text>
            </View>
            <View style={styles.etaInfo}>
              <Text style={styles.etaTitle}>
                {isTechnician ? 'Chegada estimada ao cliente' : 'Chegada estimada do técnico'}
              </Text>
              <Text style={styles.etaSub}>
                {ticket.technicianName ?? 'Técnico'} · {ticket.ticketNumber}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={15} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{ticket.clientName}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="build-outline" size={15} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Técnico</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{ticket.technicianName ?? '—'}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="receipt-outline" size={15} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Chamado</Text>
            <Text style={styles.infoValue}>{ticket.ticketNumber}</Text>
          </View>
        </View>

        {/* Distância para técnico */}
        {isTechnician && distanceCost && (
          <View style={styles.distanceCard}>
            <View style={styles.distanceHeader}>
              <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
              <Text style={styles.distanceTitle}>Distância da rota</Text>
            </View>
            
            <View style={styles.distanceContent}>
              <View style={styles.distanceMainInfo}>
                <Text style={styles.distanceValue}>{distance} km</Text>
                <Text style={styles.distanceLabel}>Até o cliente</Text>
              </View>

              {distanceCost.exceedsLimit && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={20} color={Colors.error} />
                  <View style={styles.warningContent}>
                    <Text style={styles.warningTitle}>Excedeu 60 km</Text>
                    <Text style={styles.warningText}>
                      +{distanceCost.excessKm} km adicionais
                    </Text>
                    <Text style={styles.costText}>
                      Custo extra: R$ {distanceCost.travelCost.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={() => mapRef.current?.animateToRegion(region, 600)}
          activeOpacity={0.8}
        >
          <Ionicons name="locate-outline" size={16} color={Colors.primary} />
          <Text style={styles.recenterText}>Centralizar mapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textSecondary },
  map: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 54 : Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    ...Shadows.md,
  },
  topBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  topTitle: { flex: 1, fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  gpsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.statusFinishedBg,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radii.full,
  },
  gpsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusFinished },
  gpsText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.statusFinished },

  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    ...Shadows.lg,
  },

  etaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  etaBlock: {
    alignItems: 'center', backgroundColor: Colors.primaryLight,
    borderRadius: Radii.lg, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, minWidth: 64,
  },
  etaValue: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.primary },
  etaLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.primary },
  etaInfo: { flex: 1 },
  etaTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  etaSub: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },

  arrivedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  arrivedTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.statusFinished },
  arrivedSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.base },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoItem: { flex: 1, alignItems: 'center', gap: 2 },
  infoSep: { width: 1, height: 40, backgroundColor: Colors.borderLight },
  infoLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  infoValue: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  distanceCard: {
    marginTop: Spacing.base, paddingTop: Spacing.base,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  distanceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  distanceTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  distanceContent: { gap: Spacing.sm },
  distanceMainInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  distanceValue: { fontSize: Typography.lg, fontWeight: '800', color: Colors.primary },
  distanceLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  warningBox: {
    flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.errorBg, borderRadius: Radii.md,
    borderLeftWidth: 3, borderLeftColor: Colors.error,
  },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.error },
  warningText: { fontSize: Typography.xs, color: Colors.error, marginTop: 2 },
  costText: { fontSize: Typography.xs, color: Colors.error, fontWeight: '700', marginTop: 4 },

  recenterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.base, paddingVertical: Spacing.sm,
  },
  recenterText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },

  techMarker: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  clientMarkerWrap: { alignItems: 'center' },
  clientMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  markerPin: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: Colors.error,
  },

  fallback: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xl, backgroundColor: Colors.background, gap: Spacing.md,
  },
  fallbackTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  fallbackText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  backBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.lg,
  },
  backBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
});
