/**
 * ETHEREAL v8.0 OMNI — SPOTIFY SERVICE
 * =======================================
 * Música → Recomendación olfativa.
 * Mapea géneros musicales y mood a familias olfativas.
 *
 * CAPA: TOOLS v3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SPOTIFY_TOKEN: '@ethereal/spotify_token',
  MUSIC_MOOD: '@ethereal/music_mood',
};

// ── Mapeo Género Musical → Familia Olfativa ──

const GENRE_OLFACTORY_MAP = {
  // Clásica y Jazz → Sofisticación
  classical: { families: ['Oriental', 'Chypre'], mood: 'Sofisticado', intensity: 'media' },
  jazz: { families: ['Amaderada', 'Oriental'], mood: 'Elegante', intensity: 'media' },
  opera: { families: ['Floral', 'Oriental'], mood: 'Dramático', intensity: 'alta' },

  // Pop y Dance → Energía
  pop: { families: ['Floral', 'Fresca'], mood: 'Energético', intensity: 'ligera' },
  dance: { families: ['Cítrica', 'Acuática'], mood: 'Vibrante', intensity: 'ligera' },
  electronic: { families: ['Acuática', 'Fresca'], mood: 'Moderno', intensity: 'ligera' },

  // Rock y Metal → Intensidad
  rock: { families: ['Cuero', 'Amaderada'], mood: 'Rebelde', intensity: 'alta' },
  metal: { families: ['Cuero', 'Oriental'], mood: 'Intenso', intensity: 'alta' },
  punk: { families: ['Cuero', 'Fougère'], mood: 'Provocador', intensity: 'alta' },

  // R&B y Soul → Sensualidad
  rnb: { families: ['Oriental', 'Gourmand'], mood: 'Sensual', intensity: 'media' },
  soul: { families: ['Floral', 'Oriental'], mood: 'Cálido', intensity: 'media' },

  // Hip-Hop y Trap → Poder
  hiphop: { families: ['Oriental', 'Amaderada'], mood: 'Poderoso', intensity: 'alta' },
  trap: { families: ['Oriental', 'Gourmand'], mood: 'Oscuro', intensity: 'alta' },

  // Ambient y Chill → Calma
  ambient: { families: ['Acuática', 'Fresca'], mood: 'Sereno', intensity: 'ligera' },
  chill: { families: ['Cítrica', 'Floral'], mood: 'Relajado', intensity: 'ligera' },
  lofi: { families: ['Amaderada', 'Fresca'], mood: 'Contemplativo', intensity: 'ligera' },

  // Latino y Flamenco → Pasión
  latin: { families: ['Oriental', 'Floral'], mood: 'Apasionado', intensity: 'media' },
  flamenco: { families: ['Cuero', 'Oriental'], mood: 'Ardiente', intensity: 'alta' },
  reggaeton: { families: ['Gourmand', 'Oriental'], mood: 'Festivo', intensity: 'media' },

  // Default
  other: { families: ['Floral', 'Amaderada'], mood: 'Versátil', intensity: 'media' },
};

// ── Análisis de Mood Musical ──

function analyzeMusicMood(genre, energy = 0.5, valence = 0.5) {
  const genreKey = genre?.toLowerCase().replace(/[^a-z]/g, '') || 'other';
  const mapping = GENRE_OLFACTORY_MAP[genreKey] || GENRE_OLFACTORY_MAP.other;

  // Ajustar recomendación por energía y valencia
  let adjustedFamilies = [...mapping.families];

  if (energy > 0.7) {
    // Alta energía → agregar notas frescas
    if (!adjustedFamilies.includes('Cítrica')) adjustedFamilies.push('Cítrica');
  } else if (energy < 0.3) {
    // Baja energía → agregar notas cálidas
    if (!adjustedFamilies.includes('Oriental')) adjustedFamilies.push('Oriental');
  }

  return {
    genre: genreKey,
    mood: mapping.mood,
    intensity: mapping.intensity,
    recommendedFamilies: adjustedFamilies.slice(0, 3),
    energy,
    valence,
  };
}

// ── Spotify API (requiere token OAuth) ──

async function getCurrentlyPlaying() {
  const token = await AsyncStorage.getItem(KEYS.SPOTIFY_TOKEN);
  if (!token) {
    return { playing: false, source: 'manual' };
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 204 || response.status === 401) {
      return { playing: false, source: 'spotify' };
    }

    const data = await response.json();
    if (!data.is_playing || !data.item) {
      return { playing: false, source: 'spotify' };
    }

    return {
      playing: true,
      source: 'spotify',
      track: data.item.name,
      artist: data.item.artists?.[0]?.name || 'Unknown',
      album: data.item.album?.name || '',
      genre: null, // Spotify track API doesn't include genre directly
    };
  } catch (e) {
    return { playing: false, source: 'spotify', error: e.message };
  }
}

// ── Recomendación por selección manual de mood ──

function getOlfactoryMoodFromManual(genre) {
  return analyzeMusicMood(genre);
}

async function setSpotifyToken(token) {
  await AsyncStorage.setItem(KEYS.SPOTIFY_TOKEN, token);
}

async function saveMoodPreference(mood) {
  await AsyncStorage.setItem(KEYS.MUSIC_MOOD, JSON.stringify(mood));
}

async function loadMoodPreference() {
  const raw = await AsyncStorage.getItem(KEYS.MUSIC_MOOD);
  return raw ? JSON.parse(raw) : null;
}

const AVAILABLE_GENRES = Object.keys(GENRE_OLFACTORY_MAP).filter(g => g !== 'other');

export {
  analyzeMusicMood,
  getCurrentlyPlaying,
  getOlfactoryMoodFromManual,
  setSpotifyToken,
  saveMoodPreference,
  loadMoodPreference,
  AVAILABLE_GENRES,
};
