/**
 * ETHEREAL v7.0 - PROFILE SCREEN (Ajustes y Stats)
 * ===================================================
 * Estadísticas del sistema, backup/restore y ajustes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Background,
  LuxuryCard,
  GoldButton,
  StatCard,
  SectionHeader,
  THEME,
} from '../components/ui/SharedComponents';
import RadarChart from '../components/ui/RadarChart';
import { useLayering } from '../context/LayeringContext';

export default function ProfileScreen({ navigation }) {
  const {
    initialized,
    stats,
    refreshStats,
    resetSystem,
    exportData,
    suggestPerfumesToBuy,
  } = useLayering();

  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    loadData();
  }, [initialized]);

  const loadData = useCallback(async () => {
    await refreshStats();
    const sugs = await suggestPerfumesToBuy(3);
    setSuggestions(sugs);
  }, [refreshStats, suggestPerfumesToBuy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy(true);
    try {
      const data = await exportData();
      Alert.alert(
        'Backup Listo',
        `Exportados ${data.protocols.length} protocolos, ${data.inventory.length} perfumes, ${data.usageHistory.length} registros de uso.`,
        [{ text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setBusy(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Regenerar Enciclopedia',
      'Se borrarán todos los datos y se regenerarán 500 protocolos desde cero. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regenerar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetSystem();
            await loadData();
            setBusy(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Listo', 'Enciclopedia Magna regenerada.');
          },
        },
      ]
    );
  };

  const storageKB = stats?.storage?.totalKB || 0;

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
        <Text style={styles.headerTitle}>PROFIL</Text>

        {/* ── STATS DEL SISTEMA ── */}
        <LuxuryCard title="Sistema" subtitle="ETHEREAL Engine v7.0">
          <View style={styles.statsGrid}>
            <StatCard
              label="Protocolos"
              value={stats?.protocolos?.total || 0}
              small
            />
            <StatCard
              label="Activos"
              value={stats?.protocolos?.activos || 0}
              small
            />
            <StatCard
              label="Perfumes"
              value={stats?.inventario?.totalPerfumes || 0}
              small
            />
            <StatCard
              label="Favoritos"
              value={stats?.favoritos || 0}
              small
            />
            <StatCard
              label="Usos"
              value={stats?.uso?.totalUsos || 0}
              small
            />
            <StatCard
              label="Storage"
              value={storageKB.toFixed(0)}
              unit="KB"
              small
            />
          </View>
        </LuxuryCard>

        {/* ── TIER DISTRIBUTION ── */}
        {stats?.protocolos && (
          <LuxuryCard title="Tiers" subtitle="Distribución de calidad">
            <View style={styles.tierGrid}>
              <View style={styles.tierItem}>
                <View style={[styles.tierBar, { backgroundColor: THEME.colors.tierAlpha, height: Math.max(4, (stats.protocolos.alpha / (stats.protocolos.activos || 1)) * 60) }]} />
                <Text style={styles.tierLabel}>Alpha</Text>
                <Text style={styles.tierCount}>{stats.protocolos.alpha}</Text>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBar, { backgroundColor: THEME.colors.tierBeta, height: Math.max(4, (stats.protocolos.beta / (stats.protocolos.activos || 1)) * 60) }]} />
                <Text style={styles.tierLabel}>Beta</Text>
                <Text style={styles.tierCount}>{stats.protocolos.beta}</Text>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBar, { backgroundColor: THEME.colors.tierGamma, height: Math.max(4, (stats.protocolos.gamma / (stats.protocolos.activos || 1)) * 60) }]} />
                <Text style={styles.tierLabel}>Gamma</Text>
                <Text style={styles.tierCount}>{stats.protocolos.gamma}</Text>
              </View>
              <View style={styles.tierItem}>
                <View style={[styles.tierBar, { backgroundColor: THEME.colors.tierDelta, height: Math.max(4, (stats.protocolos.delta / (stats.protocolos.activos || 1)) * 60) }]} />
                <Text style={styles.tierLabel}>Delta</Text>
                <Text style={styles.tierCount}>{stats.protocolos.delta}</Text>
              </View>
            </View>
          </LuxuryCard>
        )}

        {/* ── ADN OLFATIVO (Radar Chart) ── */}
        <LuxuryCard title="ADN Olfativo" subtitle="Tu perfil sensorial">
          <RadarChart
            data={{
              floral: Math.min(100, (stats?.protocolos?.alpha || 0) * 2),
              oriental: Math.min(100, (stats?.protocolos?.beta || 0) * 2),
              amaderado: Math.min(100, (stats?.inventario?.totalPerfumes || 0) * 4),
              fresco: Math.min(100, (stats?.uso?.totalUsos || 0) * 5),
              citrico: Math.min(100, (stats?.favoritos || 0) * 10),
              fougere: Math.min(100, (stats?.protocolos?.gamma || 0) * 2),
            }}
            size={220}
            title="PERFIL OLFATIVO"
          />
        </LuxuryCard>

        {/* ── SUGERENCIAS DE COMPRA ── */}
        {suggestions.length > 0 && (
          <>
            <SectionHeader title="Sugerencias de Compra" />
            <LuxuryCard>
              {suggestions.map((sug, idx) => (
                <View key={sug.perfume.id} style={styles.sugRow}>
                  <View style={styles.sugInfo}>
                    <Text style={styles.sugName}>
                      {sug.perfume.casa} {sug.perfume.nombre}
                    </Text>
                    <Text style={styles.sugReason}>{sug.razon}</Text>
                  </View>
                  <Text style={styles.sugScore}>+{sug.potencialFiscal}pts</Text>
                </View>
              ))}
            </LuxuryCard>
          </>
        )}

        {/* ── ACCIONES ── */}
        <SectionHeader title="Acciones" />

        <TouchableOpacity
          onPress={handleExport}
          disabled={busy}
          style={styles.actionRow}
        >
          <Download color={THEME.colors.gold} size={18} />
          <Text style={styles.actionText}>Exportar Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReset}
          disabled={busy}
          style={styles.actionRow}
        >
          <RefreshCw color={THEME.colors.danger} size={18} />
          <Text style={[styles.actionText, { color: THEME.colors.danger }]}>
            Regenerar Enciclopedia
          </Text>
        </TouchableOpacity>

        {/* ── VERSIÓN ── */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            L'ESSENCE DU LUXE
          </Text>
          <Text style={styles.versionNumber}>
            ETHEREAL EDITION OMNI v8.0.0
          </Text>
          <Text style={styles.versionSub}>
            Motor de Layering | 6 Pilares | Auditoría Fiscal
          </Text>
        </View>

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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 8,
  },
  tierGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 10,
  },
  tierItem: {
    alignItems: 'center',
    gap: 4,
  },
  tierBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  tierLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 1,
  },
  tierCount: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  sugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  sugInfo: {
    flex: 1,
    marginRight: 8,
  },
  sugName: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sugReason: {
    color: THEME.colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  sugScore: {
    color: THEME.colors.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  actionText: {
    color: THEME.colors.text,
    fontSize: 14,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 20,
  },
  versionText: {
    color: THEME.colors.gold,
    fontSize: 12,
    letterSpacing: 4,
  },
  versionNumber: {
    color: THEME.colors.textDim,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
  versionSub: {
    color: THEME.colors.textDim,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 4,
  },
});
