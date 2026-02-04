/**
 * ETHEREAL v8.0 OMNI — OCR SERVICE
 * ====================================
 * Escáner de etiquetas y códigos de lotes de perfumería.
 * Usa expo-image-picker para capturar imagen + análisis local.
 *
 * CAPA: TOOLS v3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SCAN_HISTORY: '@ethereal/scan_history',
};

// ── Patrones conocidos de lotes de perfumería ──

const BATCH_PATTERNS = {
  // Formato: casa → regex para detectar, parser para extraer info
  chanel: {
    pattern: /^(\d{4})([A-Z])$/,
    parse: (match) => ({
      casa: 'Chanel',
      year: 2000 + parseInt(match[1].substring(0, 2)),
      month: parseInt(match[1].substring(2, 4)),
      line: match[2],
    }),
  },
  dior: {
    pattern: /^(\d)([A-Z])(\d{2})$/,
    parse: (match) => ({
      casa: 'Dior',
      year: 2020 + parseInt(match[1]),
      month: match[2].charCodeAt(0) - 64,
      batch: match[3],
    }),
  },
  generic: {
    pattern: /^([A-Z0-9]{4,12})$/,
    parse: (match) => ({
      casa: 'Genérico',
      code: match[1],
      note: 'Código detectado pero no se pudo decodificar la casa específica.',
    }),
  },
};

// ── Captura de imagen ──

async function captureImage(useCamera = true) {
  let ImagePicker;
  try {
    ImagePicker = require('expo-image-picker');
  } catch (e) {
    return { success: false, error: 'expo-image-picker no disponible' };
  }

  const permResult = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permResult.status !== 'granted') {
    return { success: false, error: 'Permiso de cámara denegado' };
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.8,
        allowsEditing: true,
      });

  if (result.canceled) {
    return { success: false, error: 'Captura cancelada' };
  }

  return {
    success: true,
    uri: result.assets[0].uri,
    width: result.assets[0].width,
    height: result.assets[0].height,
  };
}

// ── Análisis de texto (simulado sin MLKit/Google Vision) ──

function parseOCRText(rawText) {
  const cleaned = rawText.trim().toUpperCase().replace(/\s+/g, '');

  for (const [brand, config] of Object.entries(BATCH_PATTERNS)) {
    const match = cleaned.match(config.pattern);
    if (match) {
      const info = config.parse(match);
      return {
        detected: true,
        rawText: cleaned,
        brand,
        info,
      };
    }
  }

  return {
    detected: false,
    rawText: cleaned,
    info: { note: 'No se pudo reconocer el formato del código.' },
  };
}

// ── Análisis manual (el usuario introduce el código) ──

function analyzeBatchCode(code) {
  return parseOCRText(code);
}

// ── Historial de escaneos ──

async function saveScanResult(result) {
  const history = await loadScanHistory();
  history.unshift({
    ...result,
    scannedAt: new Date().toISOString(),
  });

  // Mantener máximo 50 escaneos
  const trimmed = history.slice(0, 50);
  await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(trimmed));
  return trimmed;
}

async function loadScanHistory() {
  const raw = await AsyncStorage.getItem(KEYS.SCAN_HISTORY);
  return raw ? JSON.parse(raw) : [];
}

async function clearScanHistory() {
  await AsyncStorage.removeItem(KEYS.SCAN_HISTORY);
}

export {
  captureImage,
  parseOCRText,
  analyzeBatchCode,
  saveScanResult,
  loadScanHistory,
  clearScanHistory,
};
