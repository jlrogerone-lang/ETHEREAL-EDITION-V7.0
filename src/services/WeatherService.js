/**
 * ETHEREAL v8.0 OMNI — WEATHER SERVICE
 * =======================================
 * Clima → Recomendación olfativa.
 * Temperatura, humedad y estación influyen en la familia olfativa ideal.
 *
 * CAPA: TOOLS v3
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WEATHER_CACHE: '@ethereal/weather_cache',
  WEATHER_API_KEY: '@ethereal/weather_api_key',
};

// ── Mapeo Clima → Familia Olfativa ──

const CLIMATE_OLFACTORY_MAP = {
  hot_dry: {
    families: ['Cítrica', 'Acuática', 'Fresca'],
    reason: 'Clima cálido y seco: las notas frescas y acuáticas refrescan y no se evaporan demasiado rápido.',
  },
  hot_humid: {
    families: ['Cítrica', 'Fresca', 'Floral'],
    reason: 'Clima tropical: fragancias ligeras que no se vuelven empalagosas con la humedad.',
  },
  mild: {
    families: ['Floral', 'Chypre', 'Fougère'],
    reason: 'Clima templado: perfecto para compuestos equilibrados con buena sillage.',
  },
  cold: {
    families: ['Oriental', 'Amaderada', 'Gourmand'],
    reason: 'Clima frío: notas cálidas y envolventes que se potencian con el calor corporal.',
  },
  rainy: {
    families: ['Amaderada', 'Cuero', 'Chypre'],
    reason: 'Día lluvioso: notas terrosas que complementan el petrichor.',
  },
};

function classifyWeather(temp, humidity, description = '') {
  const desc = description.toLowerCase();

  if (desc.includes('rain') || desc.includes('lluvia') || desc.includes('pluie')) {
    return 'rainy';
  }
  if (temp >= 30 && humidity < 50) return 'hot_dry';
  if (temp >= 30 && humidity >= 50) return 'hot_humid';
  if (temp <= 10) return 'cold';
  return 'mild';
}

// ── API (OpenWeatherMap compatible) ──

async function fetchWeather(city = 'Madrid') {
  const apiKey = await AsyncStorage.getItem(KEYS.WEATHER_API_KEY);

  // Si no hay API key, usar datos estimados por estación
  if (!apiKey) {
    return getSeasonalEstimate();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return getSeasonalEstimate();
    }

    const weather = {
      city: data.name,
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather?.[0]?.description || '',
      icon: data.weather?.[0]?.icon || '',
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(KEYS.WEATHER_CACHE, JSON.stringify(weather));
    return weather;
  } catch (e) {
    // Fallback a cache o estimación estacional
    const cached = await AsyncStorage.getItem(KEYS.WEATHER_CACHE);
    if (cached) return JSON.parse(cached);
    return getSeasonalEstimate();
  }
}

function getSeasonalEstimate() {
  const month = new Date().getMonth();
  // Hemisferio norte
  if (month >= 5 && month <= 8) {
    return { city: 'Estimación', temp: 30, humidity: 45, description: 'sunny', icon: '', timestamp: Date.now() };
  }
  if (month >= 11 || month <= 1) {
    return { city: 'Estimación', temp: 8, humidity: 70, description: 'cold', icon: '', timestamp: Date.now() };
  }
  if (month >= 2 && month <= 4) {
    return { city: 'Estimación', temp: 18, humidity: 55, description: 'mild', icon: '', timestamp: Date.now() };
  }
  return { city: 'Estimación', temp: 22, humidity: 50, description: 'mild', icon: '', timestamp: Date.now() };
}

// ── Recomendación ──

async function getOlfactoryRecommendation(city) {
  const weather = await fetchWeather(city);
  const climate = classifyWeather(weather.temp, weather.humidity, weather.description);
  const mapping = CLIMATE_OLFACTORY_MAP[climate];

  return {
    weather,
    climate,
    recommendedFamilies: mapping.families,
    reason: mapping.reason,
  };
}

async function setApiKey(key) {
  await AsyncStorage.setItem(KEYS.WEATHER_API_KEY, key);
}

export {
  fetchWeather,
  getOlfactoryRecommendation,
  classifyWeather,
  setApiKey,
  getSeasonalEstimate,
};
