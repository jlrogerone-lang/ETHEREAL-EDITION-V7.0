/**
 * ETHEREAL EDITION v7.0 - COMPONENTES UI COMPARTIDOS
 * =====================================================
 * Extraídos de App.js original. Estos componentes visuales
 * son INMUTABLES - representan la identidad visual de la marca.
 *
 * Exporta: THEME, Background, LuxuryCard, GoldButton, StatCard, TierBadge
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// ── THEME SAGRADO ─────────────────────────────────────

export const THEME = {
  colors: {
    gold: '#D4AF37',
    goldDim: '#8A7120',
    goldLight: '#F8E79A',
    bg: '#000000',
    text: '#FFFFFF',
    textDim: '#666666',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    success: '#4CAF50',
    danger: '#F44336',
    tierAlpha: '#FFD700',
    tierBeta: '#C0C0C0',
    tierGamma: '#CD7F32',
    tierDelta: '#808080',
  },
  fonts: {
    serif: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
};

// ── BACKGROUND ────────────────────────────────────────

export const Background = () => (
  <LinearGradient
    colors={['#000000', '#1A1105', '#000000']}
    style={StyleSheet.absoluteFillObject}
  />
);

// ── LUXURY CARD ───────────────────────────────────────

export const LuxuryCard = ({ title, subtitle, children, style }) => (
  <View style={[styles.cardContainer, style]}>
    <LinearGradient
      colors={['transparent', THEME.colors.gold, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 1, opacity: 0.6 }}
    />
    <BlurView intensity={20} tint="dark" style={styles.cardContent}>
      {(title || subtitle) && (
        <View style={{ marginBottom: 15, alignItems: 'center' }}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {subtitle && (
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </BlurView>
  </View>
);

// ── GOLD BUTTON ───────────────────────────────────────

export const GoldButton = ({ text, onPress, disabled, loading }) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.goldButton, disabled && { opacity: 0.4 }]}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          disabled
            ? [THEME.colors.textDim, THEME.colors.textDim]
            : [THEME.colors.gold, THEME.colors.goldDim]
        }
        style={styles.goldButtonGradient}
      >
        {loading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <>
            <Text style={styles.goldButtonText}>{text}</Text>
            <ArrowRight color="#000" size={16} />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── STAT CARD (Nuevo - misma familia visual) ──────────

export const StatCard = ({ label, value, unit, small }) => (
  <View style={[styles.statCard, small && { minWidth: 80 }]}>
    <Text style={[styles.statValue, small && { fontSize: 20 }]}>
      {value}
    </Text>
    {unit && <Text style={styles.statUnit}>{unit}</Text>}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── TIER BADGE ────────────────────────────────────────

const TIER_COLORS = {
  Alpha: THEME.colors.tierAlpha,
  Beta: THEME.colors.tierBeta,
  Gamma: THEME.colors.tierGamma,
  Delta: THEME.colors.tierDelta,
};

export const TierBadge = ({ tier, size = 'normal' }) => {
  const color = TIER_COLORS[tier] || THEME.colors.textDim;
  const fontSize = size === 'small' ? 9 : 11;
  return (
    <View style={[styles.tierBadge, { borderColor: color }]}>
      <Text style={[styles.tierText, { color, fontSize }]}>{tier}</Text>
    </View>
  );
};

// ── SECTION HEADER ────────────────────────────────────

export const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.sectionLink}>Ver todo</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── EMPTY STATE ───────────────────────────────────────

export const EmptyState = ({ message }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ── LOADING OVERLAY ───────────────────────────────────

export const LoadingOverlay = ({ message = 'Cargando...' }) => (
  <View style={styles.loadingOverlay}>
    <Background />
    <ActivityIndicator color={THEME.colors.gold} size="large" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ── STYLES ────────────────────────────────────────────

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 26,
    color: THEME.colors.gold,
    fontFamily: THEME.fonts.serif,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 10,
    color: THEME.colors.textDim,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  goldButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  goldButtonGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldButtonText: {
    color: '#000',
    fontWeight: 'bold',
    marginRight: 10,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderRadius: 12,
    padding: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  statValue: {
    fontSize: 28,
    color: THEME.colors.gold,
    fontWeight: 'bold',
    fontFamily: THEME.fonts.serif,
  },
  statUnit: {
    fontSize: 10,
    color: THEME.colors.goldDim,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  tierBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tierText: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: THEME.colors.gold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sectionLink: {
    color: THEME.colors.goldDim,
    fontSize: 11,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.colors.gold,
    marginTop: 16,
    letterSpacing: 2,
    fontSize: 12,
  },
});
