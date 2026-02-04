/**
 * ETHEREAL v8.0 OMNI — GLASS CARD (Glassmorphism)
 * ==================================================
 * Tarjeta con efecto glassmorphism: blur intenso,
 * borde translúcido y fondo semi-transparente.
 * Reemplaza las vistas planas con diseño premium.
 *
 * CAPA: OMNI v8
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { THEME } from './SharedComponents';

/**
 * @param {Object} props
 * @param {string} [props.title] - Título dorado
 * @param {string} [props.subtitle] - Subtítulo dimmed
 * @param {number} [props.intensity=40] - Intensidad del blur
 * @param {string} [props.accentColor] - Color del acento superior
 * @param {React.ReactNode} props.children
 * @param {Object} [props.style] - Estilos adicionales para el contenedor
 */
export default function GlassCard({
  title,
  subtitle,
  children,
  intensity = 40,
  accentColor = THEME.colors.gold,
  style,
}) {
  return (
    <View style={[styles.outer, style]}>
      {/* Línea de acento superior */}
      <LinearGradient
        colors={['transparent', accentColor, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />

      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        {/* Overlay de cristal */}
        <View style={styles.glassOverlay}>
          {/* Reflejo superior */}
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)', 'transparent']}
            style={styles.reflection}
          />

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}

          {/* Contenido */}
          {children}
        </View>
      </BlurView>

      {/* Borde inferior sutil */}
      <LinearGradient
        colors={['transparent', 'rgba(212,175,55,0.15)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    // Borde glassmorphism
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    // Sombra
    ...Platform.select({
      ios: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  accentLine: {
    height: 1,
    opacity: 0.6,
  },
  blur: {
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
  },
  reflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: THEME.colors.gold,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 9,
    color: THEME.colors.textDim,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  bottomLine: {
    height: 1,
    opacity: 0.4,
  },
});
