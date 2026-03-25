import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useStore } from '../../store/useStore';
import { TicketStatus, UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';

// ── Conditional map import (react-native-maps not available on web)
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch (e) {
  // Maps not available
}

// ── Mock coordinates for demo (São Paulo)
const MOCK_CLIENT_COORD = { latitude: -23.5505, longitude: -46.6333 };
const MOCK_TECH_START   = { latitude: -23.5620, longitude: -46.6550 };

// Interpolates N points along a straight line (demo route)
function interpolateRoute(from: any, to: any, steps: number) {
  return Array.from({ length: steps }, (_, i) => ({
    latitude:  from.latitude  + (to.latitude  - from.latitude)  * (i / (steps - 1)),
    longitude: from.longitude + (to.longitude - from.longitude) * (i / (steps - 1)),
  }));
}

const ROUTE_STEPS = 60;
const MOVE_INTERVAL_MS = 2000; // move every 2 seconds (demo)

interface Props {
  route: any;
  navigation: any;
}

export function TrackingScreen({ route, navigation }: Props) {
  const { ticketId } = route.params;
  const { user, tickets } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);

  const isTechnician = user?.role === UserRole.TECHNICIAN;

  const [techCoord, setTechCoord] = useState(MOCK_TECH_START);
  const [clientCoord] = useState(MOCK_CLIENT_COORD);
  const [routeCoords] = useState(() => interpolateRoute(MOCK_TECH_START, MOCK_CLIENT_COORD, ROUTE_STEPS));
  const [stepIndex, setStepIndex] = useState(0);
  const [eta, setEta] = useState(12); // minutes
  const [arrived, setArrived] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'loading'>('loading');
  const [usingRealLocation, setUsingRealLocation] = useState(false);

  const mapRef = useRef<any>(null);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ── Pulse animation for tech marker
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    return () => pulseAnim.stopAnimation();
  }, []);

  // ── Request location permission and optionally use real GPS for technician
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission('granted');
          if (isTechnician) {
            // Try to get real GPS position for the technician
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setTechCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            setUsingRealLocation(true);
          }
        } else {
          setLocationPermission('denied');
        }
      } catch {
        setLocationPermission('denied');
      }
    })();
  }, [isTechnician]);

  // ── Simulate technician movement (mock animation along route)
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
        const coord = routeCoords[next];
        setTechCoord(coord);
        // Update ETA proportionally
        setEta(Math.round(12 * (1 - next / ROUTE_STEPS)));
        // Pan map to keep tech in view
        mapRef.current?.animateCamera({ center: coord }, { duration: 800 });
        return next;
      });
    }, MOVE_INTERVAL_MS);

    return () => { if (moveTimer.current) clearInterval(moveTimer.current); };
  }, [arrived, routeCoords]);

  if (!ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chamado não encontrado.</Text>
      </View>
    );
  }

  // ── Fallback if react-native-maps not installed
  if (!MapView) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="map-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.fallbackTitle}>Mapa não disponível</Text>
        <Text style={styles.fallbackText}>
          Instale react-native-maps para usar o rastreamento:{'\n'}
          <Text style={styles.fallbackCode}>npx expo install react-native-maps</Text>
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const region = {
    latitude:       (techCoord.latitude + clientCoord.latitude) / 2,
    longitude:      (techCoord.longitude + clientCoord.longitude) / 2,
    latitudeDelta:  Math.abs(techCoord.latitude  - clientCoord.latitude)  * 2.2 + 0.01,
    longitudeDelta: Math.abs(techCoord.longitude - clientCoord.longitude) * 2.2 + 0.01,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
      >
        {/* Route polyline */}
        <Polyline
          coordinates={routeCoords}
          strokeColor={Colors.primary}
          strokeWidth={4}
          lineDashPattern={[0]}
        />

        {/* Remaining route (ahead of tech) */}
        <Polyline
          coordinates={routeCoords.slice(stepIndex)}
          strokeColor={Colors.primary}
          strokeWidth={5}
          lineDashPattern={[0]}
        />

        {/* Travelled route (behind tech, faded) */}
        <Polyline
          coordinates={routeCoords.slice(0, stepIndex + 1)}
          strokeColor={Colors.border}
          strokeWidth={4}
        />

        {/* Technician marker */}
        <Marker coordinate={techCoord} anchor={{ x: 0.5, y: 0.5 }} title="Técnico">
          <View style={styles.techMarker}>
            <Ionicons name="car" size={20} color={Colors.white} />
          </View>
        </Marker>

        {/* Client / destination marker */}
        <Marker coordinate={clientCoord} title="Destino" description={ticket.clientName}>
          <View style={styles.clientMarkerWrap}>
            <View style={styles.clientMarker}>
              <Ionicons name="home" size={18} color={Colors.white} />
            </View>
            <View style={styles.markerPin} />
          </View>
        </Marker>
      </MapView>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {isTechnician ? `Atendimento: ${ticket.clientName}` : 'Técnico a caminho'}
        </Text>
        {usingRealLocation && (
          <View style={styles.gpsPill}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS</Text>
          </View>
        )}
      </View>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        {arrived ? (
          <View style={styles.arrivedRow}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.statusFinished} />
            <View style={styles.arrivedText}>
              <Text style={styles.arrivedTitle}>Técnico chegou!</Text>
              <Text style={styles.arrivedSub}>{isTechnician ? 'Você está no local.' : 'Abra a porta para o técnico.'}</Text>
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
                {ticket.technicianName || 'Técnico'} · {ticket.ticketNumber}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{ticket.clientName}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="build-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Técnico</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{ticket.technicianName || '—'}</Text>
          </View>
          <View style={styles.infoSep} />
          <View style={styles.infoItem}>
            <Ionicons name="ticket-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.infoLabel}>Chamado</Text>
            <Text style={styles.infoValue}>{ticket.ticketNumber}</Text>
          </View>
        </View>

        {/* Recenter button */}
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

const TECH_MARKER_SIZE = 44;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textSecondary },
  map: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, paddingTop: Platform.OS === 'ios' ? 54 : Spacing.lg,
    paddingBottom: Spacing.md, paddingHorizontal: Spacing.base,
    ...Shadows.md,
  },
  topBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topTitle: { flex: 1, fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  gpsPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radii.full },
  gpsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusFinished },
  gpsText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.statusFinished },

  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: Spacing.xl, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    ...Shadows.lg,
  },

  etaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  etaBlock: { alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radii.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minWidth: 64 },
  etaValue: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.primary },
  etaLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.primary },
  etaInfo: { flex: 1 },
  etaTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  etaSub: { fontSize: Typography.sm, color: Colors.textTertiary, marginTop: 2 },

  arrivedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  arrivedText: { flex: 1 },
  arrivedTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.statusFinished },
  arrivedSub: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.base },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoItem: { flex: 1, alignItems: 'center', gap: 2 },
  infoSep: { width: 1, height: 40, backgroundColor: Colors.borderLight },
  infoLabel: { fontSize: Typography.xs, color: Colors.textTertiary, marginTop: 2 },
  infoValue: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },

  recenterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.base, paddingVertical: Spacing.sm },
  recenterText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.primary },

  techMarker: {
    width: TECH_MARKER_SIZE, height: TECH_MARKER_SIZE, borderRadius: TECH_MARKER_SIZE / 2,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  clientMarkerWrap: { alignItems: 'center' },
  clientMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  markerPin: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.error },

  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, backgroundColor: Colors.background, gap: Spacing.md },
  fallbackTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  fallbackText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  fallbackCode: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: Colors.primary },
  backBtn: { marginTop: Spacing.lg, backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.lg },
  backBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
});
