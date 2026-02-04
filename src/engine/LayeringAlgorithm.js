/**
 * ETHEREAL EDITION v7.0 - MOTOR DE GENERACIÓN "ENCICLOPEDIA MAGNA"
 * ==================================================================
 * Genera 500 PROTOCOLOS DE LAYERING automáticamente.
 *
 * Algoritmo:
 * 1. Genera todas las combinaciones de 2 y 3 perfumes del inventario.
 * 2. Filtra por compatibilidad olfativa (>= 45%).
 * 3. Asigna el mejor referente nicho a cada combo (emulación).
 * 4. Calcula el ahorro fiscal.
 * 5. Construye los 6 Pilares para cada protocolo.
 * 6. Rankea y selecciona los TOP 500.
 */

import {
  createLayeringProtocol,
  createAplicacion,
  createFactorTiempo,
  createCompatibilidadQuimica,
  ApplicationZone,
  ProtocolTier,
} from '../data/models';
import { PERFUME_INVENTORY, getPerfumeById } from '../data/perfumeInventory';
import {
  calculateTotalCompatibility,
  getSynergyDescription,
  evaluateConflictRisk,
} from '../data/olfactoryFamilies';
import { findBestNicheMatches } from '../data/nicheReferences';
import { generarAnalisisCoste } from './FiscalCalculator';

// ── CONFIGURACIÓN DEL GENERADOR ───────────────────────

const CONFIG = {
  TARGET_PROTOCOLS: 500,
  MIN_COMPATIBILITY: 45,         // % mínimo para incluir un combo
  MAX_COMBOS_2: 400,             // Máximo de combos de 2 perfumes
  MAX_COMBOS_3: 200,             // Máximo de combos de 3 perfumes
  DEFAULT_SPRAYS_PER_PERFUME: 2, // Atomizaciones por defecto
  DRYING_TIME_SECONDS: 45,       // Tiempo de secado entre capas
};

// ── NOMBRES DE OPERACIÓN ──────────────────────────────
// Generador de nombres épicos para los protocolos.

const PREFIXES = [
  'Protocolo', 'Operación', 'Misión', 'Proyecto', 'Código',
  'Síntesis', 'Fórmula', 'Secuencia', 'Vector', 'Nexus',
  'Matriz', 'Índice', 'Señal', 'Pulso', 'Onda',
  'Arco', 'Eje', 'Prisma', 'Vórtice', 'Espectro',
];

const CODENAMES = [
  'Omega', 'Alpha', 'Zenith', 'Eclipse', 'Phoenix',
  'Nebula', 'Quasar', 'Solstice', 'Equinox', 'Aurora',
  'Titan', 'Chronos', 'Atlas', 'Helios', 'Morpheus',
  'Obsidian', 'Platinum', 'Titanium', 'Onyx', 'Ivory',
  'Velvet', 'Silk', 'Amber', 'Sable', 'Crimson',
  'Midnight', 'Twilight', 'Dawn', 'Dusk', 'Horizon',
  'Cascade', 'Tempest', 'Mirage', 'Phantom', 'Specter',
  'Cipher', 'Enigma', 'Oracle', 'Sentinel', 'Apex',
  'Vertex', 'Zenon', 'Sigma', 'Delta', 'Gamma',
  'Luxor', 'Versailles', 'Monaco', 'Amalfi', 'Portofino',
  'Kashmir', 'Bosphorus', 'Riviera', 'Toscana', 'Marrakech',
  'Serenity', 'Majesty', 'Opulence', 'Grandeur', 'Elegance',
  'Noir', 'Blanche', 'Rouge', 'Dorado', 'Azur',
];

const CATEGORIES = [
  'Seducción Nocturna', 'Frescura Mediterránea', 'Poder Ejecutivo',
  'Elegancia Clásica', 'Aventura Urbana', 'Ritual Oriental',
  'Brisa Costera', 'Gala de Invierno', 'Atardecer Dorado',
  'Misterio Oscuro', 'Sofisticación Parisina', 'Energía Matutina',
  'Encuentro Íntimo', 'Cocktail de Noche', 'Paseo Dominical',
  'Reunión de Negocios', 'Cita Romántica', 'Escapada Weekend',
  'Evento de Alfombra Roja', 'Día de Verano',
];

// Generador de nombre único con seed determinista
function generateProtocolName(index) {
  const prefixIdx = index % PREFIXES.length;
  const codenameIdx = Math.floor(index / PREFIXES.length) % CODENAMES.length;
  const suffix = Math.floor(index / (PREFIXES.length * CODENAMES.length));

  let name = `${PREFIXES[prefixIdx]} ${CODENAMES[codenameIdx]}`;
  if (suffix > 0) name += ` ${suffix + 1}`;
  return name;
}

function generateCategory(perfumes) {
  // Categoría basada en las familias dominantes
  const familias = perfumes.map(p => p.familia);
  const hash = familias.join('').length + perfumes.length;
  return CATEGORIES[hash % CATEGORIES.length];
}

// ── ZONAS DE APLICACIÓN ───────────────────────────────
// Asignación inteligente de zonas según el orden de aplicación.

const ZONE_ASSIGNMENTS = {
  1: [ApplicationZone.PECHO, ApplicationZone.MUÑECAS],     // Base: zonas de calor
  2: [ApplicationZone.CUELLO, ApplicationZone.INTERIOR_CODOS], // Medio: zonas de pulso
  3: [ApplicationZone.DETRAS_OREJAS, ApplicationZone.NUCA],    // Cierre: zonas de proyección
};

function assignZone(orden) {
  const zones = ZONE_ASSIGNMENTS[orden] || [ApplicationZone.MUÑECAS];
  return zones[0];
}

// ── DETERMINACIÓN DE ATOMIZACIONES ────────────────────

function determineSprayCount(perfume, orden, totalPerfumes) {
  // Perfumes más concentrados = menos sprays
  const concentrationFactor = {
    'Cologne': 3,
    'EDT': 2,
    'EDP': 2,
    'EDT Intense': 2,
    'Parfum': 1,
  };

  let base = concentrationFactor[perfume.concentracion] || 2;

  // La base del layering (orden 1) recibe más atomizaciones
  if (orden === 1) base += 1;

  // Si son 3 perfumes, reducir un poco cada uno
  if (totalPerfumes >= 3 && orden > 1) base = Math.max(1, base - 1);

  return base;
}

// ── FACTOR TIEMPO ─────────────────────────────────────

function generateFactorTiempo(aplicaciones) {
  const steps = [];
  let tiempoTotal = 0;

  aplicaciones.forEach((app, idx) => {
    const perfume = getPerfumeById(app.perfumeId);
    const nombre = perfume ? `${perfume.casa} ${perfume.nombre}` : app.perfumeId;

    steps.push({
      paso: idx + 1,
      descripcion: `Aplicar ${app.atomizaciones} atomizaciones de ${nombre} en ${app.zona} (${app.distanciaCm}cm)`,
      tiempoSegundos: 5, // Tiempo de aplicación
    });
    tiempoTotal += 5;

    // Secado entre capas (excepto la última)
    if (idx < aplicaciones.length - 1) {
      steps.push({
        paso: idx + 1.5,
        descripcion: `Esperar secado (${CONFIG.DRYING_TIME_SECONDS}s) antes de la siguiente capa`,
        tiempoSegundos: CONFIG.DRYING_TIME_SECONDS,
      });
      tiempoTotal += CONFIG.DRYING_TIME_SECONDS;
    }
  });

  // Longevidad estimada basada en concentración de los perfumes
  const concentraciones = aplicaciones.map(a => {
    const p = getPerfumeById(a.perfumeId);
    return p ? p.concentracion : 'EDT';
  });

  const longevidadMap = { 'Cologne': 3, 'EDT': 6, 'EDT Intense': 8, 'EDP': 9, 'Parfum': 12 };
  const longevidades = concentraciones.map(c => longevidadMap[c] || 6);
  const longevidadMedia = longevidades.reduce((a, b) => a + b, 0) / longevidades.length;

  // El layering suele durar más que cada perfume individual (+20%)
  const longevidadLayering = Math.round(longevidadMedia * 1.2);

  return createFactorTiempo({
    tiempoSecadoEntreCapas: CONFIG.DRYING_TIME_SECONDS,
    tiempoTotalAplicacion: tiempoTotal,
    tiempoDesarrolloCompleto: 30, // 30 minutos estándar
    longevidadEstimada: longevidadLayering,
    sillagePico: Math.round(longevidadLayering * 0.25), // Pico al 25% del tiempo total
    cronograma: steps,
  });
}

// ── DETERMINAR TIER ───────────────────────────────────

function determineTier(compatibilidad) {
  if (compatibilidad >= 90) return ProtocolTier.ALPHA;
  if (compatibilidad >= 75) return ProtocolTier.BETA;
  if (compatibilidad >= 60) return ProtocolTier.GAMMA;
  return ProtocolTier.DELTA;
}

// ── GENERADOR DE COMBINACIONES ────────────────────────

/**
 * Genera combinaciones de 2 perfumes.
 */
function* generatePairs(perfumes) {
  for (let i = 0; i < perfumes.length; i++) {
    for (let j = i + 1; j < perfumes.length; j++) {
      yield [perfumes[i], perfumes[j]];
    }
  }
}

/**
 * Genera combinaciones de 3 perfumes.
 */
function* generateTriplets(perfumes) {
  for (let i = 0; i < perfumes.length; i++) {
    for (let j = i + 1; j < perfumes.length; j++) {
      for (let k = j + 1; k < perfumes.length; k++) {
        yield [perfumes[i], perfumes[j], perfumes[k]];
      }
    }
  }
}

// ── CONSTRUCTOR DE PROTOCOLO ──────────────────────────

/**
 * Construye un protocolo completo a partir de una combinación de perfumes.
 */
function buildProtocol(perfumes, index) {
  // 1) Calcular compatibilidad (Pilar 6 parcial)
  const compat = calculateTotalCompatibility(perfumes);

  if (compat.porcentaje < CONFIG.MIN_COMPATIBILITY) {
    return null; // Descartado por baja compatibilidad
  }

  // 2) Encontrar el mejor referente nicho
  const allNotes = perfumes.flatMap(p => p.todasLasNotas());
  const familias = perfumes.map(p => p.familia);
  const familiaDominante = familias.sort((a, b) =>
    familias.filter(f => f === b).length - familias.filter(f => f === a).length
  )[0];

  const nicheMatches = findBestNicheMatches(allNotes, familiaDominante, 1);
  if (nicheMatches.length === 0) return null;

  const bestNiche = nicheMatches[0];

  // 3) Construir técnica quirúrgica (Pilar 4)
  const aplicaciones = perfumes.map((perfume, idx) => {
    const orden = idx + 1;
    const sprays = determineSprayCount(perfume, orden, perfumes.length);

    return createAplicacion({
      perfumeId: perfume.id,
      orden,
      zona: assignZone(orden),
      atomizaciones: sprays,
      distanciaCm: 15,
      notas: orden === 1
        ? 'Capa base: aplicar primero para anclar el layering'
        : orden === perfumes.length
          ? 'Capa de cierre: sella el acorde final'
          : 'Capa intermedia: construye el puente olfativo',
    });
  });

  // 4) Análisis de coste (Pilar 3)
  const aplicacionesParaCoste = aplicaciones.map(a => ({
    perfumeId: a.perfumeId,
    atomizaciones: a.atomizaciones,
  }));

  let analisisCoste;
  try {
    analisisCoste = generarAnalisisCoste(bestNiche.reference.id, aplicacionesParaCoste);
  } catch {
    return null;
  }

  // 5) Factor tiempo (Pilar 5)
  const factorTiempo = generateFactorTiempo(aplicaciones);

  // 6) Compatibilidad química completa (Pilar 6)
  const conflicto = evaluateConflictRisk(familias);
  const sinergia = getSynergyDescription(familias);
  const uniqueFamilias = [...new Set(familias)];

  const compatibilidadQuimica = createCompatibilidadQuimica({
    porcentajeParentesco: compat.porcentaje,
    notasCompartidas: compat.detalle.sharedNotes || [],
    familiasPresentes: uniqueFamilias,
    sinergia,
    riesgoConflicto: conflicto.riesgo,
    tier: determineTier(compat.porcentaje),
  });

  // 7) Nombre y categoría (Pilar 1)
  const nombreOperacion = generateProtocolName(index);
  const categoria = generateCategory(perfumes);
  const descripcion = `Emulación de ${bestNiche.reference.casa} ${bestNiche.reference.nombre} ` +
    `(${Math.round(bestNiche.score)}% match) usando ${perfumes.map(p => p.nombre).join(' + ')}. ` +
    `${sinergia}`;

  // 8) Ensamblar protocolo completo
  try {
    return createLayeringProtocol({
      id: `LP-${String(index).padStart(4, '0')}`,
      nombreOperacion,
      descripcion,
      categoria,
      activosReales: perfumes.map(p => p.id),
      analisisCoste,
      tecnicaQuirurgica: aplicaciones,
      factorTiempo,
      compatibilidadQuimica,
      generadoPor: 'algorithm',
    });
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL: GENERAR 500 PROTOCOLOS
// ══════════════════════════════════════════════════════

/**
 * Genera la Enciclopedia Magna de protocolos de layering.
 * Combina los 53 perfumes del inventario para crear 500 protocolos
 * rankeados por calidad (compatibilidad + ahorro).
 *
 * @param {Array} inventario - Array de perfumes activos (default: PERFUME_INVENTORY)
 * @param {number} target - Número de protocolos objetivo (default: 500)
 * @returns {Array} Array de LayeringProtocol ordenados por score
 */
export function generarEnciclopediaMagna(inventario = null, target = CONFIG.TARGET_PROTOCOLS) {
  const perfumes = (inventario || PERFUME_INVENTORY).filter(p => p.activo);

  if (perfumes.length < 2) {
    return [];
  }

  const candidates = [];
  let globalIndex = 0;

  // ── FASE 1: Combinaciones de 2 perfumes ──────────
  let pairCount = 0;
  for (const pair of generatePairs(perfumes)) {
    if (pairCount >= CONFIG.MAX_COMBOS_2 * 3) break; // Generar más de los necesarios para filtrar

    const protocol = buildProtocol(pair, globalIndex);
    if (protocol) {
      candidates.push(protocol);
      pairCount++;
    }
    globalIndex++;
  }

  // ── FASE 2: Combinaciones de 3 perfumes ──────────
  let tripletCount = 0;
  const maxTripletAttempts = CONFIG.MAX_COMBOS_3 * 5;
  let tripletAttempts = 0;

  for (const triplet of generateTriplets(perfumes)) {
    if (tripletCount >= CONFIG.MAX_COMBOS_3 || tripletAttempts >= maxTripletAttempts) break;
    tripletAttempts++;

    const protocol = buildProtocol(triplet, globalIndex);
    if (protocol) {
      candidates.push(protocol);
      tripletCount++;
    }
    globalIndex++;
  }

  // ── FASE 3: Ranking y selección ──────────────────
  // Score compuesto: 60% compatibilidad + 25% ahorro (normalizado) + 15% emulación
  const maxAhorro = Math.max(...candidates.map(c => c.analisisCoste.ahorroGenerado), 1);

  const scored = candidates.map(protocol => {
    const compatScore = protocol.compatibilidadQuimica.porcentajeParentesco;
    const ahorroScore = (protocol.analisisCoste.ahorroGenerado / maxAhorro) * 100;
    const emulacionScore = protocol.analisisCoste.porcentajeAhorro;

    const totalScore = (compatScore * 0.60) + (ahorroScore * 0.25) + (emulacionScore * 0.15);

    return { protocol, totalScore };
  });

  // Ordenar por score descendente
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Seleccionar TOP N, re-indexar IDs
  const selected = scored.slice(0, target).map((item, idx) => {
    const p = item.protocol;
    // Reconstruir con ID secuencial limpio
    try {
      return createLayeringProtocol({
        id: `LP-${String(idx + 1).padStart(4, '0')}`,
        nombreOperacion: generateProtocolName(idx),
        descripcion: p.descripcion,
        categoria: p.categoria,
        activosReales: [...p.activosReales],
        analisisCoste: p.analisisCoste,
        tecnicaQuirurgica: [...p.tecnicaQuirurgica],
        factorTiempo: p.factorTiempo,
        compatibilidadQuimica: p.compatibilidadQuimica,
        generadoPor: 'algorithm',
      });
    } catch {
      return p;
    }
  });

  return selected;
}

/**
 * Genera protocolos filtrados por perfumes específicos del inventario activo.
 * Útil cuando el usuario solo tiene ciertos perfumes disponibles.
 *
 * @param {string[]} perfumeIds - IDs de perfumes disponibles
 * @param {number} target - Número de protocolos objetivo
 * @returns {Array} Protocolos generados
 */
export function generarProtocolosParaInventario(perfumeIds, target = 100) {
  const perfumes = perfumeIds
    .map(id => getPerfumeById(id))
    .filter(p => p && p.activo);

  return generarEnciclopediaMagna(perfumes, target);
}

/**
 * Regenera protocolos tras un cambio en el inventario.
 * Filtra protocolos existentes que ya no son válidos (perfume eliminado)
 * y genera nuevos para llenar los huecos.
 *
 * @param {Array} protocolosExistentes - Protocolos actuales
 * @param {string[]} perfumeIdsActivos - IDs de perfumes actualmente en inventario
 * @returns {{ activos: Array, desactivados: Array, nuevos: Array }}
 */
export function sincronizarConInventario(protocolosExistentes, perfumeIdsActivos) {
  const activeSet = new Set(perfumeIdsActivos);

  const activos = [];
  const desactivados = [];

  for (const proto of protocolosExistentes) {
    const todosDisponibles = proto.activosReales.every(id => activeSet.has(id));

    if (todosDisponibles) {
      activos.push(proto);
    } else {
      // Marcar como inactivo pero preservar datos
      desactivados.push({
        ...proto,
        activo: false,
        _razonDesactivacion: 'Perfume(s) eliminado(s) del inventario',
      });
    }
  }

  // Generar nuevos si hay espacio
  const huecosDisponibles = CONFIG.TARGET_PROTOCOLS - activos.length;
  let nuevos = [];

  if (huecosDisponibles > 0 && perfumeIdsActivos.length >= 2) {
    nuevos = generarProtocolosParaInventario(perfumeIdsActivos, huecosDisponibles);
    // Filtrar duplicados (misma combinación de activos)
    const activosKeys = new Set(activos.map(p => [...p.activosReales].sort().join('|')));
    nuevos = nuevos.filter(n => !activosKeys.has([...n.activosReales].sort().join('|')));
  }

  return { activos, desactivados, nuevos };
}

/**
 * Busca protocolos por criterios.
 *
 * @param {Array} protocolos - Todos los protocolos
 * @param {object} filtros
 * @returns {Array} Protocolos filtrados
 */
export function buscarProtocolos(protocolos, filtros = {}) {
  let resultado = [...protocolos];

  if (filtros.familia) {
    resultado = resultado.filter(p =>
      p.compatibilidadQuimica.familiasPresentes.includes(filtros.familia)
    );
  }

  if (filtros.tier) {
    resultado = resultado.filter(p =>
      p.compatibilidadQuimica.tier === filtros.tier
    );
  }

  if (filtros.minAhorro) {
    resultado = resultado.filter(p =>
      p.analisisCoste.ahorroGenerado >= filtros.minAhorro
    );
  }

  if (filtros.maxCoste) {
    resultado = resultado.filter(p =>
      p.analisisCoste.costeRealLayering <= filtros.maxCoste
    );
  }

  if (filtros.perfumeId) {
    resultado = resultado.filter(p =>
      p.activosReales.includes(filtros.perfumeId)
    );
  }

  if (filtros.texto) {
    const textoLower = filtros.texto.toLowerCase();
    resultado = resultado.filter(p =>
      p.nombreOperacion.toLowerCase().includes(textoLower) ||
      p.descripcion.toLowerCase().includes(textoLower) ||
      p.categoria.toLowerCase().includes(textoLower)
    );
  }

  if (filtros.soloFavoritos) {
    resultado = resultado.filter(p => p.favorito);
  }

  if (filtros.soloActivos !== false) {
    resultado = resultado.filter(p => p.activo);
  }

  // Ordenar
  if (filtros.ordenarPor) {
    const ordenes = {
      ahorro: (a, b) => b.analisisCoste.ahorroGenerado - a.analisisCoste.ahorroGenerado,
      compatibilidad: (a, b) => b.compatibilidadQuimica.porcentajeParentesco - a.compatibilidadQuimica.porcentajeParentesco,
      coste: (a, b) => a.analisisCoste.costeRealLayering - b.analisisCoste.costeRealLayering,
      nombre: (a, b) => a.nombreOperacion.localeCompare(b.nombreOperacion),
      vecesUsado: (a, b) => b.vecesUsado - a.vecesUsado,
    };
    const sortFn = ordenes[filtros.ordenarPor];
    if (sortFn) resultado.sort(sortFn);
  }

  return resultado;
}
