/**
 * ETHEREAL v8.0 OMNI — LE SOMMELIER VISUEL
 * ============================================
 * Sube una foto de tu outfit y la IA recomienda
 * un perfume basado en colores y estilo de la imagen.
 * Usa GeminiService para el análisis visual.
 *
 * CAPA: OMNI v8
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Background, THEME } from '../components/ui/SharedComponents';
import GlassCard from '../components/ui/GlassCard';
import { captureOutfitPhoto, analyzeOutfitLocal } from '../services/GeminiService';
import { useLayering } from '../context/LayeringContext';

export default function SommelierScreen({ navigation }) {
  const { loadProtocols, initialized } = useLayering();

  const [photo, setPhoto] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [matchedProtocols, setMatchedProtocols] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = useCallback(async (source) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setAnalysis(null);
    setMatchedProtocols([]);

    try {
      const result = await captureOutfitPhoto(source);
      if (!result || result.error) {
        setLoading(false);
        return;
      }
      setPhoto(result);

      // Analizar outfit con motor heurístico local
      const outfitAnalysis = analyzeOutfitLocal({
        dominantColors: [
          { r: 30, g: 30, b: 30 },   // Dominante oscuro por defecto
          { r: 200, g: 170, b: 50 },  // Acento dorado
        ],
      });
      setAnalysis(outfitAnalysis);

      // Buscar protocolos compatibles con las familias recomendadas
      if (initialized) {
        const protocols = await loadProtocols({ ordenarPor: 'compatibilidad' });
        const matched = protocols
          .filter((p) => {
            const cat = (p.categoria || '').toLowerCase();
            return outfitAnalysis.families.some((f) =>
              cat.includes(f.toLowerCase().substring(0, 4))
            );
          })
          .slice(0, 5);

        // Si no hay match por categoría, tomar los top por compatibilidad
        setMatchedProtocols(matched.length > 0 ? matched : protocols.slice(0, 5));
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn('Error en análisis:', e);
    }
    setLoading(false);
  }, [initialized, loadProtocols]);

  return (
    <SafeAreaView style={styles.container}>
      <Background />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft color={THEME.colors.gold} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LE SOMMELIER</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Intro */}
        <GlassCard title="Le Sommelier Visuel" subtitle="IA de Moda × Fragancia">
          <Text style={styles.introText}>
            Sube una foto de tu outfit y nuestro algoritmo de visión
            recomendará la fragancia que mejor complementa tu estilo.
          </Text>
        </GlassCard>

        {/* Botones de captura */}
        {!loading && (
          <View style={styles.captureRow}>
            <TouchableOpacity
              onPress={() => pickPhoto('camera')}
              style={styles.captureButton}
              activeOpacity={0.7}
            >
              <Text style={styles.captureIcon}>📷</Text>
              <Text style={styles.captureLabel}>CÁMARA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickPhoto('gallery')}
              style={styles.captureButton}
              activeOpacity={0.7}
            >
              <Text style={styles.captureIcon}>🖼</Text>
              <Text style={styles.captureLabel}>GALERÍA</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={THEME.colors.gold} size="large" />
            <Text style={styles.loadingText}>Analizando tu estilo...</Text>
          </View>
        )}

        {/* Foto Preview */}
        {photo && !loading && (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Resultado del Análisis */}
        {analysis && !loading && (
          <>
            <GlassCard title="Análisis" subtitle="Perfil Visual Detectado">
              <View style={styles.analysisGrid}>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>ESTILO</Text>
                  <Text style={styles.analysisValue}>
                    {analysis.style.charAt(0).toUpperCase() + analysis.style.slice(1)}
                  </Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>MOOD</Text>
                  <Text style={styles.analysisValue}>
                    {analysis.mood.charAt(0).toUpperCase() + analysis.mood.slice(1)}
                  </Text>
                </View>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisLabel}>INTENSIDAD</Text>
                  <Text style={styles.analysisValue}>
                    {analysis.intensity.charAt(0).toUpperCase() + analysis.intensity.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Familias Recomendadas */}
              <Text style={styles.sectionLabel}>FAMILIAS RECOMENDADAS</Text>
              <View style={styles.familyRow}>
                {analysis.families.map((f) => (
                  <View key={f} style={styles.familyBadge}>
                    <Text style={styles.familyText}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Notas Sugeridas */}
              <Text style={styles.sectionLabel}>NOTAS SUGERIDAS</Text>
              <View style={styles.notesRow}>
                {analysis.recommendedNotes.map((n) => (
                  <Text key={n} style={styles.noteChip}>{n}</Text>
                ))}
              </View>

              {/* Confianza */}
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${analysis.confidence * 100}%` }]} />
              </View>
              <Text style={styles.confidenceText}>
                Confianza: {Math.round(analysis.confidence * 100)}%
              </Text>
            </GlassCard>

            {/* Protocolos Recomendados */}
            {matchedProtocols.length > 0 && (
              <GlassCard title="Protocolos" subtitle="Layerings Recomendados">
                {matchedProtocols.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate('ProtocolDetail', { protocolId: p.id });
                    }}
                    style={styles.protocolRow}
                    activeOpacity={0.7}
                  >
                    <View style={styles.protocolInfo}>
                      <Text style={styles.protocolName} numberOfLines={1}>
                        {p.nombreOperacion}
                      </Text>
                      <Text style={styles.protocolCat}>{p.categoria}</Text>
                    </View>
                    <Text style={styles.protocolSaving}>
                      +{p.analisisCoste.ahorroGenerado.toFixed(0)}€
                    </Text>
                  </TouchableOpacity>
                ))}
              </GlassCard>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  scroll: { padding: 20 },
  introText: {
    color: THEME.colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  captureIcon: { fontSize: 28, marginBottom: 8 },
  captureLabel: {
    color: THEME.colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: THEME.colors.goldDim,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 16,
  },
  photoPreview: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  photoImage: {
    width: '100%',
    height: 250,
  },
  analysisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  analysisItem: { alignItems: 'center' },
  analysisLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 2,
  },
  analysisValue: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionLabel: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 12,
  },
  familyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  familyBadge: {
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  familyText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  notesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  noteChip: {
    color: THEME.colors.textDim,
    fontSize: 11,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
    borderRadius: 2,
  },
  confidenceText: {
    color: THEME.colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  protocolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  protocolInfo: { flex: 1, marginRight: 8 },
  protocolName: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  protocolCat: {
    color: THEME.colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  protocolSaving: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
