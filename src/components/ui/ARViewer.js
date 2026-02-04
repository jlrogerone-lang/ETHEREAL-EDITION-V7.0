/**
 * ETHEREAL v8.0 OMNI — AR VIEWER (Le Flacon 3D)
 * =================================================
 * Componente placeholder preparado para visualización 3D/AR
 * de frascos de perfume. Actualmente muestra una representación
 * visual con animación mientras se integra la librería AR.
 *
 * Preparado para: expo-three / expo-gl / react-native-arkit
 *
 * CAPA: DIVINITY v6
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from './SharedComponents';

export default function ARViewer({ perfumeName, casa, size = 200 }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnim.start();
    pulseAnim.start();

    return () => {
      rotateAnim.stop();
      pulseAnim.stop();
    };
  }, [rotation, pulse]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Anillos orbitales decorativos */}
      <Animated.View
        style={[
          styles.orbit,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            transform: [{ rotate: spin }],
          },
        ]}
      />

      {/* Frasco representativo */}
      <Animated.View
        style={[
          styles.bottle,
          {
            transform: [{ scale: pulse }],
          },
        ]}
      >
        <LinearGradient
          colors={[THEME.colors.gold, 'rgba(212,175,55,0.3)', 'transparent']}
          style={styles.bottleGradient}
        >
          <View style={styles.bottleCap} />
          <View style={styles.bottleBody}>
            <Text style={styles.bottleLabel}>
              {casa ? casa.substring(0, 3).toUpperCase() : 'EAU'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Info */}
      <View style={styles.info}>
        {perfumeName && (
          <Text style={styles.perfumeName} numberOfLines={1}>
            {perfumeName}
          </Text>
        )}
        <Text style={styles.arLabel}>3D PREVIEW</Text>
        <Text style={styles.arSub}>AR Experience — Próximamente</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    borderStyle: 'dashed',
  },
  bottle: {
    width: 60,
    height: 90,
    alignItems: 'center',
  },
  bottleGradient: {
    width: 50,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  bottleCap: {
    width: 16,
    height: 12,
    backgroundColor: THEME.colors.gold,
    borderRadius: 3,
    position: 'absolute',
    top: -6,
  },
  bottleBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleLabel: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  info: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  perfumeName: {
    color: THEME.colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  arLabel: {
    color: THEME.colors.gold,
    fontSize: 8,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  arSub: {
    color: THEME.colors.textDim,
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 2,
  },
});
