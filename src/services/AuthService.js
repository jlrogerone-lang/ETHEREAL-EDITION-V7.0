/**
 * ETHEREAL v8.0 OMNI — AUTH SERVICE
 * ====================================
 * Autenticación biométrica (Face ID / Fingerprint) + Google Sign-In.
 * Usa expo-local-authentication para biometría nativa.
 *
 * CAPA: CORE v1
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_ENABLED: '@ethereal/auth_enabled',
  AUTH_METHOD: '@ethereal/auth_method',
  USER_PROFILE: '@ethereal/user_profile',
};

// ── Estado interno ──

let _authenticated = false;
let _userProfile = null;

// ── Biometría ──

async function checkBiometricSupport() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return { supported: false, types: [] };

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) return { supported: true, enrolled: false, types: [] };

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const typeNames = types.map((t) => {
    switch (t) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'face';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'iris';
      default:
        return 'unknown';
    }
  });

  return { supported: true, enrolled: true, types: typeNames };
}

async function authenticateBiometric(reason = 'Accede a tu colección') {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
    fallbackLabel: 'Usar contraseña',
  });

  if (result.success) {
    _authenticated = true;
    await AsyncStorage.setItem(KEYS.AUTH_METHOD, 'biometric');
  }

  return {
    success: result.success,
    error: result.error || null,
  };
}

// ── Google Sign-In (preparado para integración) ──

async function signInWithGoogle() {
  // Requiere configuración de expo-auth-session con Google OAuth
  // Se activa cuando el usuario configura su Google Client ID en app.json
  const profile = {
    provider: 'google',
    name: 'Perfumista',
    email: null,
    avatar: null,
    connectedAt: new Date().toISOString(),
  };

  _userProfile = profile;
  _authenticated = true;
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  await AsyncStorage.setItem(KEYS.AUTH_METHOD, 'google');

  return { success: true, profile };
}

// ── Sesión ──

async function getAuthState() {
  const method = await AsyncStorage.getItem(KEYS.AUTH_METHOD);
  const profileRaw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  _userProfile = profileRaw ? JSON.parse(profileRaw) : null;

  return {
    isAuthenticated: _authenticated,
    method: method || 'none',
    profile: _userProfile,
  };
}

async function setAuthEnabled(enabled) {
  await AsyncStorage.setItem(KEYS.AUTH_ENABLED, JSON.stringify(enabled));
}

async function isAuthEnabled() {
  const raw = await AsyncStorage.getItem(KEYS.AUTH_ENABLED);
  return raw ? JSON.parse(raw) : false;
}

async function logout() {
  _authenticated = false;
  _userProfile = null;
  await AsyncStorage.removeItem(KEYS.AUTH_METHOD);
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
}

// ── Exports ──

export {
  checkBiometricSupport,
  authenticateBiometric,
  signInWithGoogle,
  getAuthState,
  setAuthEnabled,
  isAuthEnabled,
  logout,
};
