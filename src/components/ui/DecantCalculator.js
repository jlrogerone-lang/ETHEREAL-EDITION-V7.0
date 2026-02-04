/**
 * ETHEREAL v8.0 OMNI — DECANT CALCULATOR
 * =========================================
 * Calculadora de decants: coste por ml, valor de la colección,
 * comparativa de precios entre tamaños.
 *
 * CAPA: TOOLS v3
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { THEME } from './SharedComponents';

export default function DecantCalculator({ onClose }) {
  const [bottleVolume, setBottleVolume] = useState('100');
  const [bottlePrice, setBottlePrice] = useState('');
  const [decantMl, setDecantMl] = useState('10');
  const [result, setResult] = useState(null);

  const calculate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const vol = parseFloat(bottleVolume);
    const price = parseFloat(bottlePrice);
    const ml = parseFloat(decantMl);

    if (!vol || !price || vol <= 0 || price <= 0) {
      setResult(null);
      return;
    }

    const costPerMl = price / vol;
    const decantCost = ml ? costPerMl * ml : 0;
    const atomizations = ml ? Math.floor(ml * 10) : 0;

    // Comparativa con tamaños estándar
    const sizes = [5, 10, 15, 30, 50, 100].filter((s) => s !== vol);
    const comparisons = sizes.map((s) => ({
      ml: s,
      cost: (costPerMl * s).toFixed(2),
    }));

    setResult({
      costPerMl: costPerMl.toFixed(4),
      decantCost: decantCost.toFixed(2),
      atomizations,
      comparisons,
    });
  }, [bottleVolume, bottlePrice, decantMl]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', THEME.colors.gold, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 1, opacity: 0.6 }}
      />
      <BlurView intensity={30} tint="dark" style={styles.content}>
        <Text style={styles.title}>CALCULADORA DE DECANTS</Text>
        <Text style={styles.subtitle}>Analiza el coste real de tus fragancias</Text>

        {/* Inputs */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VOLUMEN (ml)</Text>
            <TextInput
              style={styles.input}
              value={bottleVolume}
              onChangeText={setBottleVolume}
              keyboardType="numeric"
              placeholderTextColor={THEME.colors.textDim}
              placeholder="100"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PRECIO (€)</Text>
            <TextInput
              style={styles.input}
              value={bottlePrice}
              onChangeText={setBottlePrice}
              keyboardType="numeric"
              placeholderTextColor={THEME.colors.textDim}
              placeholder="150.00"
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DECANT (ml)</Text>
            <TextInput
              style={styles.input}
              value={decantMl}
              onChangeText={setDecantMl}
              keyboardType="numeric"
              placeholderTextColor={THEME.colors.textDim}
              placeholder="10"
            />
          </View>
          <TouchableOpacity onPress={calculate} style={styles.calcButton}>
            <LinearGradient
              colors={[THEME.colors.gold, THEME.colors.goldDim]}
              style={styles.calcButtonGrad}
            >
              <Text style={styles.calcButtonText}>CALCULAR</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {result && (
          <View style={styles.resultSection}>
            <View style={styles.resultMain}>
              <Text style={styles.resultLabel}>COSTE POR ML</Text>
              <Text style={styles.resultValue}>{result.costPerMl}€</Text>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>Decant {decantMl}ml</Text>
                <Text style={styles.resultItemValue}>{result.decantCost}€</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>Atomizaciones</Text>
                <Text style={styles.resultItemValue}>~{result.atomizations}</Text>
              </View>
            </View>

            {/* Comparativa */}
            <Text style={styles.compareTitle}>COMPARATIVA DE TAMAÑOS</Text>
            <View style={styles.compareGrid}>
              {result.comparisons.map((c) => (
                <View key={c.ml} style={styles.compareItem}>
                  <Text style={styles.compareMl}>{c.ml}ml</Text>
                  <Text style={styles.compareCost}>{c.cost}€</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>CERRAR</Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 20,
  },
  content: { padding: 20 },
  title: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    color: THEME.colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: { flex: 1 },
  inputLabel: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    color: THEME.colors.text,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    textAlign: 'center',
  },
  calcButton: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  calcButtonGrad: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calcButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  resultSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    paddingTop: 16,
  },
  resultMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    color: THEME.colors.textDim,
    fontSize: 10,
    letterSpacing: 2,
  },
  resultValue: {
    color: THEME.colors.gold,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultItem: { alignItems: 'center' },
  resultItemLabel: {
    color: THEME.colors.textDim,
    fontSize: 10,
  },
  resultItemValue: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  compareTitle: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  compareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  compareItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  compareMl: {
    color: THEME.colors.textDim,
    fontSize: 10,
  },
  compareCost: {
    color: THEME.colors.gold,
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  closeText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
  },
});
