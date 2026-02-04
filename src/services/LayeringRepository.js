/**
 * ETHEREAL EDITION v7.0 - LAYERING REPOSITORY
 * ==============================================
 * Patrón Repository: capa intermedia entre la base de datos (AsyncStorage)
 * y los ViewModels/Context.
 *
 * Centraliza TODA la lógica de acceso a datos.
 * Incluye cache en memoria para rendimiento óptimo.
 *
 * Conexión Total: Cada operación sobre el inventario o los protocolos
 * dispara la sincronización automática.
 */

import * as DB from './LayeringDatabase';
import { PERFUME_INVENTORY, PERFUME_MAP, getPerfumeById } from '../data/perfumeInventory';
import { generarEnciclopediaMagna, sincronizarConInventario, buscarProtocolos } from '../engine/LayeringAlgorithm';
import { generarResumenAhorro, generarInformeFinanciero } from '../engine/FiscalCalculator';
import { protocolToJSON, protocolFromJSON, createLayeringProtocol } from '../data/models';

// ── CACHE EN MEMORIA ──────────────────────────────────

let _protocolCache = null;
let _inventoryCache = null;
let _favoritesCache = null;
let _initialized = false;

/**
 * Invalida la cache. Fuerza recarga desde AsyncStorage en la próxima lectura.
 */
function invalidateCache() {
  _protocolCache = null;
  _inventoryCache = null;
  _favoritesCache = null;
}

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════

/**
 * Inicializa el repository.
 * - Si es la primera vez, genera la Enciclopedia Magna (500 protocolos).
 * - Si ya existe data, la carga desde AsyncStorage.
 *
 * @param {boolean} forceRegenerate - Fuerza regeneración de protocolos
 * @returns {{ protocolCount: number, inventoryCount: number, isFirstRun: boolean }}
 */
export async function initialize(forceRegenerate = false) {
  const metadata = await DB.loadMetadata();
  const isFirstRun = !metadata || forceRegenerate;

  if (isFirstRun) {
    // Primera ejecución: cargar inventario completo y generar protocolos
    const allPerfumeIds = PERFUME_INVENTORY.map(p => p.id);
    await DB.saveUserInventory(allPerfumeIds);

    // Generar la Enciclopedia Magna
    const protocols = generarEnciclopediaMagna(PERFUME_INVENTORY, 500);
    await DB.saveProtocols(protocols);

    await DB.saveMetadata({
      version: '7.0.0',
      fechaGeneracion: new Date().toISOString(),
      totalProtocolos: protocols.length,
      totalPerfumes: allPerfumeIds.length,
    });

    _protocolCache = protocols;
    _inventoryCache = allPerfumeIds;
    _favoritesCache = [];
    _initialized = true;

    return {
      protocolCount: protocols.length,
      inventoryCount: allPerfumeIds.length,
      isFirstRun: true,
    };
  }

  // Carga normal desde storage
  const [protocols, inventory, favorites] = await Promise.all([
    DB.loadProtocols(),
    DB.loadUserInventory(),
    DB.loadFavorites(),
  ]);

  _protocolCache = protocols;
  _inventoryCache = inventory;
  _favoritesCache = favorites;
  _initialized = true;

  return {
    protocolCount: protocols.length,
    inventoryCount: inventory.length,
    isFirstRun: false,
  };
}

/**
 * Verifica si el repository está inicializado.
 */
export function isInitialized() {
  return _initialized;
}

// ══════════════════════════════════════════════════════
// PROTOCOLOS
// ══════════════════════════════════════════════════════

/**
 * Obtiene todos los protocolos (desde cache o storage).
 * @returns {Array}
 */
export async function getAllProtocols() {
  if (_protocolCache) return _protocolCache;
  _protocolCache = await DB.loadProtocols();
  return _protocolCache;
}

/**
 * Obtiene un protocolo por ID.
 * @param {string} protocolId
 * @returns {object|null}
 */
export async function getProtocolById(protocolId) {
  const protocols = await getAllProtocols();
  return protocols.find(p => p.id === protocolId) || null;
}

/**
 * Busca protocolos con filtros.
 * @param {object} filtros - Ver buscarProtocolos() en LayeringAlgorithm
 * @returns {Array}
 */
export async function searchProtocols(filtros) {
  const protocols = await getAllProtocols();
  return buscarProtocolos(protocols, filtros);
}

/**
 * Obtiene protocolos paginados.
 * @param {number} page - Página (1-indexed)
 * @param {number} pageSize - Tamaño de página
 * @param {object} filtros - Filtros opcionales
 * @returns {{ data: Array, total: number, page: number, totalPages: number }}
 */
export async function getProtocolsPaginated(page = 1, pageSize = 20, filtros = {}) {
  const all = await searchProtocols(filtros);
  const start = (page - 1) * pageSize;
  const data = all.slice(start, start + pageSize);

  return {
    data,
    total: all.length,
    page,
    totalPages: Math.ceil(all.length / pageSize),
  };
}

// ══════════════════════════════════════════════════════
// FAVORITOS
// ══════════════════════════════════════════════════════

/**
 * Obtiene la lista de IDs favoritos.
 * @returns {string[]}
 */
export async function getFavorites() {
  if (_favoritesCache) return _favoritesCache;
  _favoritesCache = await DB.loadFavorites();
  return _favoritesCache;
}

/**
 * Verifica si un protocolo es favorito.
 * @param {string} protocolId
 * @returns {boolean}
 */
export async function isFavorite(protocolId) {
  const favs = await getFavorites();
  return favs.includes(protocolId);
}

/**
 * Alterna el estado de favorito de un protocolo.
 * @param {string} protocolId
 * @returns {boolean} Nuevo estado (true = favorito)
 */
export async function toggleFavorite(protocolId) {
  const favs = await getFavorites();
  const isFav = favs.includes(protocolId);

  if (isFav) {
    _favoritesCache = await DB.removeFavorite(protocolId);
  } else {
    _favoritesCache = await DB.addFavorite(protocolId);
  }

  return !isFav;
}

/**
 * Obtiene los protocolos favoritos completos.
 * @returns {Array}
 */
export async function getFavoriteProtocols() {
  const [protocols, favIds] = await Promise.all([
    getAllProtocols(),
    getFavorites(),
  ]);

  const favSet = new Set(favIds);
  return protocols.filter(p => favSet.has(p.id));
}

// ══════════════════════════════════════════════════════
// INVENTARIO DEL USUARIO
// ══════════════════════════════════════════════════════

/**
 * Obtiene los IDs de perfumes en el inventario del usuario.
 * @returns {string[]}
 */
export async function getUserInventory() {
  if (_inventoryCache) return _inventoryCache;
  _inventoryCache = await DB.loadUserInventory();
  return _inventoryCache;
}

/**
 * Obtiene los objetos Perfume completos del inventario del usuario.
 * @returns {Array}
 */
export async function getUserPerfumes() {
  const ids = await getUserInventory();
  return ids.map(id => getPerfumeById(id)).filter(Boolean);
}

/**
 * Añade un perfume al inventario del usuario.
 * Dispara sincronización de protocolos.
 *
 * @param {string} perfumeId
 * @returns {{ added: boolean, newProtocols: number }}
 */
export async function addPerfumeToInventory(perfumeId) {
  const perfume = getPerfumeById(perfumeId);
  if (!perfume) {
    throw new Error(`Perfume no encontrado: ${perfumeId}`);
  }

  const inventory = await getUserInventory();
  if (inventory.includes(perfumeId)) {
    return { added: false, newProtocols: 0 };
  }

  inventory.push(perfumeId);
  await DB.saveUserInventory(inventory);
  _inventoryCache = inventory;

  // Sincronizar protocolos
  const result = await syncProtocolsWithInventory();

  return { added: true, newProtocols: result.nuevosGenerados };
}

/**
 * Elimina un perfume del inventario del usuario.
 * Desactiva automáticamente los protocolos que lo usen.
 *
 * @param {string} perfumeId
 * @returns {{ removed: boolean, protocolsDeactivated: number }}
 */
export async function removePerfumeFromInventory(perfumeId) {
  const inventory = await getUserInventory();
  const idx = inventory.indexOf(perfumeId);
  if (idx === -1) {
    return { removed: false, protocolsDeactivated: 0 };
  }

  inventory.splice(idx, 1);
  await DB.saveUserInventory(inventory);
  _inventoryCache = inventory;

  // Sincronizar protocolos: desactivar los que usen este perfume
  const result = await syncProtocolsWithInventory();

  return {
    removed: true,
    protocolsDeactivated: result.protocolosDesactivados,
  };
}

/**
 * Sincroniza protocolos con el inventario actual.
 * - Desactiva protocolos cuyos perfumes ya no están disponibles.
 * - Genera nuevos protocolos para llenar huecos.
 *
 * @returns {{ protocolosActivos: number, protocolosDesactivados: number, nuevosGenerados: number }}
 */
async function syncProtocolsWithInventory() {
  const protocols = await getAllProtocols();
  const inventory = await getUserInventory();

  const { activos, desactivados, nuevos } = sincronizarConInventario(protocols, inventory);

  // Combinar activos + desactivados (preservados) + nuevos
  const allProtocols = [...activos, ...nuevos];

  await DB.saveProtocols(allProtocols);
  _protocolCache = allProtocols;

  await DB.saveMetadata({
    version: '7.0.0',
    fechaUltimaSincronizacion: new Date().toISOString(),
    totalProtocolos: allProtocols.length,
    totalPerfumes: inventory.length,
    protocolosDesactivados: desactivados.length,
  });

  return {
    protocolosActivos: activos.length,
    protocolosDesactivados: desactivados.length,
    nuevosGenerados: nuevos.length,
  };
}

// ══════════════════════════════════════════════════════
// REGISTRO DE USO & AHORRO FISCAL
// ══════════════════════════════════════════════════════

/**
 * Registra que el usuario ha "usado" un protocolo.
 * Incrementa el contador de uso y registra en el historial fiscal.
 *
 * @param {string} protocolId
 * @returns {{ ahorro: number, totalAhorrado: number }}
 */
export async function registerProtocolUsage(protocolId) {
  const protocol = await getProtocolById(protocolId);
  if (!protocol) {
    throw new Error(`Protocolo no encontrado: ${protocolId}`);
  }

  // Registrar en historial
  await DB.registerUsage({
    protocoloId: protocolId,
    analisisCoste: protocol.analisisCoste,
  });

  // Recalcular resumen de ahorro
  const history = await DB.loadUsageHistory();
  const summary = generarResumenAhorro(history);
  await DB.saveSavingsSummary(summary);

  return {
    ahorro: protocol.analisisCoste.ahorroGenerado,
    totalAhorrado: summary.totalAhorrado,
  };
}

/**
 * Obtiene el resumen de ahorro fiscal actual.
 * @returns {object} SavingsSummary
 */
export async function getSavingsSummary() {
  const cached = await DB.loadSavingsSummary();
  if (cached) return cached;

  // Recalcular si no existe cache
  const history = await DB.loadUsageHistory();
  const summary = generarResumenAhorro(history);
  await DB.saveSavingsSummary(summary);
  return summary;
}

/**
 * Obtiene el informe financiero completo.
 * @returns {object}
 */
export async function getFinancialReport() {
  const [protocols, history] = await Promise.all([
    getAllProtocols(),
    DB.loadUsageHistory(),
  ]);

  return generarInformeFinanciero(protocols, history);
}

/**
 * Obtiene el historial de uso completo.
 * @returns {Array}
 */
export async function getUsageHistory() {
  return DB.loadUsageHistory();
}

// ══════════════════════════════════════════════════════
// ESTADÍSTICAS
// ══════════════════════════════════════════════════════

/**
 * Obtiene estadísticas generales del sistema.
 */
export async function getStats() {
  const [protocols, inventory, favorites, history, storage] = await Promise.all([
    getAllProtocols(),
    getUserInventory(),
    getFavorites(),
    DB.loadUsageHistory(),
    DB.getStorageUsage(),
  ]);

  const activos = protocols.filter(p => p.activo);
  const alphas = activos.filter(p => p.compatibilidadQuimica.tier === 'Alpha');
  const betas = activos.filter(p => p.compatibilidadQuimica.tier === 'Beta');
  const gammas = activos.filter(p => p.compatibilidadQuimica.tier === 'Gamma');
  const deltas = activos.filter(p => p.compatibilidadQuimica.tier === 'Delta');

  const ahorroTotal = activos.reduce((sum, p) => sum + p.analisisCoste.ahorroGenerado, 0);
  const compatMedia = activos.length > 0
    ? activos.reduce((sum, p) => sum + p.compatibilidadQuimica.porcentajeParentesco, 0) / activos.length
    : 0;

  return {
    protocolos: {
      total: protocols.length,
      activos: activos.length,
      alpha: alphas.length,
      beta: betas.length,
      gamma: gammas.length,
      delta: deltas.length,
    },
    inventario: {
      totalPerfumes: inventory.length,
      valorColeccion: inventory.reduce((sum, id) => {
        const p = getPerfumeById(id);
        return sum + (p ? p.precioRetail : 0);
      }, 0),
    },
    favoritos: favorites.length,
    uso: {
      totalUsos: history.length,
    },
    fiscal: {
      ahorroMaximoPosible: Math.round(ahorroTotal * 100) / 100,
      compatibilidadMedia: Math.round(compatMedia * 10) / 10,
    },
    storage,
  };
}

// ══════════════════════════════════════════════════════
// BACKUP / RESET
// ══════════════════════════════════════════════════════

/**
 * Exporta toda la data para backup.
 */
export async function exportData() {
  return DB.exportAllData();
}

/**
 * Importa data desde un backup.
 */
export async function importData(data) {
  await DB.importAllData(data);
  invalidateCache();
  _initialized = false;
  return initialize();
}

/**
 * Resetea todo el sistema. Borra toda la data y regenera la Enciclopedia.
 */
export async function resetAll() {
  await DB.clearAllData();
  invalidateCache();
  _initialized = false;
  return initialize(true);
}
