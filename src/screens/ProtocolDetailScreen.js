/**
 * ETHEREAL v7.0 - PROTOCOL DETAIL SCREEN (6 Pilares)
 * =====================================================
 * Vista completa de un protocolo de layering mostrando
 * OBLIGATORIAMENTE los 6 Pilares Inquebrantables.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Clock, Droplets, Beaker, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import {
  Background,
  LuxuryCard,
  GoldButton,
  StatCard,
  TierBadge,
  THEME,
  LoadingOverlay,
} from '../components/ui/SharedComponents';
import { useLayering } from '../context/LayeringContext';
import { getPerfumeById } from '../data/perfumeInventory';
import { getNicheById } from '../data/nicheReferences';

export default function ProtocolDetailScreen({ route, navigation }) {
  const { protocolId } = route.params;
  const {
    selectProtocol,
    toggleFavorite,
    registerUsage,
    favorites,
  } = useLayering();

  const [protocol, setProtocol] = useState(null);
  const [perfumes, setPerfumes] = useState([]);
  const [nicheRef, setNicheRef] = useState(null);
  const [busy, setBusy] = useState(false);

  const isFav = favorites.includes(protocolId);

  useEffect(() => {
    loadProtocol();
  }, [protocolId]);

  const loadProtocol = async () => {
    const p = await selectProtocol(protocolId);
    if (!p) return;
    setProtocol(p);
    setPerfumes(p.activosReales.map((id) => getPerfumeById(id)).filter(Boolean));
    setNicheRef(getNicheById(p.analisisCoste.referenteNicheId));
  };

  const handleUseProtocol = () => {
    Alert.alert(
      'Registrar Uso',
      `Registrar uso de "${protocol.nombreOperacion}"? Esto sumará ${protocol.analisisCoste.ahorroGenerado.toFixed(2)}€ a tu ahorro acumulado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrar',
          onPress: async () => {
            setBusy(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const result = await registerUsage(protocolId);
            setBusy(false);
            if (result) {
              Alert.alert(
                'Uso Registrado',
                `+${result.ahorro.toFixed(2)}€ de ahorro. Total acumulado: ${result.totalAhorrado.toFixed(2)}€`
              );
            }
          },
        },
      ]
    );
  };

  const handleSpeak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = `${protocol.nombreOperacion}. ${protocol.categoria}. Ahorro de ${protocol.analisisCoste.ahorroGenerado.toFixed(0)} euros. Compatibilidad: ${protocol.compatibilidadQuimica.porcentajeParentesco.toFixed(0)} por ciento.`;
    Speech.speak(text, { language: 'es-ES', rate: 0.85 });
  };

  if (!protocol) {
    return <LoadingOverlay message="Cargando protocolo..." />;
  }

  const ac = protocol.analisisCoste;
  const ft = protocol.factorTiempo;
  const cq = protocol.compatibilidadQuimica;
  const tq = protocol.tecnicaQuirurgica;

  return (
    <SafeAreaView style={styles.container}>
      <Background />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft color={THEME.colors.gold} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {protocol.nombreOperacion}
        </Text>
        <TouchableOpacity
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await toggleFavorite(protocolId);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            color={isFav ? THEME.colors.gold : THEME.colors.textDim}
            size={20}
            fill={isFav ? THEME.colors.gold : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── PILAR 1: NOMBRE DE LA OPERACIÓN ── */}
        <LuxuryCard
          title={protocol.nombreOperacion}
          subtitle={protocol.categoria}
        >
          <TierBadge tier={cq.tier} />
          <Text style={styles.pillarLabel}>PILAR 1 — NOMBRE DE LA OPERACIÓN</Text>
          <Text style={styles.description}>{protocol.descripcion}</Text>
          <TouchableOpacity onPress={handleSpeak} style={styles.speakBtn}>
            <Text style={styles.speakText}>ESCUCHAR</Text>
          </TouchableOpacity>
        </LuxuryCard>

        {/* ── PILAR 2: ACTIVOS REALES ── */}
        <LuxuryCard>
          <Text style={styles.pillarLabel}>PILAR 2 — ACTIVOS REALES</Text>
          {perfumes.map((p, idx) => (
            <View key={p.id} style={styles.perfumeItem}>
              <View style={styles.perfumeOrder}>
                <Text style={styles.orderText}>{idx + 1}</Text>
              </View>
              <View style={styles.perfumeInfo}>
                <Text style={styles.perfumeName}>{p.nombre}</Text>
                <Text style={styles.perfumeHouse}>
                  {p.casa} | {p.familia} | {p.concentracion}
                </Text>
                <Text style={styles.perfumeNotes} numberOfLines={1}>
                  Top: {p.notasTop.slice(0, 3).join(', ')}
                </Text>
              </View>
              <Text style={styles.perfumePrice}>{p.precioRetail}€</Text>
            </View>
          ))}
        </LuxuryCard>

        {/* ── PILAR 3: ANÁLISIS DE COSTE ── */}
        <LuxuryCard>
          <Text style={styles.pillarLabel}>PILAR 3 — ANÁLISIS DE COSTE</Text>

          {nicheRef && (
            <View style={styles.nicheRefBox}>
              <Text style={styles.nicheRefLabel}>REFERENTE NICHO</Text>
              <Text style={styles.nicheRefName}>
                {nicheRef.casa} — {nicheRef.nombre}
              </Text>
              <Text style={styles.nicheRefPrice}>{nicheRef.precioRetail}€</Text>
            </View>
          )}

          <View style={styles.costBreakdown}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Precio Referente Nicho</Text>
              <Text style={styles.costValue}>{ac.precioReferenteNiche}€</Text>
            </View>

            {ac.costeDesglosado.map((d, idx) => (
              <View key={idx} style={styles.costRow}>
                <Text style={styles.costLabel}>
                  − {d.atomizaciones}x spray {d.nombre.split(' - ')[1] || d.nombre}
                </Text>
                <Text style={[styles.costValue, { color: THEME.colors.danger }]}>
                  -{d.subtotal.toFixed(3)}€
                </Text>
              </View>
            ))}

            <View style={styles.costDivider} />

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Coste Real</Text>
              <Text style={styles.costValue}>{ac.costeRealLayering}€</Text>
            </View>

            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { fontWeight: 'bold', color: THEME.colors.success }]}>
                AHORRO GENERADO
              </Text>
              <Text style={[styles.costValue, { color: THEME.colors.success, fontSize: 18, fontWeight: 'bold' }]}>
                +{ac.ahorroGenerado}€
              </Text>
            </View>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>% Ahorro</Text>
              <Text style={styles.costValue}>{ac.porcentajeAhorro}%</Text>
            </View>
          </View>
        </LuxuryCard>

        {/* ── PILAR 4: TÉCNICA QUIRÚRGICA ── */}
        <LuxuryCard>
          <Text style={styles.pillarLabel}>PILAR 4 — TÉCNICA QUIRÚRGICA</Text>
          {tq.map((app, idx) => {
            const perfume = getPerfumeById(app.perfumeId);
            return (
              <View key={idx} style={styles.stepItem}>
                <View style={styles.stepOrder}>
                  <Text style={styles.stepOrderText}>Paso {app.orden}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepName}>
                    {perfume ? perfume.nombre : app.perfumeId}
                  </Text>
                  <Text style={styles.stepDetail}>
                    {app.atomizaciones} atomizaciones | {app.zona} | {app.distanciaCm}cm
                  </Text>
                  <Text style={styles.stepNote}>{app.notas}</Text>
                </View>
              </View>
            );
          })}
        </LuxuryCard>

        {/* ── PILAR 5: FACTOR TIEMPO ── */}
        <LuxuryCard>
          <Text style={styles.pillarLabel}>PILAR 5 — FACTOR TIEMPO</Text>
          <View style={styles.timeStats}>
            <StatCard
              label="Secado"
              value={ft.tiempoSecadoEntreCapas}
              unit="seg"
              small
            />
            <StatCard
              label="Aplicación"
              value={ft.tiempoTotalAplicacion}
              unit="seg"
              small
            />
            <StatCard
              label="Desarrollo"
              value={ft.tiempoDesarrolloCompleto}
              unit="min"
              small
            />
          </View>
          <View style={styles.timeStats}>
            <StatCard
              label="Longevidad"
              value={ft.longevidadEstimada}
              unit="h"
              small
            />
            <StatCard
              label="Sillage Pico"
              value={ft.sillagePico}
              unit="h"
              small
            />
          </View>

          <Text style={styles.cronTitle}>CRONOGRAMA</Text>
          {ft.cronograma.map((step, idx) => (
            <View key={idx} style={styles.cronStep}>
              <View style={styles.cronDot} />
              <Text style={styles.cronText}>
                {step.descripcion} ({step.tiempoSegundos}s)
              </Text>
            </View>
          ))}
        </LuxuryCard>

        {/* ── PILAR 6: COMPATIBILIDAD QUÍMICA ── */}
        <LuxuryCard>
          <Text style={styles.pillarLabel}>
            PILAR 6 — COMPATIBILIDAD QUÍMICA
          </Text>
          <View style={styles.compatHeader}>
            <Text style={styles.compatPercent}>
              {cq.porcentajeParentesco}%
            </Text>
            <TierBadge tier={cq.tier} />
          </View>

          <View style={styles.compatRow}>
            <Text style={styles.compatLabel}>Familias</Text>
            <Text style={styles.compatValue}>
              {cq.familiasPresentes.join(' + ')}
            </Text>
          </View>
          <View style={styles.compatRow}>
            <Text style={styles.compatLabel}>Riesgo</Text>
            <Text
              style={[
                styles.compatValue,
                {
                  color:
                    cq.riesgoConflicto === 'bajo'
                      ? THEME.colors.success
                      : cq.riesgoConflicto === 'medio'
                      ? THEME.colors.gold
                      : THEME.colors.danger,
                },
              ]}
            >
              {cq.riesgoConflicto.toUpperCase()}
            </Text>
          </View>

          {cq.notasCompartidas.length > 0 && (
            <View style={styles.compatRow}>
              <Text style={styles.compatLabel}>Notas Compartidas</Text>
              <Text style={styles.compatValue}>
                {cq.notasCompartidas.slice(0, 5).join(', ')}
              </Text>
            </View>
          )}

          <Text style={styles.synergyText}>{cq.sinergia}</Text>
        </LuxuryCard>

        {/* ── ACCIÓN PRINCIPAL ── */}
        <GoldButton
          text="USAR PROTOCOLO"
          onPress={handleUseProtocol}
          disabled={busy}
          loading={busy}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 13,
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: { padding: 20, paddingTop: 0 },
  pillarLabel: {
    color: THEME.colors.goldDim,
    fontSize: 8,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  description: {
    color: THEME.colors.textDim,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  speakBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.goldDim,
  },
  speakText: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
  },
  perfumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  perfumeOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  orderText: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: 'bold',
  },
  perfumeInfo: {
    flex: 1,
    marginRight: 8,
  },
  perfumeName: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  perfumeHouse: {
    color: THEME.colors.goldDim,
    fontSize: 10,
    marginTop: 1,
  },
  perfumeNotes: {
    color: THEME.colors.textDim,
    fontSize: 9,
    marginTop: 1,
  },
  perfumePrice: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  nicheRefBox: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  nicheRefLabel: {
    color: THEME.colors.goldDim,
    fontSize: 8,
    letterSpacing: 2,
  },
  nicheRefName: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  nicheRefPrice: {
    color: THEME.colors.gold,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
    marginTop: 4,
  },
  costBreakdown: {
    gap: 6,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    color: THEME.colors.textDim,
    fontSize: 11,
    flex: 1,
  },
  costValue: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  costDivider: {
    height: 1,
    backgroundColor: THEME.colors.gold,
    opacity: 0.3,
    marginVertical: 6,
  },
  stepItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  stepOrder: {
    marginRight: 10,
  },
  stepOrderText: {
    color: THEME.colors.gold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  stepDetail: {
    color: THEME.colors.goldDim,
    fontSize: 10,
    marginTop: 2,
  },
  stepNote: {
    color: THEME.colors.textDim,
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 2,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    gap: 8,
  },
  cronTitle: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  cronStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cronDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.gold,
    marginTop: 5,
    marginRight: 8,
  },
  cronText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  compatHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  compatPercent: {
    color: THEME.colors.gold,
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
  },
  compatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  compatLabel: {
    color: THEME.colors.textDim,
    fontSize: 11,
  },
  compatValue: {
    color: THEME.colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  synergyText: {
    color: THEME.colors.goldDim,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
