/**
 * ETHEREAL EDITION v7.0 - MATRIZ DE COMPATIBILIDAD OLFATIVA
 * ===========================================================
 * Define las reglas de combinación entre familias olfativas.
 * Cada pareja de familias tiene un % de compatibilidad base
 * que se ajusta por notas compartidas en el LayeringAlgorithm.
 *
 * Basado en principios de perfumería real:
 * - Familias complementarias (ej: Cítrica + Amaderada = sinergia natural)
 * - Familias conflictivas (ej: Gourmand dulce + Acuática fresca = riesgo)
 */

import { OlfactoryFamily } from './models';

const F = OlfactoryFamily;

// ── MATRIZ DE COMPATIBILIDAD ENTRE FAMILIAS ────────────
// Valor: 0-100. Representa la compatibilidad base entre dos familias.
// La clave es `${familia1}|${familia2}` (orden alfabético del enum value).

const COMPATIBILITY_MATRIX_RAW = {
  // Cítrica combina bien con casi todo excepto gourmand pesado
  [`${F.CITRICA}|${F.AMADERADA}`]: 85,
  [`${F.CITRICA}|${F.ORIENTAL}`]: 65,
  [`${F.CITRICA}|${F.FLORAL}`]: 78,
  [`${F.CITRICA}|${F.ACUATICA}`]: 92,
  [`${F.CITRICA}|${F.AROMATICA}`]: 88,
  [`${F.CITRICA}|${F.FOUGERE}`]: 82,
  [`${F.CITRICA}|${F.GOURMAND}`]: 45,
  [`${F.CITRICA}|${F.CHIPRE}`]: 72,
  [`${F.CITRICA}|${F.CUERO}`]: 55,

  // Amaderada = ancla universal
  [`${F.AMADERADA}|${F.ORIENTAL}`]: 90,
  [`${F.AMADERADA}|${F.FLORAL}`]: 80,
  [`${F.AMADERADA}|${F.ACUATICA}`]: 75,
  [`${F.AMADERADA}|${F.AROMATICA}`]: 88,
  [`${F.AMADERADA}|${F.FOUGERE}`]: 85,
  [`${F.AMADERADA}|${F.GOURMAND}`]: 72,
  [`${F.AMADERADA}|${F.CHIPRE}`]: 82,
  [`${F.AMADERADA}|${F.CUERO}`]: 92,

  // Oriental combina con profundidad
  [`${F.ORIENTAL}|${F.FLORAL}`]: 75,
  [`${F.ORIENTAL}|${F.ACUATICA}`]: 48,
  [`${F.ORIENTAL}|${F.AROMATICA}`]: 70,
  [`${F.ORIENTAL}|${F.FOUGERE}`]: 68,
  [`${F.ORIENTAL}|${F.GOURMAND}`]: 88,
  [`${F.ORIENTAL}|${F.CHIPRE}`]: 78,
  [`${F.ORIENTAL}|${F.CUERO}`]: 85,

  // Floral = puente entre frescura y profundidad
  [`${F.FLORAL}|${F.ACUATICA}`]: 70,
  [`${F.FLORAL}|${F.AROMATICA}`]: 65,
  [`${F.FLORAL}|${F.FOUGERE}`]: 72,
  [`${F.FLORAL}|${F.GOURMAND}`]: 60,
  [`${F.FLORAL}|${F.CHIPRE}`]: 90,
  [`${F.FLORAL}|${F.CUERO}`]: 58,

  // Acuática = frescura pura
  [`${F.ACUATICA}|${F.AROMATICA}`]: 85,
  [`${F.ACUATICA}|${F.FOUGERE}`]: 80,
  [`${F.ACUATICA}|${F.GOURMAND}`]: 35,
  [`${F.ACUATICA}|${F.CHIPRE}`]: 62,
  [`${F.ACUATICA}|${F.CUERO}`]: 42,

  // Aromática
  [`${F.AROMATICA}|${F.FOUGERE}`]: 90,
  [`${F.AROMATICA}|${F.GOURMAND}`]: 55,
  [`${F.AROMATICA}|${F.CHIPRE}`]: 70,
  [`${F.AROMATICA}|${F.CUERO}`]: 65,

  // Fougère
  [`${F.FOUGERE}|${F.GOURMAND}`]: 62,
  [`${F.FOUGERE}|${F.CHIPRE}`]: 78,
  [`${F.FOUGERE}|${F.CUERO}`]: 70,

  // Gourmand
  [`${F.GOURMAND}|${F.CHIPRE}`]: 55,
  [`${F.GOURMAND}|${F.CUERO}`]: 68,

  // Chypre + Cuero
  [`${F.CHIPRE}|${F.CUERO}`]: 75,
};

// Familias iguales: 95% compatibilidad (nunca 100% para fomentar diversidad)
const SAME_FAMILY_COMPATIBILITY = 95;

/**
 * Obtiene la compatibilidad base entre dos familias olfativas.
 * @returns {number} 0-100
 */
export function getFamilyCompatibility(familia1, familia2) {
  if (familia1 === familia2) return SAME_FAMILY_COMPATIBILITY;

  // Buscar en ambas direcciones
  const key1 = `${familia1}|${familia2}`;
  const key2 = `${familia2}|${familia1}`;

  return COMPATIBILITY_MATRIX_RAW[key1] ?? COMPATIBILITY_MATRIX_RAW[key2] ?? 50;
}

// ── NOTAS PUENTE ───────────────────────────────────────
// Notas que actúan como conector entre familias distintas, mejorando la sinergia.

export const BRIDGE_NOTES = Object.freeze({
  // Nota → [familias que conecta naturalmente]
  'bergamota': [F.CITRICA, F.AROMATICA, F.FOUGERE, F.CHIPRE],
  'lavanda': [F.AROMATICA, F.FOUGERE, F.FLORAL],
  'sándalo': [F.AMADERADA, F.ORIENTAL, F.FLORAL],
  'cedro': [F.AMADERADA, F.AROMATICA, F.CHIPRE],
  'vetiver': [F.AMADERADA, F.CHIPRE, F.AROMATICA],
  'pachuli': [F.AMADERADA, F.ORIENTAL, F.CHIPRE, F.GOURMAND],
  'vainilla': [F.ORIENTAL, F.GOURMAND, F.AMADERADA],
  'almizcle': [F.FLORAL, F.ACUATICA, F.AMADERADA],
  'ámbar': [F.ORIENTAL, F.AMADERADA, F.GOURMAND],
  'rosa': [F.FLORAL, F.CHIPRE, F.ORIENTAL],
  'jazmín': [F.FLORAL, F.ORIENTAL, F.CHIPRE],
  'pimienta': [F.ORIENTAL, F.AROMATICA, F.AMADERADA],
  'cardamomo': [F.AROMATICA, F.ORIENTAL, F.FOUGERE],
  'neroli': [F.CITRICA, F.FLORAL, F.ACUATICA],
  'haba tonka': [F.GOURMAND, F.ORIENTAL, F.FOUGERE],
  'incienso': [F.ORIENTAL, F.AMADERADA, F.CHIPRE],
  'cuero': [F.CUERO, F.AMADERADA, F.ORIENTAL],
  'musgo de roble': [F.CHIPRE, F.FOUGERE, F.AMADERADA],
  'geranio': [F.FLORAL, F.AROMATICA, F.CITRICA],
  'canela': [F.ORIENTAL, F.GOURMAND, F.AROMATICA],
});

/**
 * Calcula el bonus de notas puente entre dos perfumes.
 * Cada nota puente compartida que conecta sus familias suma puntos.
 * @returns {number} Bonus 0-15 puntos
 */
export function calculateBridgeBonus(perfume1, perfume2) {
  const notas1 = new Set(perfume1.todasLasNotas().map(n => n.toLowerCase()));
  const notas2 = new Set(perfume2.todasLasNotas().map(n => n.toLowerCase()));

  let bonus = 0;

  for (const [nota, familias] of Object.entries(BRIDGE_NOTES)) {
    const notaLower = nota.toLowerCase();
    const p1HasNote = [...notas1].some(n => n.includes(notaLower));
    const p2HasNote = [...notas2].some(n => n.includes(notaLower));

    if (p1HasNote && p2HasNote) {
      // Ambos comparten una nota puente
      const connectsP1 = familias.includes(perfume1.familia);
      const connectsP2 = familias.includes(perfume2.familia);

      if (connectsP1 && connectsP2) {
        bonus += 5; // Conexión fuerte: nota puente conecta AMBAS familias
      } else if (connectsP1 || connectsP2) {
        bonus += 3; // Conexión parcial
      } else {
        bonus += 1; // Nota compartida sin ser puente específica
      }
    }
  }

  return Math.min(bonus, 15); // Cap en 15
}

/**
 * Encuentra notas compartidas entre una lista de perfumes.
 */
export function findSharedNotes(perfumes) {
  if (perfumes.length < 2) return [];

  const allNoteSets = perfumes.map(p =>
    new Set(p.todasLasNotas().map(n => n.toLowerCase()))
  );

  const shared = [];
  const firstSet = allNoteSets[0];

  for (const nota of firstSet) {
    // Una nota cuenta como "compartida" si aparece en al menos 2 perfumes
    const count = allNoteSets.filter(set =>
      [...set].some(n => n.includes(nota) || nota.includes(n))
    ).length;

    if (count >= 2) {
      shared.push(nota);
    }
  }

  return [...new Set(shared)];
}

/**
 * Calcula la compatibilidad total entre N perfumes.
 * Combina: compatibilidad de familias + bonus de notas puente + notas compartidas.
 * @returns {{ porcentaje: number, detalle: object }}
 */
export function calculateTotalCompatibility(perfumes) {
  if (perfumes.length < 2) {
    return { porcentaje: 0, detalle: { base: 0, bridgeBonus: 0, sharedBonus: 0 } };
  }

  // 1) Promedio de compatibilidad de familias entre todos los pares
  let totalFamilyCompat = 0;
  let pairCount = 0;

  for (let i = 0; i < perfumes.length; i++) {
    for (let j = i + 1; j < perfumes.length; j++) {
      totalFamilyCompat += getFamilyCompatibility(perfumes[i].familia, perfumes[j].familia);
      pairCount++;
    }
  }

  const baseCompat = totalFamilyCompat / pairCount;

  // 2) Bonus de notas puente (promedio de todos los pares)
  let totalBridge = 0;
  let bridgePairs = 0;

  for (let i = 0; i < perfumes.length; i++) {
    for (let j = i + 1; j < perfumes.length; j++) {
      totalBridge += calculateBridgeBonus(perfumes[i], perfumes[j]);
      bridgePairs++;
    }
  }

  const bridgeBonus = totalBridge / bridgePairs;

  // 3) Bonus por notas compartidas
  const sharedNotes = findSharedNotes(perfumes);
  const sharedBonus = Math.min(sharedNotes.length * 2, 10);

  // Total: base (80% peso) + bridge (15% peso) + shared (5% peso)
  const rawScore = (baseCompat * 0.80) + (bridgeBonus * 0.15 * 6.67) + (sharedBonus * 0.05 * 10);
  const porcentaje = Math.min(Math.round(rawScore * 10) / 10, 100);

  return {
    porcentaje,
    detalle: {
      base: Math.round(baseCompat * 10) / 10,
      bridgeBonus: Math.round(bridgeBonus * 10) / 10,
      sharedBonus,
      sharedNotes,
    },
  };
}

// ── REGLAS DE SINERGIA ────────────────────────────────

const SYNERGY_DESCRIPTIONS = {
  [`${F.CITRICA}|${F.AMADERADA}`]: 'Frescura cítrica anclada en maderas nobles. Apertura vibrante con cierre cálido.',
  [`${F.CITRICA}|${F.ACUATICA}`]: 'Brisa mediterránea pura. Ligereza y frescura extrema.',
  [`${F.CITRICA}|${F.AROMATICA}`]: 'Energía herbácea electrizante. El combo del gentleman moderno.',
  [`${F.AMADERADA}|${F.ORIENTAL}`]: 'Profundidad opulenta. Maderas y especias crean un aura magnética.',
  [`${F.AMADERADA}|${F.CUERO}`]: 'Masculinidad refinada. Cuero noble sobre base de cedro.',
  [`${F.ORIENTAL}|${F.GOURMAND}`]: 'Dulzura oscura adictiva. Especias envueltas en miel y vainilla.',
  [`${F.ORIENTAL}|${F.CUERO}`]: 'Poder y misterio. El oud y el cuero se funden en algo magnético.',
  [`${F.FLORAL}|${F.CHIPRE}`]: 'Elegancia parisina atemporal. La rosa y el musgo de roble danzan.',
  [`${F.FLORAL}|${F.ORIENTAL}`]: 'Exotismo sensual. Flores blancas sobre especias orientales.',
  [`${F.ACUATICA}|${F.AROMATICA}`]: 'Costa azul en botella. Romero y sal marina, pura libertad.',
  [`${F.AROMATICA}|${F.FOUGERE}`]: 'El barbershop definitivo. Lavanda y hierbas en perfecta armonía.',
  [`${F.GOURMAND}|${F.ORIENTAL}`]: 'Adicción nocturna. Vainilla, tonka y ámbar sin remordimientos.',
  [`${F.FOUGERE}|${F.AMADERADA}`]: 'Sofisticación green. Helecho y madera, lo clásico reinventado.',
  [`${F.CHIPRE}|${F.AMADERADA}`]: 'Nobleza mineral. Musgo de roble y cedro, elegancia extrema.',
};

/**
 * Obtiene la descripción de sinergia entre familias.
 */
export function getSynergyDescription(familias) {
  if (familias.length < 2) return 'Perfume solo, sin sinergia de layering.';

  const uniqueFamilias = [...new Set(familias)];
  if (uniqueFamilias.length === 1) {
    return `Sinergia homogénea: doble potencia de la familia ${uniqueFamilias[0]}. Amplificación directa.`;
  }

  // Buscar descripción para el par principal
  for (let i = 0; i < uniqueFamilias.length; i++) {
    for (let j = i + 1; j < uniqueFamilias.length; j++) {
      const key1 = `${uniqueFamilias[i]}|${uniqueFamilias[j]}`;
      const key2 = `${uniqueFamilias[j]}|${uniqueFamilias[i]}`;
      const desc = SYNERGY_DESCRIPTIONS[key1] || SYNERGY_DESCRIPTIONS[key2];
      if (desc) return desc;
    }
  }

  return `Fusión experimental de ${uniqueFamilias.join(' + ')}. Territorio olfativo inexplorado.`;
}

// ── REGLAS DE CONFLICTO ───────────────────────────────

const CONFLICT_PAIRS = [
  { families: [F.ACUATICA, F.GOURMAND], risk: 'alto', reason: 'Frescura marina choca con dulzura pesada' },
  { families: [F.ACUATICA, F.CUERO], risk: 'alto', reason: 'Ligereza acuática y pesadez del cuero son opuestos' },
  { families: [F.CITRICA, F.GOURMAND], risk: 'medio', reason: 'Puede resultar en exceso de dulzura artificial' },
  { families: [F.FLORAL, F.CUERO], risk: 'medio', reason: 'Combinación polarizante, requiere nota puente' },
];

/**
 * Evalúa el riesgo de conflicto entre familias.
 * @returns {{ riesgo: string, razon: string }}
 */
export function evaluateConflictRisk(familias) {
  const uniqueFamilias = [...new Set(familias)];

  for (const conflict of CONFLICT_PAIRS) {
    const [f1, f2] = conflict.families;
    if (uniqueFamilias.includes(f1) && uniqueFamilias.includes(f2)) {
      return { riesgo: conflict.risk, razon: conflict.reason };
    }
  }

  return { riesgo: 'bajo', razon: 'Sin conflictos químicos detectados' };
}
