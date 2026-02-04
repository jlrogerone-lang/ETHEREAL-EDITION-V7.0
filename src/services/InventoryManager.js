/**
 * ETHEREAL EDITION v7.0 - INVENTORY MANAGER
 * ============================================
 * Gestor inteligente del inventario de perfumes del usuario.
 *
 * CONEXIÓN TOTAL:
 * - Si el usuario borra un perfume, los layerings que lo usen se desactivan.
 * - Si el usuario añade un perfume, se generan nuevos layerings posibles.
 * - Todo cambio se persiste automáticamente.
 */

import * as Repository from './LayeringRepository';
import { PERFUME_INVENTORY, getPerfumeById } from '../data/perfumeInventory';
import { OlfactoryFamily } from '../data/models';

// ══════════════════════════════════════════════════════
// OPERACIONES CRUD DE INVENTARIO
// ══════════════════════════════════════════════════════

/**
 * Obtiene el inventario completo del usuario con objetos Perfume enriquecidos.
 * @returns {Array<object>} Perfumes con metadata adicional
 */
export async function getFullInventory() {
  const ids = await Repository.getUserInventory();
  const protocols = await Repository.getAllProtocols();

  return ids.map(id => {
    const perfume = getPerfumeById(id);
    if (!perfume) return null;

    // Contar en cuántos protocolos activos participa
    const protocolosActivos = protocols.filter(p =>
      p.activo && p.activosReales.includes(id)
    ).length;

    // Valor fiscal: suma de ahorro de todos los protocolos donde participa
    const valorFiscal = protocols
      .filter(p => p.activo && p.activosReales.includes(id))
      .reduce((sum, p) => sum + p.analisisCoste.ahorroGenerado, 0);

    return {
      ...perfume,
      enInventario: true,
      protocolosActivos,
      valorFiscal: Math.round(valorFiscal * 100) / 100,
    };
  }).filter(Boolean);
}

/**
 * Obtiene perfumes del catálogo que NO están en el inventario del usuario.
 * Útil para la pantalla de "Añadir perfume".
 * @returns {Array}
 */
export async function getAvailablePerfumes() {
  const inventoryIds = new Set(await Repository.getUserInventory());

  return PERFUME_INVENTORY
    .filter(p => !inventoryIds.has(p.id))
    .map(p => ({
      ...p,
      enInventario: false,
      protocolosActivos: 0,
      valorFiscal: 0,
    }));
}

/**
 * Añade un perfume al inventario.
 * Dispara generación automática de nuevos protocolos.
 *
 * @param {string} perfumeId
 * @returns {{ success: boolean, perfume: object|null, newProtocols: number, message: string }}
 */
export async function addPerfume(perfumeId) {
  const perfume = getPerfumeById(perfumeId);
  if (!perfume) {
    return {
      success: false,
      perfume: null,
      newProtocols: 0,
      message: `Perfume no encontrado en el catálogo: ${perfumeId}`,
    };
  }

  const result = await Repository.addPerfumeToInventory(perfumeId);

  if (!result.added) {
    return {
      success: false,
      perfume,
      newProtocols: 0,
      message: `${perfume.nombre} ya está en tu inventario`,
    };
  }

  return {
    success: true,
    perfume,
    newProtocols: result.newProtocols,
    message: `${perfume.casa} ${perfume.nombre} añadido. ${result.newProtocols} nuevos protocolos generados.`,
  };
}

/**
 * Elimina un perfume del inventario.
 * Desactiva automáticamente todos los protocolos que lo usen.
 *
 * @param {string} perfumeId
 * @returns {{ success: boolean, perfume: object|null, protocolsDeactivated: number, message: string }}
 */
export async function removePerfume(perfumeId) {
  const perfume = getPerfumeById(perfumeId);
  if (!perfume) {
    return {
      success: false,
      perfume: null,
      protocolsDeactivated: 0,
      message: `Perfume no encontrado: ${perfumeId}`,
    };
  }

  const result = await Repository.removePerfumeFromInventory(perfumeId);

  if (!result.removed) {
    return {
      success: false,
      perfume,
      protocolsDeactivated: 0,
      message: `${perfume.nombre} no está en tu inventario`,
    };
  }

  return {
    success: true,
    perfume,
    protocolsDeactivated: result.protocolsDeactivated,
    message: result.protocolsDeactivated > 0
      ? `${perfume.casa} ${perfume.nombre} eliminado. ${result.protocolsDeactivated} protocolos desactivados.`
      : `${perfume.casa} ${perfume.nombre} eliminado del inventario.`,
  };
}

/**
 * Operación batch: añade múltiples perfumes.
 * @param {string[]} perfumeIds
 * @returns {{ added: number, skipped: number, newProtocols: number }}
 */
export async function addMultiplePerfumes(perfumeIds) {
  let added = 0;
  let skipped = 0;
  let totalNewProtocols = 0;

  for (const id of perfumeIds) {
    const result = await addPerfume(id);
    if (result.success) {
      added++;
      totalNewProtocols += result.newProtocols;
    } else {
      skipped++;
    }
  }

  return { added, skipped, newProtocols: totalNewProtocols };
}

/**
 * Carga el inventario completo del catálogo (53 perfumes).
 * Útil para reset o primera configuración.
 * @returns {{ added: number, totalProtocols: number }}
 */
export async function loadFullCatalog() {
  const allIds = PERFUME_INVENTORY.map(p => p.id);
  const result = await addMultiplePerfumes(allIds);
  const protocols = await Repository.getAllProtocols();

  return {
    added: result.added,
    totalProtocols: protocols.length,
  };
}

// ══════════════════════════════════════════════════════
// CONSULTAS INTELIGENTES
// ══════════════════════════════════════════════════════

/**
 * Obtiene el inventario agrupado por familia olfativa.
 * @returns {object} Map de OlfactoryFamily → Array<Perfume>
 */
export async function getInventoryByFamily() {
  const inventory = await getFullInventory();
  const grouped = {};

  for (const familia of Object.values(OlfactoryFamily)) {
    const perfumes = inventory.filter(p => p.familia === familia);
    if (perfumes.length > 0) {
      grouped[familia] = perfumes;
    }
  }

  return grouped;
}

/**
 * Obtiene el inventario agrupado por casa/marca.
 * @returns {object} Map de casa → Array<Perfume>
 */
export async function getInventoryByHouse() {
  const inventory = await getFullInventory();
  const grouped = {};

  for (const perfume of inventory) {
    if (!grouped[perfume.casa]) {
      grouped[perfume.casa] = [];
    }
    grouped[perfume.casa].push(perfume);
  }

  return grouped;
}

/**
 * Obtiene los perfumes "más valiosos" del inventario.
 * Ordenados por el ahorro fiscal que generan a través de protocolos.
 * @param {number} topN
 * @returns {Array}
 */
export async function getTopValuePerfumes(topN = 10) {
  const inventory = await getFullInventory();

  return [...inventory]
    .sort((a, b) => b.valorFiscal - a.valorFiscal)
    .slice(0, topN);
}

/**
 * Obtiene perfumes que NO participan en ningún protocolo activo.
 * Pueden ser candidatos para eliminar del inventario o sugieren
 * que se necesitan más perfumes complementarios.
 * @returns {Array}
 */
export async function getUnusedPerfumes() {
  const inventory = await getFullInventory();
  return inventory.filter(p => p.protocolosActivos === 0);
}

/**
 * Sugiere perfumes del catálogo que el usuario debería comprar
 * para desbloquear más protocolos de alta calidad.
 *
 * Analiza qué familias olfativas están sub-representadas
 * y qué perfumes añadirían más valor fiscal.
 *
 * @param {number} topN
 * @returns {Array<{ perfume: object, potencialFiscal: number, razon: string }>}
 */
export async function suggestPerfumesToBuy(topN = 5) {
  const inventoryIds = new Set(await Repository.getUserInventory());
  const inventoryPerfumes = [...inventoryIds].map(id => getPerfumeById(id)).filter(Boolean);

  // Contar familias actuales
  const familyCount = {};
  for (const p of inventoryPerfumes) {
    familyCount[p.familia] = (familyCount[p.familia] || 0) + 1;
  }

  // Perfumes no en inventario
  const candidates = PERFUME_INVENTORY.filter(p => !inventoryIds.has(p.id));

  const suggestions = candidates.map(perfume => {
    let potencial = 0;
    let razon = '';

    // Familia sub-representada = más potencial
    const familyPresence = familyCount[perfume.familia] || 0;
    if (familyPresence === 0) {
      potencial += 50;
      razon = `Familia ${perfume.familia} no representada en tu inventario`;
    } else if (familyPresence <= 2) {
      potencial += 30;
      razon = `Reforzaría la familia ${perfume.familia} (solo ${familyPresence} perfume/s)`;
    } else {
      potencial += 10;
      razon = `Ampliaría opciones de ${perfume.familia}`;
    }

    // EDP/Parfum = más versatilidad
    if (perfume.concentracion === 'EDP' || perfume.concentracion === 'Parfum') {
      potencial += 15;
    }

    // Bajo coste por atomización = más ahorro fiscal
    if (perfume.costeAtomizacion < 0.1) {
      potencial += 20;
    } else if (perfume.costeAtomizacion < 0.15) {
      potencial += 10;
    }

    return { perfume, potencialFiscal: potencial, razon };
  });

  suggestions.sort((a, b) => b.potencialFiscal - a.potencialFiscal);

  return suggestions.slice(0, topN);
}

// ══════════════════════════════════════════════════════
// RESUMEN DEL INVENTARIO
// ══════════════════════════════════════════════════════

/**
 * Genera un resumen completo del inventario para el dashboard.
 */
export async function getInventorySummary() {
  const inventory = await getFullInventory();

  const valorTotal = inventory.reduce((sum, p) => sum + p.precioRetail, 0);
  const valorFiscalTotal = inventory.reduce((sum, p) => sum + p.valorFiscal, 0);
  const protocolosTotales = new Set(
    inventory.flatMap(p => {
      // No se puede acceder a los protocolos directamente, pero sí contar
      return []; // Se obtiene de stats
    })
  );

  // Familia dominante
  const familyCounts = {};
  for (const p of inventory) {
    familyCounts[p.familia] = (familyCounts[p.familia] || 0) + 1;
  }
  const familiaDominante = Object.entries(familyCounts)
    .sort(([, a], [, b]) => b - a)[0];

  // Casa con más perfumes
  const houseCounts = {};
  for (const p of inventory) {
    houseCounts[p.casa] = (houseCounts[p.casa] || 0) + 1;
  }
  const casaDominante = Object.entries(houseCounts)
    .sort(([, a], [, b]) => b - a)[0];

  return {
    totalPerfumes: inventory.length,
    totalDeCatalogo: PERFUME_INVENTORY.length,
    porcentajeCatalogo: Math.round((inventory.length / PERFUME_INVENTORY.length) * 100),
    valorRetail: valorTotal,
    valorFiscalGenerado: Math.round(valorFiscalTotal * 100) / 100,
    familiaDominante: familiaDominante ? { familia: familiaDominante[0], count: familiaDominante[1] } : null,
    casaDominante: casaDominante ? { casa: casaDominante[0], count: casaDominante[1] } : null,
    familias: familyCounts,
    casas: houseCounts,
    costeAtomizacionMedio: inventory.length > 0
      ? Math.round((inventory.reduce((sum, p) => sum + p.costeAtomizacion, 0) / inventory.length) * 1000) / 1000
      : 0,
  };
}
