/**
 * ETHEREAL v8.0 OMNI — BATCH SERVICE (Le Vérificateur)
 * ======================================================
 * Verificador de códigos de lote de perfumes.
 * Decodifica fecha de fabricación, origen y autenticidad
 * a partir del batch code impreso en el frasco.
 *
 * CAPA: LEGACY v4
 */

// Patrones conocidos de batch codes por casa
const BATCH_PATTERNS = {
  CHANEL: {
    regex: /^(\d{4})$/,
    decode: (match) => {
      const code = match[1];
      const yearDigit = parseInt(code[0], 10);
      const baseYear = yearDigit >= 0 && yearDigit <= 5 ? 2020 : 2010;
      const year = baseYear + yearDigit;
      const month = parseInt(code.substring(1, 3), 10);
      return { year, month: Math.min(month, 12), origin: 'Francia' };
    },
  },
  DIOR: {
    regex: /^(\d[A-Z])(\d{2})$/,
    decode: (match) => {
      const yearCode = match[1][0];
      const year = 2020 + parseInt(yearCode, 10);
      const month = match[2] ? parseInt(match[2], 10) : null;
      return { year, month, origin: 'Francia' };
    },
  },
  'YVES SAINT LAURENT': {
    regex: /^([A-Z]{2})(\d{2})([A-Z]?)$/,
    decode: (match) => {
      const monthMap = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 9, K: 10, L: 11, M: 12 };
      const year = 2000 + parseInt(match[2], 10);
      const monthChar = match[1][1];
      const month = monthMap[monthChar] || null;
      return { year, month, origin: 'Francia' };
    },
  },
  GENERIC_NUMERIC: {
    regex: /^(\d{4,8})$/,
    decode: (match) => {
      const code = match[1];
      if (code.length >= 6) {
        const year = 2000 + parseInt(code.substring(0, 2), 10);
        const month = parseInt(code.substring(2, 4), 10);
        return { year, month: month <= 12 ? month : null, origin: 'Desconocido' };
      }
      return { year: null, month: null, origin: 'Desconocido' };
    },
  },
  GENERIC_ALPHA: {
    regex: /^([A-Z0-9]{3,12})$/,
    decode: () => ({ year: null, month: null, origin: 'Desconocido' }),
  },
};

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Decodifica un batch code.
 * @param {string} batchCode - El código de lote
 * @param {string} [house] - La casa de perfume (opcional, mejora la decodificación)
 * @returns {{ valid, year, month, monthName, origin, age, house, raw }}
 */
function decodeBatchCode(batchCode, house) {
  if (!batchCode || typeof batchCode !== 'string') {
    return { valid: false, error: 'Código de lote vacío o inválido' };
  }

  const clean = batchCode.trim().toUpperCase();
  const houseUpper = house ? house.toUpperCase() : null;

  // Intentar patrón específico de la casa primero
  if (houseUpper && BATCH_PATTERNS[houseUpper]) {
    const pattern = BATCH_PATTERNS[houseUpper];
    const match = clean.match(pattern.regex);
    if (match) {
      const decoded = pattern.decode(match);
      return formatResult(decoded, clean, houseUpper);
    }
  }

  // Intentar todos los patrones conocidos
  for (const [patternHouse, pattern] of Object.entries(BATCH_PATTERNS)) {
    if (patternHouse === houseUpper) continue;
    const match = clean.match(pattern.regex);
    if (match) {
      const decoded = pattern.decode(match);
      return formatResult(decoded, clean, patternHouse);
    }
  }

  return {
    valid: false,
    raw: clean,
    error: 'No se pudo decodificar el batch code. Formato no reconocido.',
  };
}

function formatResult(decoded, raw, house) {
  const now = new Date();
  const currentYear = now.getFullYear();
  let age = null;

  if (decoded.year) {
    age = currentYear - decoded.year;
    if (decoded.month && now.getMonth() + 1 < decoded.month) {
      age--;
    }
  }

  return {
    valid: true,
    year: decoded.year,
    month: decoded.month,
    monthName: decoded.month ? MONTH_NAMES[decoded.month] : null,
    origin: decoded.origin,
    age: age !== null ? Math.max(0, age) : null,
    house,
    raw,
    freshness: age !== null ? getFreshness(age) : 'desconocido',
  };
}

function getFreshness(age) {
  if (age <= 1) return 'excelente';
  if (age <= 3) return 'bueno';
  if (age <= 5) return 'aceptable';
  if (age <= 8) return 'maduro';
  return 'vintage';
}

/**
 * Obtiene las casas soportadas.
 */
function getSupportedHouses() {
  return Object.keys(BATCH_PATTERNS).filter(
    (k) => !k.startsWith('GENERIC')
  );
}

export {
  decodeBatchCode,
  getSupportedHouses,
  getFreshness,
};
