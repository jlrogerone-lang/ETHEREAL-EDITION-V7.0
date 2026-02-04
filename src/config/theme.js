/**
 * ETHEREAL v8.0 OMNI — THEME CONFIGURATION
 * ===========================================
 * Fuente canónica del sistema de diseño.
 * OLED Black (#050505) + Gold (#D4AF37).
 *
 * Capas anteriores (SharedComponents) mantienen su THEME
 * por retrocompatibilidad. Nuevos módulos importan desde aquí.
 */

import { Platform } from 'react-native';

const THEME = {
  colors: {
    // ── Primarios ──
    gold: '#D4AF37',
    goldDim: '#8A7120',
    goldLight: '#F8E79A',

    // ── Fondos OLED ──
    bg: '#050505',
    bgDeep: '#000000',
    bgCard: '#0A0A0A',
    bgElevated: '#121212',

    // ── Textos ──
    text: '#FFFFFF',
    textDim: '#666666',
    textMuted: '#444444',

    // ── Cards ──
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    glassBg: 'rgba(255,255,255,0.06)',
    glassBorder: 'rgba(212,175,55,0.15)',

    // ── Semánticos ──
    success: '#4CAF50',
    danger: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    // ── Tiers ──
    tierAlpha: '#FFD700',
    tierBeta: '#C0C0C0',
    tierGamma: '#CD7F32',
    tierDelta: '#808080',

    // ── Familias Olfativas ──
    familyFloral: '#FF69B4',
    familyWoody: '#8B4513',
    familyCitrus: '#FFD700',
    familyOriental: '#8B0000',
    familyFresh: '#00CED1',
    familyAquatic: '#4169E1',
    familyGourmand: '#D2691E',
    familyChypre: '#228B22',
    familyFougere: '#2E8B57',
    familyLeather: '#654321',
  },

  fonts: {
    serif: Platform.OS === 'ios' ? 'Didot' : 'serif',
    sans: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  shadow: {
    gold: {
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export default THEME;
