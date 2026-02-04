/**
 * ETHEREAL v7.0 - LE NEZ SCREEN (IA + Voz)
 * ===========================================
 * Interfaz de voz conectada al motor de layering.
 * El usuario habla y el motor sugiere protocolos por voz.
 * UI INMUTABLE: se mantiene el círculo de voz y LuxuryCard.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import {
  Background,
  LuxuryCard,
  TierBadge,
  THEME,
} from '../components/ui/SharedComponents';
import { useLayering } from '../context/LayeringContext';

export default function LeNezScreen({ navigation }) {
  const { initialized, loadProtocols } = useLayering();

  const [isListening, setIsListening] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [recentProtocols, setRecentProtocols] = useState([]);
  const timerRef = useRef(null);

  const loadRecent = useCallback(async () => {
    const protocols = await loadProtocols({ ordenarPor: 'compatibilidad' });
    setRecentProtocols(protocols.slice(0, 3));
  }, [loadProtocols]);

  useEffect(() => {
    if (!initialized) return;
    loadRecent();
  }, [initialized, loadRecent]);

  // Cleanup timer and speech on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      Speech.stop();
    };
  }, []);

  const startVoice = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsListening(!isListening);

    if (!isListening) {
      Speech.speak(
        'Monsieur, mis sensores están listos. ¿Qué aroma buscamos?',
        { language: 'es-ES', rate: 0.85 }
      );

      // Simular recomendación del motor tras "escuchar"
      timerRef.current = setTimeout(async () => {
        const protocols = await loadProtocols({ ordenarPor: 'ahorro' });
        if (protocols.length > 0) {
          const randomIdx = Math.floor(Math.random() * Math.min(10, protocols.length));
          const picked = protocols[randomIdx];
          setRecommendation(picked);
          setIsListening(false);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Speech.speak(
            `Le recomiendo el ${picked.nombreOperacion}. Categoría: ${picked.categoria}. Ahorro estimado: ${picked.analisisCoste.ahorroGenerado.toFixed(0)} euros.`,
            { language: 'es-ES', rate: 0.85 }
          );
        }
        timerRef.current = null;
      }, 3000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      Speech.stop();
      setIsListening(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Background />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          {/* ── RECOMENDACIÓN ACTIVA ── */}
          {recommendation && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('ProtocolDetail', {
                  protocolId: recommendation.id,
                });
              }}
              activeOpacity={0.7}
            >
              <LuxuryCard
                title={recommendation.nombreOperacion}
                subtitle={recommendation.categoria}
              >
                <View style={styles.recRow}>
                  <View style={styles.recDetail}>
                    <Text style={styles.recLabel}>Ahorro</Text>
                    <Text style={styles.recValue}>
                      +{recommendation.analisisCoste.ahorroGenerado.toFixed(0)}€
                    </Text>
                  </View>
                  <View style={styles.recDetail}>
                    <Text style={styles.recLabel}>Compat.</Text>
                    <Text style={styles.recValue}>
                      {recommendation.compatibilidadQuimica.porcentajeParentesco.toFixed(0)}%
                    </Text>
                  </View>
                  <TierBadge
                    tier={recommendation.compatibilidadQuimica.tier}
                  />
                </View>
                <Text style={styles.recDesc} numberOfLines={3}>
                  {recommendation.descripcion}
                </Text>
                <Text style={styles.tapHint}>Toca para ver detalle completo</Text>
              </LuxuryCard>
            </TouchableOpacity>
          )}

          {/* ── SENSOR PRINCIPAL ── */}
          <LuxuryCard title="Le Nez" subtitle="Artificial Intelligence">
            <Text style={styles.statusText}>
              {isListening
                ? 'Escuchando su voz...'
                : recommendation
                ? 'Recomendación lista. Toque para otra.'
                : 'Toque el sensor para hablar.'}
            </Text>
          </LuxuryCard>

          <TouchableOpacity
            onPress={startVoice}
            style={[
              styles.voiceCircle,
              isListening && { borderColor: THEME.colors.goldLight },
            ]}
          >
            <Sparkles color={THEME.colors.gold} size={32} />
          </TouchableOpacity>

          {/* ── PROTOCOLOS RECIENTES ── */}
          {recentProtocols.length > 0 && !recommendation && (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>SUGERENCIAS RÁPIDAS</Text>
              {recentProtocols.map((p) => (
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
                  <View style={styles.recentRow}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {p.nombreOperacion}
                    </Text>
                    <Text style={styles.recentSaving}>
                      +{p.analisisCoste.ahorroGenerado.toFixed(0)}€
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  statusText: {
    color: THEME.colors.gold,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  voiceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    alignSelf: 'center',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  recRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  recDetail: {
    alignItems: 'center',
  },
  recLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 1,
  },
  recValue: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recDesc: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  tapHint: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  recentSection: {
    marginTop: 30,
  },
  recentTitle: {
    color: THEME.colors.goldDim,
    fontSize: 10,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  recentName: {
    color: THEME.colors.text,
    fontSize: 13,
    flex: 1,
  },
  recentSaving: {
    color: THEME.colors.success,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
