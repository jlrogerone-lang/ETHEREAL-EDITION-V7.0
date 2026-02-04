/**
 * ETHEREAL EDITION v7.0 - MÓDULO DE AUDITORÍA FISCAL
 * ====================================================
 * El Motor del Dinero.
 *
 * Calcula el "Ahorro Fiscal" de cada layering:
 * Precio del Referente Nicho - Coste de atomizaciones = AHORRO GENERADO
 *
 * Cada cálculo genera un objeto AnalisisCoste completo (Pilar 3).
 */

import { createAnalisisCoste, createSavingsSummary } from '../data/models';
import { getPerfumeById } from '../data/perfumeInventory';
import { getNicheById } from '../data/nicheReferences';

/**
 * Calcula el coste real de un layering basado en las atomizaciones usadas.
 *
 * @param {Array<{ perfumeId: string, atomizaciones: number }>} aplicaciones
 * @returns {{ total: number, desglose: Array }}
 */
export function calcularCosteReal(aplicaciones) {
  let total = 0;
  const desglose = [];

  for (const app of aplicaciones) {
    const perfume = getPerfumeById(app.perfumeId);
    if (!perfume) continue;

    const subtotal = perfume.costeAtomizacion * app.atomizaciones;
    total += subtotal;

    desglose.push({
      perfumeId: perfume.id,
      nombre: `${perfume.casa} - ${perfume.nombre}`,
      atomizaciones: app.atomizaciones,
      costePorAtomizacion: perfume.costeAtomizacion,
      subtotal: Math.round(subtotal * 1000) / 1000,
    });
  }

  return {
    total: Math.round(total * 100) / 100,
    desglose,
  };
}

/**
 * Genera el Análisis de Coste completo (Pilar 3) para un layering.
 *
 * @param {string} nicheReferenceId - ID del referente nicho
 * @param {Array<{ perfumeId: string, atomizaciones: number }>} aplicaciones
 * @returns {object} AnalisisCoste frozen object
 */
export function generarAnalisisCoste(nicheReferenceId, aplicaciones) {
  const nicheRef = getNicheById(nicheReferenceId);
  if (!nicheRef) {
    throw new Error(`Referente nicho no encontrado: ${nicheReferenceId}`);
  }

  const { total, desglose } = calcularCosteReal(aplicaciones);
  const ahorro = nicheRef.precioRetail - total;
  const porcentajeAhorro = nicheRef.precioRetail > 0
    ? (ahorro / nicheRef.precioRetail) * 100
    : 0;

  return createAnalisisCoste({
    referenteNicheId: nicheReferenceId,
    precioReferenteNiche: nicheRef.precioRetail,
    costeRealLayering: total,
    ahorroGenerado: ahorro,
    porcentajeAhorro,
    costeDesglosado: desglose,
  });
}

/**
 * Calcula el ahorro rápido sin construir el objeto completo.
 * Útil para preview y listados.
 *
 * @param {number} precioNiche - Precio del referente nicho
 * @param {Array<{ perfumeId: string, atomizaciones: number }>} aplicaciones
 * @returns {{ ahorro: number, coste: number, porcentaje: number }}
 */
export function calcularAhorroRapido(precioNiche, aplicaciones) {
  const { total } = calcularCosteReal(aplicaciones);
  const ahorro = precioNiche - total;
  const porcentaje = precioNiche > 0 ? (ahorro / precioNiche) * 100 : 0;

  return {
    ahorro: Math.round(ahorro * 100) / 100,
    coste: total,
    porcentaje: Math.round(porcentaje * 10) / 10,
  };
}

/**
 * Genera un resumen acumulativo de ahorro fiscal del usuario.
 * Se alimenta del historial de uso persistido.
 *
 * @param {Array<{ fecha: string, protocoloId: string, analisisCoste: object }>} historial
 * @returns {object} SavingsSummary
 */
export function generarResumenAhorro(historial) {
  if (!historial || historial.length === 0) {
    return createSavingsSummary({});
  }

  let totalAhorrado = 0;
  let totalGastado = 0;

  const items = historial.map(entry => {
    const ahorro = entry.analisisCoste.ahorroGenerado;
    const gasto = entry.analisisCoste.costeRealLayering;
    totalAhorrado += ahorro;
    totalGastado += gasto;

    return {
      fecha: entry.fecha,
      protocoloId: entry.protocoloId,
      ahorro,
    };
  });

  const protocolosUsados = historial.length;
  const ahorroPromedio = protocolosUsados > 0 ? totalAhorrado / protocolosUsados : 0;
  const roi = totalGastado > 0 ? totalAhorrado / totalGastado : 0;

  return createSavingsSummary({
    totalAhorrado,
    totalGastado,
    protocolosUsados,
    ahorroPromedioPorUso: ahorroPromedio,
    roiGlobal: roi,
    historial: items,
  });
}

/**
 * Calcula el "Valor Niche Equivalente" total de la colección.
 * = Suma de todos los referentes nicho que se pueden emular con el inventario.
 *
 * @param {Array} protocolos - Todos los protocolos activos
 * @returns {{ valorNicheTotal: number, protocolosActivos: number, ahorroMaximo: number }}
 */
export function calcularValorNicheEquivalente(protocolos) {
  const activos = protocolos.filter(p => p.activo);
  const nicheIds = new Set();
  let ahorroTotal = 0;

  for (const proto of activos) {
    nicheIds.add(proto.analisisCoste.referenteNicheId);
    ahorroTotal += proto.analisisCoste.ahorroGenerado;
  }

  // Valor total de los nichos emulados (sin duplicar nichos)
  let valorNiche = 0;
  for (const nicheId of nicheIds) {
    const niche = getNicheById(nicheId);
    if (niche) valorNiche += niche.precioRetail;
  }

  return {
    valorNicheTotal: valorNiche,
    protocolosActivos: activos.length,
    ahorroMaximo: Math.round(ahorroTotal * 100) / 100,
  };
}

/**
 * Genera el informe financiero completo para mostrar en el dashboard.
 *
 * @param {Array} protocolos - Todos los protocolos
 * @param {Array} historialUso - Historial de usos registrados
 * @returns {object} Informe financiero completo
 */
export function generarInformeFinanciero(protocolos, historialUso) {
  const resumenAhorro = generarResumenAhorro(historialUso);
  const valorNiche = calcularValorNicheEquivalente(protocolos);

  // Calcular ahorro por día/mes si hay historial
  let ahorroDiario = 0;
  let ahorroMensual = 0;

  if (historialUso.length >= 2) {
    const fechas = historialUso.map(h => new Date(h.fecha).getTime()).sort();
    const diasEntre = (fechas[fechas.length - 1] - fechas[0]) / (1000 * 60 * 60 * 24);
    if (diasEntre > 0) {
      ahorroDiario = resumenAhorro.totalAhorrado / diasEntre;
      ahorroMensual = ahorroDiario * 30;
    }
  }

  // Top 5 protocolos por ahorro
  const topProtocolos = [...protocolos]
    .filter(p => p.activo)
    .sort((a, b) => b.analisisCoste.ahorroGenerado - a.analisisCoste.ahorroGenerado)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      nombre: p.nombreOperacion,
      ahorro: p.analisisCoste.ahorroGenerado,
      nicheEmulado: getNicheById(p.analisisCoste.referenteNicheId)?.nombre || 'Desconocido',
    }));

  return Object.freeze({
    resumenAhorro,
    valorNicheEquivalente: valorNiche,
    proyeccion: {
      ahorroDiario: Math.round(ahorroDiario * 100) / 100,
      ahorroMensual: Math.round(ahorroMensual * 100) / 100,
      ahorroAnual: Math.round(ahorroMensual * 12 * 100) / 100,
    },
    topProtocolos,
    fechaGeneracion: new Date().toISOString(),
  });
}
