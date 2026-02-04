/**
 * ETHEREAL v8.0 OMNI — DIARY SERVICE (Le Journal)
 * ==================================================
 * Diario olfativo: registra la fragancia usada cada día,
 * con notas personales, ocasión, clima y estado de ánimo.
 * Persistencia vía AsyncStorage con índice mensual.
 *
 * CAPA: LEGACY v4
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@ethereal/diary';

function dateKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Guarda una entrada de diario para una fecha.
 * @param {Object} entry - { perfumeId, perfumeName, casa, ocasion, clima, animo, notas, rating }
 * @param {Date} [date] - Fecha (default: hoy)
 */
async function saveEntry(entry, date) {
  const dk = dateKey(date);
  const record = {
    ...entry,
    fecha: dk,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(`${KEY_PREFIX}/entry/${dk}`, JSON.stringify(record));

  // Actualizar índice mensual
  const mk = monthKey(date);
  const indexRaw = await AsyncStorage.getItem(`${KEY_PREFIX}/index/${mk}`);
  const index = indexRaw ? JSON.parse(indexRaw) : [];
  if (!index.includes(dk)) {
    index.push(dk);
    index.sort();
    await AsyncStorage.setItem(`${KEY_PREFIX}/index/${mk}`, JSON.stringify(index));
  }

  return record;
}

/**
 * Obtiene la entrada de un día específico.
 */
async function getEntry(date) {
  const dk = dateKey(date);
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}/entry/${dk}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Obtiene todas las entradas de un mes.
 * @param {number} year
 * @param {number} month - 1-12
 */
async function getMonthEntries(year, month) {
  const mk = `${year}-${String(month).padStart(2, '0')}`;
  const indexRaw = await AsyncStorage.getItem(`${KEY_PREFIX}/index/${mk}`);
  const index = indexRaw ? JSON.parse(indexRaw) : [];

  const entries = [];
  for (const dk of index) {
    const raw = await AsyncStorage.getItem(`${KEY_PREFIX}/entry/${dk}`);
    if (raw) entries.push(JSON.parse(raw));
  }

  return entries;
}

/**
 * Obtiene las últimas N entradas.
 */
async function getRecentEntries(limit = 7) {
  const today = new Date();
  const entries = [];

  for (let i = 0; i < 60 && entries.length < limit; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const entry = await getEntry(d);
    if (entry) entries.push(entry);
  }

  return entries;
}

/**
 * Elimina la entrada de un día.
 */
async function deleteEntry(date) {
  const dk = dateKey(date);
  await AsyncStorage.removeItem(`${KEY_PREFIX}/entry/${dk}`);

  const mk = monthKey(date);
  const indexRaw = await AsyncStorage.getItem(`${KEY_PREFIX}/index/${mk}`);
  if (indexRaw) {
    const index = JSON.parse(indexRaw).filter((d) => d !== dk);
    await AsyncStorage.setItem(`${KEY_PREFIX}/index/${mk}`, JSON.stringify(index));
  }
}

/**
 * Estadísticas del diario: perfume más usado, racha, total entradas.
 */
async function getDiaryStats() {
  const recent = await getRecentEntries(90);
  const perfumeCount = {};

  for (const entry of recent) {
    const key = entry.perfumeId || entry.perfumeName;
    perfumeCount[key] = (perfumeCount[key] || 0) + 1;
  }

  const sorted = Object.entries(perfumeCount).sort((a, b) => b[1] - a[1]);
  const topPerfume = sorted.length > 0 ? { id: sorted[0][0], count: sorted[0][1] } : null;

  // Calcular racha actual
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const entry = await getEntry(d);
    if (entry) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalEntries: recent.length,
    topPerfume,
    currentStreak: streak,
    uniquePerfumes: Object.keys(perfumeCount).length,
  };
}

export {
  saveEntry,
  getEntry,
  getMonthEntries,
  getRecentEntries,
  deleteEntry,
  getDiaryStats,
};
