/**
 * ETHEREAL EDITION v7.0 - ETHEREAL ENGINE (Integrador Principal)
 * ================================================================
 * Fachada principal que expone toda la funcionalidad del motor
 * de layering como una API unificada.
 *
 * Este módulo es el punto de entrada para cualquier componente
 * que necesite interactuar con el motor sin usar React Context.
 *
 * Conexión Total: Coordina InventoryManager, LayeringAlgorithm,
 * FiscalCalculator, Repository y Database.
 */

import * as Repository from '../services/LayeringRepository';
import * as InventoryManager from '../services/InventoryManager';
import * as FiscalCalculator from './FiscalCalculator';
import { PERFUME_INVENTORY, getPerfumeById, getCollectionValue } from '../data/perfumeInventory';
import { NICHE_REFERENCES, findBestNicheMatches, getAverageNichePrice } from '../data/nicheReferences';
import { OlfactoryFamily, ProtocolTier } from '../data/models';

// ══════════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════════

let _engineReady = false;

/**
 * Inicializa el motor completo de ETHEREAL.
 * Debe llamarse una sola vez al arrancar la app.
 *
 * @param {object} options
 * @param {boolean} options.forceRegenerate - Regenera los 500 protocolos
 * @returns {object} Estado de inicialización
 */
export async function boot(options = {}) {
  const { forceRegenerate = false } = options;

  const result = await Repository.initialize(forceRegenerate);
  _engineReady = true;

  return {
    ready: true,
    isFirstRun: result.isFirstRun,
    protocolCount: result.protocolCount,
    inventoryCount: result.inventoryCount,
    collectionValue: getCollectionValue(),
    nicheReferencesCount: NICHE_REFERENCES.length,
    averageNichePrice: getAverageNichePrice(),
  };
}

/**
 * Verifica si el motor está listo.
 */
export function isReady() {
  return _engineReady;
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - PROTOCOLOS
// ══════════════════════════════════════════════════════

/**
 * Obtiene todos los protocolos.
 */
export async function getProtocols(filtros = {}) {
  return Repository.searchProtocols(filtros);
}

/**
 * Obtiene protocolos paginados.
 */
export async function getProtocolsPage(page, pageSize, filtros) {
  return Repository.getProtocolsPaginated(page, pageSize, filtros);
}

/**
 * Obtiene un protocolo por ID con toda su información enriquecida.
 * Incluye los perfumes completos (no solo IDs) y el referente nicho.
 */
export async function getProtocolDetail(protocolId) {
  const protocol = await Repository.getProtocolById(protocolId);
  if (!protocol) return null;

  const perfumes = protocol.activosReales.map(id => getPerfumeById(id)).filter(Boolean);
  const nicheRef = NICHE_REFERENCES.find(n => n.id === protocol.analisisCoste.referenteNicheId);
  const isFavorite = await Repository.isFavorite(protocolId);

  return {
    protocol,
    perfumes,
    nicheReference: nicheRef || null,
    isFavorite,
    resumenRapido: {
      nombre: protocol.nombreOperacion,
      categoria: protocol.categoria,
      tier: protocol.compatibilidadQuimica.tier,
      compatibilidad: protocol.compatibilidadQuimica.porcentajeParentesco,
      ahorro: protocol.analisisCoste.ahorroGenerado,
      coste: protocol.analisisCoste.costeRealLayering,
      nicheEmulado: nicheRef ? `${nicheRef.casa} ${nicheRef.nombre}` : 'N/A',
      precioNiche: nicheRef ? nicheRef.precioRetail : 0,
      longevidad: protocol.factorTiempo.longevidadEstimada,
      numPerfumes: perfumes.length,
    },
  };
}

/**
 * Obtiene protocolos recomendados basados en el inventario actual.
 * Devuelve los top N por score compuesto.
 */
export async function getRecommendedProtocols(topN = 10) {
  return Repository.searchProtocols({
    soloActivos: true,
    ordenarPor: 'compatibilidad',
  }).then(protocols => protocols.slice(0, topN));
}

/**
 * Obtiene protocolos que generan el mayor ahorro fiscal.
 */
export async function getMostProfitableProtocols(topN = 10) {
  return Repository.searchProtocols({
    soloActivos: true,
    ordenarPor: 'ahorro',
  }).then(protocols => protocols.slice(0, topN));
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - INVENTARIO
// ══════════════════════════════════════════════════════

/**
 * Obtiene el inventario completo enriquecido.
 */
export async function getInventory() {
  return InventoryManager.getFullInventory();
}

/**
 * Añade perfume al inventario. Sincroniza protocolos automáticamente.
 */
export async function addPerfume(perfumeId) {
  return InventoryManager.addPerfume(perfumeId);
}

/**
 * Elimina perfume del inventario. Desactiva protocolos automáticamente.
 */
export async function removePerfume(perfumeId) {
  return InventoryManager.removePerfume(perfumeId);
}

/**
 * Obtiene sugerencias de perfumes a comprar.
 */
export async function getSuggestions(topN = 5) {
  return InventoryManager.suggestPerfumesToBuy(topN);
}

/**
 * Obtiene resumen del inventario.
 */
export async function getInventorySummary() {
  return InventoryManager.getInventorySummary();
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - FISCAL
// ══════════════════════════════════════════════════════

/**
 * Registra el uso de un protocolo y actualiza el ahorro.
 */
export async function useProtocol(protocolId) {
  return Repository.registerProtocolUsage(protocolId);
}

/**
 * Obtiene el resumen de ahorro acumulado.
 */
export async function getSavings() {
  return Repository.getSavingsSummary();
}

/**
 * Obtiene el informe financiero completo.
 */
export async function getFinancialReport() {
  return Repository.getFinancialReport();
}

/**
 * Calcula el ahorro rápido para un protocolo específico.
 */
export function quickSavingsCalc(precioNiche, aplicaciones) {
  return FiscalCalculator.calcularAhorroRapido(precioNiche, aplicaciones);
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - FAVORITOS
// ══════════════════════════════════════════════════════

/**
 * Alterna favorito.
 */
export async function toggleFavorite(protocolId) {
  return Repository.toggleFavorite(protocolId);
}

/**
 * Obtiene protocolos favoritos.
 */
export async function getFavorites() {
  return Repository.getFavoriteProtocols();
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - ESTADÍSTICAS
// ══════════════════════════════════════════════════════

/**
 * Obtiene estadísticas generales del sistema.
 */
export async function getStats() {
  return Repository.getStats();
}

/**
 * Dashboard completo: combina stats, inventario, fiscal y protocolos top.
 */
export async function getDashboard() {
  const [stats, inventorySummary, savings, topProtocols, topProfitable] = await Promise.all([
    Repository.getStats(),
    InventoryManager.getInventorySummary(),
    Repository.getSavingsSummary(),
    getRecommendedProtocols(5),
    getMostProfitableProtocols(5),
  ]);

  return {
    stats,
    inventorySummary,
    savings,
    topProtocols: topProtocols.map(p => ({
      id: p.id,
      nombre: p.nombreOperacion,
      tier: p.compatibilidadQuimica.tier,
      compatibilidad: p.compatibilidadQuimica.porcentajeParentesco,
      ahorro: p.analisisCoste.ahorroGenerado,
    })),
    topProfitable: topProfitable.map(p => ({
      id: p.id,
      nombre: p.nombreOperacion,
      ahorro: p.analisisCoste.ahorroGenerado,
      coste: p.analisisCoste.costeRealLayering,
      nicheEmulado: p.analisisCoste.referenteNicheId,
    })),
  };
}

// ══════════════════════════════════════════════════════
// API UNIFICADA - SISTEMA
// ══════════════════════════════════════════════════════

/**
 * Resetea todo el sistema y regenera protocolos.
 */
export async function reset() {
  const result = await Repository.resetAll();
  _engineReady = true;
  return result;
}

/**
 * Exporta toda la data para backup.
 */
export async function exportAll() {
  return Repository.exportData();
}

/**
 * Importa data desde backup.
 */
export async function importAll(data) {
  const result = await Repository.importData(data);
  _engineReady = true;
  return result;
}

// ══════════════════════════════════════════════════════
// CONSTANTES EXPORTADAS
// ══════════════════════════════════════════════════════

export { OlfactoryFamily, ProtocolTier };
export { PERFUME_INVENTORY } from '../data/perfumeInventory';
export { NICHE_REFERENCES } from '../data/nicheReferences';
