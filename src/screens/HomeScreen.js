/**
 * ETHEREAL v7.0 - HOME SCREEN (Dashboard)
 * ==========================================
 * Panel principal con estadísticas del motor,
 * ahorro fiscal acumulado y protocolos recomendados.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Background,
  LuxuryCard,
  StatCard,
  TierBadge,
  SectionHeader,
  THEME,
  LoadingOverlay,
} from '../components/ui/SharedComponents';
import GlassCard from '../components/ui/GlassCard';
import { useLayering } from '../context/LayeringContext';

// ── L'ORACLE: Algoritmo de Perfume del Día ──
function computeDailyOracle(protocols) {
  if (!protocols || protocols.length === 0) return null;
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const candidates = protocols.slice(0, 20);
  return candidates[seed % candidates.length];
}

export default function HomeScreen({ navigation }) {
  const {
    initialized,
    loading,
    inventory,
    savingsSummary,
    stats,
    refreshStats,
    loadSavings,
    loadProtocols,
  } = useLayering();

  const [topProtocols, setTopProtocols] = useState([]);
  const [allProtocols, setAllProtocols] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const dailyOracle = useMemo(() => computeDailyOracle(allProtocols), [allProtocols]);

  useEffect(() => {
    if (!initialized) return;
    loadDashboard();
  }, [initialized]);

  const loadDashboard = useCallback(async () => {
    await Promise.all([refreshStats(), loadSavings()]);
    const protocols = await loadProtocols({ ordenarPor: 'compatibilidad' });
    setAllProtocols(protocols);
    setTopProtocols(protocols.slice(0, 5));
  }, [refreshStats, loadSavings, loadProtocols]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  if (!initialized || (loading && !refreshing)) {
    return <LoadingOverlay message="Inicializando motor..." />;
  }

  const protocolCount = stats?.protocolos?.activos || 0;
  const perfumeCount = stats?.inventario?.totalPerfumes || 0;
  const collectionValue = stats?.inventario?.valorColeccion || 0;
  const totalSaved = savingsSummary?.totalAhorrado || 0;
  const timesUsed = savingsSummary?.protocolosUsados || 0;
  const avgCompat = stats?.fiscal?.compatibilidadMedia || 0;

  return (
    <SafeAreaView style={styles.container}>
      <Background />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.gold}
          />
        }
      >
        <Text style={styles.headerTitle}>DASHBOARD</Text>

        {/* ── L'ORACLE: PERFUME DEL DÍA ── */}
        {dailyOracle && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ProtocolDetail', { protocolId: dailyOracle.id });
            }}
            activeOpacity={0.7}
          >
            <GlassCard title="L'Oracle" subtitle="Perfume du Jour" accentColor={THEME.colors.gold}>
              <Text style={styles.oracleName}>{dailyOracle.nombreOperacion}</Text>
              <Text style={styles.oracleCat}>{dailyOracle.categoria}</Text>
              <View style={styles.oracleRow}>
                <Text style={styles.oracleStat}>
                  Ahorro: +{dailyOracle.analisisCoste.ahorroGenerado.toFixed(0)}€
                </Text>
                <TierBadge tier={dailyOracle.compatibilidadQuimica.tier} size="small" />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}

        {/* ── ACCESOS RÁPIDOS OMNI ── */}
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickAccessBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Academie'); }}
          >
            <Text style={styles.quickAccessIcon}>🎓</Text>
            <Text style={styles.quickAccessLabel}>L'Académie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAccessBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Sommelier'); }}
          >
            <Text style={styles.quickAccessIcon}>👔</Text>
            <Text style={styles.quickAccessLabel}>Sommelier</Text>
          </TouchableOpacity>
        </View>

        {/* ── RESUMEN FISCAL ── */}
        <LuxuryCard title="Ahorro Fiscal" subtitle="Auditoría acumulada">
          <View style={styles.savingsRow}>
            <View style={styles.savingsMain}>
              <Text style={styles.savingsAmount}>
                {totalSaved.toFixed(2)}
              </Text>
              <Text style={styles.savingsCurrency}>EUR AHORRADOS</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Usos" value={timesUsed} small />
            <StatCard
              label="Avg/Uso"
              value={
                timesUsed > 0
                  ? (totalSaved / timesUsed).toFixed(1)
                  : '0'
              }
              unit="€"
              small
            />
            <StatCard
              label="Compat."
              value={avgCompat.toFixed(0)}
              unit="%"
              small
            />
          </View>
        </LuxuryCard>

        {/* ── ESTADÍSTICAS RÁPIDAS ── */}
        <View style={styles.statsRow}>
          <StatCard label="Protocolos" value={protocolCount} />
          <StatCard label="Perfumes" value={perfumeCount} />
          <StatCard
            label="Colección"
            value={collectionValue > 999 ? `${(collectionValue / 1000).toFixed(1)}k` : collectionValue}
            unit="€"
          />
        </View>

        {/* ── TIERS BREAKDOWN ── */}
        {stats?.protocolos && (
          <>
            <SectionHeader title="Distribución por Tier" />
            <LuxuryCard>
              <View style={styles.tierRow}>
                <View style={styles.tierItem}>
                  <TierBadge tier="Alpha" />
                  <Text style={styles.tierCount}>{stats.protocolos.alpha}</Text>
                </View>
                <View style={styles.tierItem}>
                  <TierBadge tier="Beta" />
                  <Text style={styles.tierCount}>{stats.protocolos.beta}</Text>
                </View>
                <View style={styles.tierItem}>
                  <TierBadge tier="Gamma" />
                  <Text style={styles.tierCount}>{stats.protocolos.gamma}</Text>
                </View>
                <View style={styles.tierItem}>
                  <TierBadge tier="Delta" />
                  <Text style={styles.tierCount}>{stats.protocolos.delta}</Text>
                </View>
              </View>
            </LuxuryCard>
          </>
        )}

        {/* ── TOP PROTOCOLOS ── */}
        <SectionHeader
          title="Top Protocolos"
          onSeeAll={() => navigation.navigate('Biblio')}
        />
        {topProtocols.map((protocol) => (
          <TouchableOpacity
            key={protocol.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('ProtocolDetail', {
                protocolId: protocol.id,
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.protocolRow}>
              <View style={styles.protocolInfo}>
                <Text style={styles.protocolName} numberOfLines={1}>
                  {protocol.nombreOperacion}
                </Text>
                <Text style={styles.protocolCategory} numberOfLines={1}>
                  {protocol.categoria}
                </Text>
              </View>
              <View style={styles.protocolMeta}>
                <TierBadge
                  tier={protocol.compatibilidadQuimica.tier}
                  size="small"
                />
                <Text style={styles.protocolSaving}>
                  +{protocol.analisisCoste.ahorroGenerado.toFixed(0)}€
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 20,
  },
  savingsRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsMain: {
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: 42,
    color: THEME.colors.gold,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
  },
  savingsCurrency: {
    fontSize: 10,
    color: THEME.colors.goldDim,
    letterSpacing: 3,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 8,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tierItem: {
    alignItems: 'center',
    gap: 6,
  },
  tierCount: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  protocolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  protocolInfo: {
    flex: 1,
    marginRight: 12,
  },
  protocolName: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  protocolCategory: {
    color: THEME.colors.textDim,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1,
  },
  protocolMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  protocolSaving: {
    color: THEME.colors.success,
    fontSize: 13,
    fontWeight: 'bold',
  },
  oracleName: {
    color: THEME.colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  oracleCat: {
    color: THEME.colors.textDim,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  oracleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  oracleStat: {
    color: THEME.colors.success || '#4CAF50',
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  quickAccessBtn: {
    flex: 1,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickAccessIcon: { fontSize: 22, marginBottom: 4 },
  quickAccessLabel: {
    color: THEME.colors.gold,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
});
