/**
 * ETHEREAL v8.0 OMNI — ERROR BOUNDARY (Self-Healing Navigation)
 * ===============================================================
 * Captura errores de renderizado en cualquier componente hijo
 * y muestra un fallback elegante en vez de crashear la app.
 * Incluye botón de retry para auto-recuperación.
 *
 * CAPA: OMNI v8
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const THEME_FALLBACK = {
  gold: '#D4AF37',
  goldDim: '#8A7120',
  bg: '#050505',
  text: '#FFFFFF',
  textDim: '#666666',
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log para debugging (en producción conectar a servicio de crash reporting)
    console.error('[ErrorBoundary] Componente atrapado:', error);
    console.error('[ErrorBoundary] Info:', errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          retry: this.handleRetry,
        });
      }

      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#050505', '#1A1105', '#050505']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.content}>
            {/* Ícono de error elegante */}
            <View style={styles.iconContainer}>
              <View style={styles.iconOuter}>
                <Text style={styles.iconText}>!</Text>
              </View>
            </View>

            <Text style={styles.title}>ANOMALÍA DETECTADA</Text>
            <Text style={styles.subtitle}>Le Système se recuperará</Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorLabel}>DIAGNÓSTICO</Text>
              <Text style={styles.errorMessage} numberOfLines={4}>
                {this.state.error?.message || 'Error desconocido en componente visual'}
              </Text>
              {this.state.retryCount > 0 && (
                <Text style={styles.retryInfo}>
                  Intentos de recuperación: {this.state.retryCount}
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={this.handleRetry} activeOpacity={0.7}>
              <LinearGradient
                colors={[THEME_FALLBACK.gold, THEME_FALLBACK.goldDim]}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>RECUPERAR MÓDULO</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.footer}>
              ETHEREAL EDITION v8.0 — Self-Healing Navigation
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC para envolver cualquier screen en un ErrorBoundary.
 */
export function withErrorBoundary(Component, fallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: THEME_FALLBACK.gold,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  iconText: {
    color: THEME_FALLBACK.gold,
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    color: THEME_FALLBACK.gold,
    fontSize: 16,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: THEME_FALLBACK.textDim,
    fontSize: 12,
    letterSpacing: 2,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  errorBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 30,
  },
  errorLabel: {
    color: THEME_FALLBACK.goldDim,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 8,
  },
  errorMessage: {
    color: THEME_FALLBACK.textDim,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  retryInfo: {
    color: THEME_FALLBACK.goldDim,
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  footer: {
    color: THEME_FALLBACK.textDim,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 40,
  },
});
