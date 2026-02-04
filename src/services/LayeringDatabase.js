/**
 * ETHEREAL EDITION v7.0 - CAPA DE PERSISTENCIA
 * ===============================================
 * AsyncStorage estructurado para toda la data del motor de layering.
 *
 * Claves de almacenamiento:
 * - @ethereal/protocols     → Enciclopedia Magna (500 protocolos)
 * - @ethereal/inventory     → IDs de perfumes activos del usuario
 * - @ethereal/favorites     → IDs de protocolos favoritos
 * - @ethereal/usage_history → Historial de usos (para cálculo fiscal acumulado)
 * - @ethereal/savings       → Resumen de ahorro fiscal
 * - @ethereal/metadata      → Versión, fecha generación, stats
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { protocolToJSON, protocolFromJSON } from '../data/models';

const KEYS = {
  PROTOCOLS: '@ethereal/protocols',
  INVENTORY: '@ethereal/inventory',
  FAVORITES: '@ethereal/favorites',
  USAGE_HISTORY: '@ethereal/usage_history',
  SAVINGS: '@ethereal/savings',
  METADATA: '@ethereal/metadata',
};

// ── PROTOCOLOS ────────────────────────────────────────

/**
 * Guarda todos los protocolos en AsyncStorage.
 * Los protocolos se serializan a JSON plano.
 *
 * Para datasets grandes (500+), se fragmenta en chunks de 100
 * para evitar límites de tamaño de AsyncStorage.
 */
export async function saveProtocols(protocols) {
  const CHUNK_SIZE = 100;
  const chunks = [];

  for (let i = 0; i < protocols.length; i += CHUNK_SIZE) {
    chunks.push(protocols.slice(i, i + CHUNK_SIZE));
  }

  // Guardar cada chunk con clave indexada
  const pairs = chunks.map((chunk, idx) => [
    `${KEYS.PROTOCOLS}_chunk_${idx}`,
    JSON.stringify(chunk.map(p => protocolToJSON(p))),
  ]);

  // Guardar metadata de chunks
  pairs.push([
    `${KEYS.PROTOCOLS}_index`,
    JSON.stringify({ totalChunks: chunks.length, totalProtocols: protocols.length }),
  ]);

  await AsyncStorage.multiSet(pairs);
}

/**
 * Carga todos los protocolos desde AsyncStorage.
 * Reconstruye objetos completos desde JSON.
 * @returns {Array} Array de LayeringProtocol
 */
export async function loadProtocols() {
  const indexRaw = await AsyncStorage.getItem(`${KEYS.PROTOCOLS}_index`);
  if (!indexRaw) return [];

  const index = JSON.parse(indexRaw);
  const keys = [];

  for (let i = 0; i < index.totalChunks; i++) {
    keys.push(`${KEYS.PROTOCOLS}_chunk_${i}`);
  }

  const chunks = await AsyncStorage.multiGet(keys);
  const protocols = [];

  for (const [, value] of chunks) {
    if (!value) continue;
    const items = JSON.parse(value);
    for (const item of items) {
      try {
        protocols.push(protocolFromJSON(item));
      } catch (e) {
        // Protocolo corrupto, skip
        console.warn('Protocolo corrupto descartado:', e.message);
      }
    }
  }

  return protocols;
}

/**
 * Limpia todos los protocolos almacenados.
 */
export async function clearProtocols() {
  const indexRaw = await AsyncStorage.getItem(`${KEYS.PROTOCOLS}_index`);
  if (!indexRaw) return;

  const index = JSON.parse(indexRaw);
  const keys = [`${KEYS.PROTOCOLS}_index`];

  for (let i = 0; i < index.totalChunks; i++) {
    keys.push(`${KEYS.PROTOCOLS}_chunk_${i}`);
  }

  await AsyncStorage.multiRemove(keys);
}

// ── INVENTARIO DEL USUARIO ────────────────────────────

/**
 * Guarda los IDs de perfumes activos del usuario.
 * @param {string[]} perfumeIds
 */
export async function saveUserInventory(perfumeIds) {
  await AsyncStorage.setItem(KEYS.INVENTORY, JSON.stringify(perfumeIds));
}

/**
 * Carga los IDs de perfumes activos del usuario.
 * @returns {string[]}
 */
export async function loadUserInventory() {
  const raw = await AsyncStorage.getItem(KEYS.INVENTORY);
  if (!raw) return [];
  return JSON.parse(raw);
}

// ── FAVORITOS ─────────────────────────────────────────

/**
 * Guarda los IDs de protocolos marcados como favoritos.
 * @param {string[]} protocolIds
 */
export async function saveFavorites(protocolIds) {
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(protocolIds));
}

/**
 * Carga los IDs de protocolos favoritos.
 * @returns {string[]}
 */
export async function loadFavorites() {
  const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
  if (!raw) return [];
  return JSON.parse(raw);
}

/**
 * Añade un protocolo a favoritos.
 * @param {string} protocolId
 */
export async function addFavorite(protocolId) {
  const favs = await loadFavorites();
  if (!favs.includes(protocolId)) {
    favs.push(protocolId);
    await saveFavorites(favs);
  }
  return favs;
}

/**
 * Elimina un protocolo de favoritos.
 * @param {string} protocolId
 */
export async function removeFavorite(protocolId) {
  const favs = await loadFavorites();
  const filtered = favs.filter(id => id !== protocolId);
  await saveFavorites(filtered);
  return filtered;
}

// ── HISTORIAL DE USO ──────────────────────────────────

/**
 * Registra un uso de protocolo en el historial.
 * @param {{ protocoloId: string, analisisCoste: object }} entry
 */
export async function registerUsage(entry) {
  const history = await loadUsageHistory();
  history.push({
    fecha: new Date().toISOString(),
    protocoloId: entry.protocoloId,
    analisisCoste: {
      ahorroGenerado: entry.analisisCoste.ahorroGenerado,
      costeRealLayering: entry.analisisCoste.costeRealLayering,
      precioReferenteNiche: entry.analisisCoste.precioReferenteNiche,
    },
  });

  // Mantener máximo 1000 registros (rotar los más antiguos)
  const trimmed = history.length > 1000 ? history.slice(-1000) : history;
  await AsyncStorage.setItem(KEYS.USAGE_HISTORY, JSON.stringify(trimmed));
  return trimmed;
}

/**
 * Carga el historial de uso completo.
 * @returns {Array}
 */
export async function loadUsageHistory() {
  const raw = await AsyncStorage.getItem(KEYS.USAGE_HISTORY);
  if (!raw) return [];
  return JSON.parse(raw);
}

/**
 * Limpia el historial de uso.
 */
export async function clearUsageHistory() {
  await AsyncStorage.removeItem(KEYS.USAGE_HISTORY);
}

// ── RESUMEN DE AHORRO ─────────────────────────────────

/**
 * Guarda el resumen de ahorro fiscal.
 * @param {object} summary - SavingsSummary object
 */
export async function saveSavingsSummary(summary) {
  await AsyncStorage.setItem(KEYS.SAVINGS, JSON.stringify(summary));
}

/**
 * Carga el resumen de ahorro fiscal.
 * @returns {object|null}
 */
export async function loadSavingsSummary() {
  const raw = await AsyncStorage.getItem(KEYS.SAVINGS);
  if (!raw) return null;
  return JSON.parse(raw);
}

// ── METADATA ──────────────────────────────────────────

/**
 * Guarda metadata del sistema.
 */
export async function saveMetadata(metadata) {
  await AsyncStorage.setItem(KEYS.METADATA, JSON.stringify({
    ...metadata,
    ultimaActualizacion: new Date().toISOString(),
  }));
}

/**
 * Carga metadata del sistema.
 */
export async function loadMetadata() {
  const raw = await AsyncStorage.getItem(KEYS.METADATA);
  if (!raw) return null;
  return JSON.parse(raw);
}

// ── UTILIDADES ────────────────────────────────────────

/**
 * Calcula el espacio total usado por ETHEREAL en AsyncStorage.
 * @returns {{ totalBytes: number, totalKB: number, desglose: object }}
 */
export async function getStorageUsage() {
  const allKeys = await AsyncStorage.getAllKeys();
  const etherealKeys = allKeys.filter(k => k.startsWith('@ethereal/'));

  let totalBytes = 0;
  const desglose = {};

  for (const key of etherealKeys) {
    const value = await AsyncStorage.getItem(key);
    const bytes = value ? new Blob([value]).size : 0;
    totalBytes += bytes;

    // Agrupar por categoría
    const category = key.replace(/_chunk_\d+$/, '').replace(/_index$/, '');
    desglose[category] = (desglose[category] || 0) + bytes;
  }

  return {
    totalBytes,
    totalKB: Math.round(totalBytes / 1024 * 100) / 100,
    desglose,
  };
}

/**
 * Exporta toda la data de ETHEREAL como un objeto JSON.
 * Útil para backup / migración.
 */
export async function exportAllData() {
  const [protocols, inventory, favorites, history, savings, metadata] = await Promise.all([
    loadProtocols(),
    loadUserInventory(),
    loadFavorites(),
    loadUsageHistory(),
    loadSavingsSummary(),
    loadMetadata(),
  ]);

  return {
    version: '7.0.0',
    exportDate: new Date().toISOString(),
    protocols: protocols.map(p => protocolToJSON(p)),
    inventory,
    favorites,
    usageHistory: history,
    savingsSummary: savings,
    metadata,
  };
}

/**
 * Importa data de un backup JSON.
 * @param {object} data - Objeto exportado por exportAllData()
 */
export async function importAllData(data) {
  if (!data || !data.version) {
    throw new Error('Formato de importación inválido');
  }

  const protocols = (data.protocols || []).map(p => protocolFromJSON(p));

  await Promise.all([
    saveProtocols(protocols),
    saveUserInventory(data.inventory || []),
    saveFavorites(data.favorites || []),
    AsyncStorage.setItem(KEYS.USAGE_HISTORY, JSON.stringify(data.usageHistory || [])),
    data.savingsSummary ? saveSavingsSummary(data.savingsSummary) : Promise.resolve(),
    saveMetadata({ ...data.metadata, importedFrom: data.version }),
  ]);
}

/**
 * Limpia toda la data de ETHEREAL.
 * Operación destructiva. Usar con precaución.
 */
export async function clearAllData() {
  const allKeys = await AsyncStorage.getAllKeys();
  const etherealKeys = allKeys.filter(k => k.startsWith('@ethereal/'));
  if (etherealKeys.length > 0) {
    await AsyncStorage.multiRemove(etherealKeys);
  }
}
