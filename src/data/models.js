/**
 * ETHEREAL EDITION v7.0 - DATA MODELS
 * =====================================
 * Los 6 Pilares Inquebrantables del Layering Protocol.
 * Cada objeto Layering cumple OBLIGATORIAMENTE con esta estructura.
 *
 * Arquitectura: Inmutable por defecto. Factory functions para crear instancias validadas.
 */

// ── ENUMS ──────────────────────────────────────────────

export const OlfactoryFamily = Object.freeze({
  CITRICA: 'Cítrica',
  AMADERADA: 'Amaderada',
  ORIENTAL: 'Oriental',
  FLORAL: 'Floral',
  ACUATICA: 'Acuática',
  AROMATICA: 'Aromática',
  FOUGERE: 'Fougère',
  GOURMAND: 'Gourmand',
  CHIPRE: 'Chypre',
  CUERO: 'Cuero',
});

export const NoteLayer = Object.freeze({
  TOP: 'top',
  HEART: 'heart',
  BASE: 'base',
});

export const ApplicationZone = Object.freeze({
  MUÑECAS: 'Muñecas',
  CUELLO: 'Cuello',
  DETRAS_OREJAS: 'Detrás de las orejas',
  PECHO: 'Pecho',
  INTERIOR_CODOS: 'Interior de los codos',
  NUCA: 'Nuca',
  CABELLO: 'Cabello',
  ROPA: 'Ropa (exterior)',
});

export const ProtocolTier = Object.freeze({
  ALPHA: 'Alpha',       // Compatibilidad 90-100%
  BETA: 'Beta',         // Compatibilidad 75-89%
  GAMMA: 'Gamma',       // Compatibilidad 60-74%
  DELTA: 'Delta',       // Compatibilidad 45-59% (experimental)
});

// ── PERFUME MODEL ──────────────────────────────────────

/**
 * Crea un objeto Perfume validado.
 * Representa un activo real del inventario del usuario.
 */
export function createPerfume({
  id,
  nombre,
  casa,
  familia,
  subfamilia = null,
  notasTop = [],
  notasHeart = [],
  notasBase = [],
  concentracion = 'EDT',    // EDT, EDP, Parfum, Cologne
  volumenMl = 100,
  precioRetail = 0,
  costeAtomizacion = 0,     // Precio por 1 atomización (~0.1ml)
  activo = true,
}) {
  if (!id || !nombre || !casa || !familia) {
    throw new Error(`Perfume inválido: faltan campos obligatorios (id=${id}, nombre=${nombre})`);
  }
  return Object.freeze({
    id,
    nombre,
    casa,
    familia,
    subfamilia,
    notasTop: Object.freeze([...notasTop]),
    notasHeart: Object.freeze([...notasHeart]),
    notasBase: Object.freeze([...notasBase]),
    concentracion,
    volumenMl,
    precioRetail,
    costeAtomizacion,
    activo,
    todasLasNotas() {
      return [...this.notasTop, ...this.notasHeart, ...this.notasBase];
    },
  });
}

// ── NICHE REFERENCE MODEL ──────────────────────────────

/**
 * Referente de nicho: la fragancia de lujo que el layering emula.
 */
export function createNicheReference({
  id,
  nombre,
  casa,
  precioRetail,
  familia,
  notasClave = [],
  descripcion = '',
}) {
  return Object.freeze({
    id,
    nombre,
    casa,
    precioRetail,
    familia,
    notasClave: Object.freeze([...notasClave]),
    descripcion,
  });
}

// ── TÉCNICA QUIRÚRGICA (Pilar 4) ──────────────────────

/**
 * Instrucción de aplicación para un perfume dentro de un layering.
 */
export function createAplicacion({
  perfumeId,
  orden,                    // 1 = base, 2 = medio, 3 = cierre
  zona,                     // ApplicationZone
  atomizaciones,            // Número exacto
  distanciaCm = 15,         // Distancia de aplicación en cm
  notas = '',               // Instrucciones especiales
}) {
  return Object.freeze({
    perfumeId,
    orden,
    zona,
    atomizaciones,
    distanciaCm,
    notas,
  });
}

// ── ANÁLISIS DE COSTE (Pilar 3) ───────────────────────

/**
 * Desglose financiero completo de un layering.
 */
export function createAnalisisCoste({
  referenteNicheId,
  precioReferenteNiche,      // Ej: 350€
  costeRealLayering,         // Suma de atomizaciones usadas
  ahorroGenerado,            // precioReferente - costeReal
  porcentajeAhorro,          // (ahorro / precioReferente) * 100
  costeDesglosado = [],      // Array de { perfumeId, nombre, atomizaciones, costePorAtomizacion, subtotal }
}) {
  return Object.freeze({
    referenteNicheId,
    precioReferenteNiche,
    costeRealLayering: Math.round(costeRealLayering * 100) / 100,
    ahorroGenerado: Math.round(ahorroGenerado * 100) / 100,
    porcentajeAhorro: Math.round(porcentajeAhorro * 10) / 10,
    costeDesglosado: Object.freeze(costeDesglosado.map(d => Object.freeze({ ...d }))),
    get roi() {
      if (this.costeRealLayering === 0) return 0;
      return Math.round((this.ahorroGenerado / this.costeRealLayering) * 100) / 100;
    },
  });
}

// ── FACTOR TIEMPO (Pilar 5) ───────────────────────────

/**
 * Cronograma preciso de aplicación del layering.
 */
export function createFactorTiempo({
  tiempoSecadoEntreCapas = 45,     // Segundos entre aplicaciones
  tiempoTotalAplicacion = 0,       // Segundos totales del ritual
  tiempoDesarrolloCompleto = 30,   // Minutos para que el layering se desarrolle completamente
  longevidadEstimada = 8,          // Horas de duración estimada
  sillagePico = 2,                 // Horas hasta el sillage máximo
  cronograma = [],                 // Array de { paso, descripcion, tiempoSegundos }
}) {
  return Object.freeze({
    tiempoSecadoEntreCapas,
    tiempoTotalAplicacion,
    tiempoDesarrolloCompleto,
    longevidadEstimada,
    sillagePico,
    cronograma: Object.freeze(cronograma.map(c => Object.freeze({ ...c }))),
  });
}

// ── COMPATIBILIDAD QUÍMICA (Pilar 6) ──────────────────

/**
 * Análisis de parentesco químico entre los perfumes del layering
 * y el referente de nicho.
 */
export function createCompatibilidadQuimica({
  porcentajeParentesco,            // 0-100
  notasCompartidas = [],           // Notas presentes tanto en el layering como en el referente
  familiasPresentes = [],          // Familias olfativas en el combo
  sinergia = '',                   // Descripción de la sinergia química
  riesgoConflicto = 'bajo',       // bajo, medio, alto
  tier = ProtocolTier.BETA,
}) {
  return Object.freeze({
    porcentajeParentesco: Math.round(porcentajeParentesco * 10) / 10,
    notasCompartidas: Object.freeze([...notasCompartidas]),
    familiasPresentes: Object.freeze([...familiasPresentes]),
    sinergia,
    riesgoConflicto,
    tier,
  });
}

// ══════════════════════════════════════════════════════
// LAYERING PROTOCOL - LOS 6 PILARES UNIDOS
// ══════════════════════════════════════════════════════

/**
 * Crea un Protocolo de Layering completo con los 6 Pilares.
 * Esta es la entidad maestra de toda la aplicación.
 */
export function createLayeringProtocol({
  id,
  // ── PILAR 1: Nombre de la Operación ──
  nombreOperacion,
  descripcion = '',
  categoria = '',

  // ── PILAR 2: Activos Reales ──
  activosReales = [],             // Array de perfumeIds que se usan

  // ── PILAR 3: Análisis de Coste ──
  analisisCoste,                  // createAnalisisCoste()

  // ── PILAR 4: Técnica Quirúrgica ──
  tecnicaQuirurgica = [],         // Array de createAplicacion()

  // ── PILAR 5: Factor Tiempo ──
  factorTiempo,                   // createFactorTiempo()

  // ── PILAR 6: Compatibilidad Química ──
  compatibilidadQuimica,          // createCompatibilidadQuimica()

  // ── METADATA ──
  fechaCreacion = new Date().toISOString(),
  favorito = false,
  vecesUsado = 0,
  activo = true,
  generadoPor = 'algorithm',      // 'algorithm' | 'manual' | 'ai'
}) {
  if (!id || !nombreOperacion || !analisisCoste || !factorTiempo || !compatibilidadQuimica) {
    throw new Error(`Protocolo inválido: faltan pilares obligatorios (id=${id})`);
  }
  if (activosReales.length < 2) {
    throw new Error(`Protocolo inválido: se requieren al menos 2 activos reales (id=${id})`);
  }

  return Object.freeze({
    id,
    nombreOperacion,
    descripcion,
    categoria,
    activosReales: Object.freeze([...activosReales]),
    analisisCoste,
    tecnicaQuirurgica: Object.freeze([...tecnicaQuirurgica]),
    factorTiempo,
    compatibilidadQuimica,
    fechaCreacion,
    favorito,
    vecesUsado,
    activo,
    generadoPor,
  });
}

// ── SAVINGS SUMMARY ────────────────────────────────────

/**
 * Resumen acumulativo de ahorro fiscal del usuario.
 */
export function createSavingsSummary({
  totalAhorrado = 0,
  totalGastado = 0,
  protocolosUsados = 0,
  ahorroPromedioPorUso = 0,
  roiGlobal = 0,
  historial = [],                 // Array de { fecha, protocoloId, ahorro }
}) {
  return Object.freeze({
    totalAhorrado: Math.round(totalAhorrado * 100) / 100,
    totalGastado: Math.round(totalGastado * 100) / 100,
    protocolosUsados,
    ahorroPromedioPorUso: Math.round(ahorroPromedioPorUso * 100) / 100,
    roiGlobal: Math.round(roiGlobal * 100) / 100,
    historial: Object.freeze(historial.map(h => Object.freeze({ ...h }))),
  });
}

// ── SERIALIZATION HELPERS ──────────────────────────────

/**
 * Convierte un protocolo a JSON plano para AsyncStorage.
 * Elimina funciones y getters computados.
 */
export function protocolToJSON(protocol) {
  return JSON.parse(JSON.stringify({
    id: protocol.id,
    nombreOperacion: protocol.nombreOperacion,
    descripcion: protocol.descripcion,
    categoria: protocol.categoria,
    activosReales: [...protocol.activosReales],
    analisisCoste: {
      referenteNicheId: protocol.analisisCoste.referenteNicheId,
      precioReferenteNiche: protocol.analisisCoste.precioReferenteNiche,
      costeRealLayering: protocol.analisisCoste.costeRealLayering,
      ahorroGenerado: protocol.analisisCoste.ahorroGenerado,
      porcentajeAhorro: protocol.analisisCoste.porcentajeAhorro,
      costeDesglosado: protocol.analisisCoste.costeDesglosado.map(d => ({ ...d })),
    },
    tecnicaQuirurgica: protocol.tecnicaQuirurgica.map(t => ({ ...t })),
    factorTiempo: {
      tiempoSecadoEntreCapas: protocol.factorTiempo.tiempoSecadoEntreCapas,
      tiempoTotalAplicacion: protocol.factorTiempo.tiempoTotalAplicacion,
      tiempoDesarrolloCompleto: protocol.factorTiempo.tiempoDesarrolloCompleto,
      longevidadEstimada: protocol.factorTiempo.longevidadEstimada,
      sillagePico: protocol.factorTiempo.sillagePico,
      cronograma: protocol.factorTiempo.cronograma.map(c => ({ ...c })),
    },
    compatibilidadQuimica: {
      porcentajeParentesco: protocol.compatibilidadQuimica.porcentajeParentesco,
      notasCompartidas: [...protocol.compatibilidadQuimica.notasCompartidas],
      familiasPresentes: [...protocol.compatibilidadQuimica.familiasPresentes],
      sinergia: protocol.compatibilidadQuimica.sinergia,
      riesgoConflicto: protocol.compatibilidadQuimica.riesgoConflicto,
      tier: protocol.compatibilidadQuimica.tier,
    },
    fechaCreacion: protocol.fechaCreacion,
    favorito: protocol.favorito,
    vecesUsado: protocol.vecesUsado,
    activo: protocol.activo,
    generadoPor: protocol.generadoPor,
  }));
}

/**
 * Reconstruye un protocolo desde JSON (AsyncStorage).
 */
export function protocolFromJSON(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  return createLayeringProtocol({
    ...data,
    analisisCoste: createAnalisisCoste(data.analisisCoste),
    tecnicaQuirurgica: data.tecnicaQuirurgica.map(t => createAplicacion(t)),
    factorTiempo: createFactorTiempo(data.factorTiempo),
    compatibilidadQuimica: createCompatibilidadQuimica(data.compatibilidadQuimica),
  });
}
