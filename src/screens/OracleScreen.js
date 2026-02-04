/**
 * ETHEREAL v7.0 - L'ORACLE SCREEN (Auditoría Fiscal)
 * =====================================================
 * Dashboard financiero completo.
 * Muestra el ahorro acumulado, proyecciones,
 * top protocolos por ahorro y historial de uso.
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
import * as Haptics from 'expo-haptics';
import {
  Background,
  LuxuryCard,
  StatCard,
  SectionHeader,
  TierBadge,
  EmptyState,
  THEME,
} from '../components/ui/SharedComponents';
import { useLayering } from '../context/LayeringContext';

export default function OracleScreen({ navigation }) {
  const {
    initialized,
    savingsSummary,
    loadFinancialReport,
    loadSavings,
  } = useLayering();

  const [report, setReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    loadData();
  }, [initialized]);

  const loadData = useCallback(async () => {
    await loadSavings();
    const r = await loadFinancialReport();
    setReport(r);
  }, [loadSavings, loadFinancialReport]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalSaved = savingsSummary?.totalAhorrado || 0;
  const totalSpent = savingsSummary?.totalGastado || 0;
  const timesUsed = savingsSummary?.protocolosUsados || 0;
  const avgPerUse = savingsSummary?.ahorroPromedioPorUso || 0;
  const roi = savingsSummary?.roiGlobal || 0;

  const projDaily = report?.proyeccion?.ahorroDiario || 0;
  const projMonthly = report?.proyeccion?.ahorroMensual || 0;
  const projYearly = report?.proyeccion?.ahorroAnual || 0;

  const nicheValue = report?.valorNicheEquivalente?.valorNicheTotal || 0;
  const maxSavings = report?.valorNicheEquivalente?.ahorroMaximo || 0;

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
        <Text style={styles.headerTitle}>L'ORACLE</Text>
        <Text style={styles.headerSub}>AUDITORÍA FISCAL DE FRAGANCIAS</Text>

        {/* ── AHORRO PRINCIPAL ── */}
        <LuxuryCard title="Ahorro Total" subtitle="Acumulado histórico">
          <Text style={styles.bigAmount}>{totalSaved.toFixed(2)}</Text>
          <Text style={styles.bigCurrency}>EUROS AHORRADOS</Text>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <StatCard label="Gastado" value={totalSpent.toFixed(2)} unit="€" small />
            <StatCard label="Usos" value={timesUsed} small />
            <StatCard label="ROI" value={`${roi.toFixed(0)}x`} small />
          </View>
        </LuxuryCard>

        {/* ── AHORRO POR USO ── */}
        <LuxuryCard>
          <View style={styles.statsRow}>
            <StatCard label="Ahorro/Uso" value={avgPerUse.toFixed(1)} unit="€" />
            <View style={styles.formulaBox}>
              <Text style={styles.formulaTitle}>FÓRMULA FISCAL</Text>
              <Text style={styles.formula}>Precio Nicho</Text>
              <Text style={styles.formulaOp}>−</Text>
              <Text style={styles.formula}>Coste Atomizaciones</Text>
              <Text style={styles.formulaOp}>=</Text>
              <Text style={[styles.formula, { color: THEME.colors.success }]}>
                AHORRO
              </Text>
            </View>
          </View>
        </LuxuryCard>

        {/* ── PROYECCIONES ── */}
        <SectionHeader title="Proyección de Ahorro" />
        <LuxuryCard>
          <View style={styles.statsRow}>
            <StatCard label="Diario" value={projDaily.toFixed(1)} unit="€" small />
            <StatCard label="Mensual" value={projMonthly.toFixed(0)} unit="€" small />
            <StatCard label="Anual" value={projYearly.toFixed(0)} unit="€" small />
          </View>
        </LuxuryCard>

        {/* ── VALOR NICHO EQUIVALENTE ── */}
        <SectionHeader title="Valor Nicho Equivalente" />
        <LuxuryCard>
          <View style={styles.nicheRow}>
            <View style={styles.nicheItem}>
              <Text style={styles.nicheLabel}>Valor Nicho Total</Text>
              <Text style={styles.nicheValue}>{Math.round(nicheValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}€</Text>
              <Text style={styles.nicheDesc}>
                Suma de todos los referentes nicho emulables
              </Text>
            </View>
            <View style={styles.nicheDivider} />
            <View style={styles.nicheItem}>
              <Text style={styles.nicheLabel}>Ahorro Máximo Posible</Text>
              <Text style={[styles.nicheValue, { color: THEME.colors.success }]}>
                {Math.round(maxSavings).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}€
              </Text>
              <Text style={styles.nicheDesc}>
                Si usases todos los protocolos activos
              </Text>
            </View>
          </View>
        </LuxuryCard>

        {/* ── TOP PROTOCOLOS POR AHORRO ── */}
        {report?.topProtocolos && report.topProtocolos.length > 0 && (
          <>
            <SectionHeader
              title="Top 5 Mayor Ahorro"
              onSeeAll={() => navigation.navigate('Biblio')}
            />
            {report.topProtocolos.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('ProtocolDetail', {
                    protocolId: p.id,
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.topRow}>
                  <View style={styles.topRank}>
                    <Text style={styles.topRankText}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.topInfo}>
                    <Text style={styles.topName} numberOfLines={1}>
                      {p.nombre}
                    </Text>
                    <Text style={styles.topNiche}>
                      Emula: {p.nicheEmulado}
                    </Text>
                  </View>
                  <Text style={styles.topSaving}>
                    +{p.ahorro.toFixed(0)}€
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {timesUsed === 0 && (
          <LuxuryCard>
            <EmptyState message="Aún no has registrado usos. Ve a un protocolo y toca 'Usar Protocolo' para empezar a acumular ahorro." />
          </LuxuryCard>
        )}

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
    marginTop: 20,
    marginBottom: 4,
  },
  headerSub: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  bigAmount: {
    fontSize: 48,
    color: THEME.colors.gold,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
    textAlign: 'center',
  },
  bigCurrency: {
    fontSize: 10,
    color: THEME.colors.goldDim,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.cardBorder,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  formulaBox: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  formulaTitle: {
    color: THEME.colors.goldDim,
    fontSize: 8,
    letterSpacing: 2,
    marginBottom: 6,
  },
  formula: {
    color: THEME.colors.text,
    fontSize: 11,
  },
  formulaOp: {
    color: THEME.colors.goldDim,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nicheRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicheItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  nicheDivider: {
    width: 1,
    height: 60,
    backgroundColor: THEME.colors.cardBorder,
  },
  nicheLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  nicheValue: {
    color: THEME.colors.gold,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
  },
  nicheDesc: {
    color: THEME.colors.textDim,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  topRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  topRankText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: 'bold',
  },
  topInfo: {
    flex: 1,
    marginRight: 8,
  },
  topName: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  topNiche: {
    color: THEME.colors.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  topSaving: {
    color: THEME.colors.success,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
