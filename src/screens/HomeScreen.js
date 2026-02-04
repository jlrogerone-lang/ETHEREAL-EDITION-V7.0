/**
 * ETHEREAL v7.0 - HOME SCREEN (Dashboard)
 * ==========================================
 * Panel principal con estadísticas del motor,
 * ahorro fiscal acumulado y protocolos recomendados.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gem, TrendingUp, Layers, Star } from 'lucide-react-native';
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
import { useLayering } from '../context/LayeringContext';

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    loadDashboard();
  }, [initialized]);

  const loadDashboard = async () => {
    await Promise.all([refreshStats(), loadSavings()]);
    const protocols = await loadProtocols({ ordenarPor: 'compatibilidad' });
    setTopProtocols(protocols.slice(0, 5));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboard();
    setRefreshing(false);
  }, []);

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
});
