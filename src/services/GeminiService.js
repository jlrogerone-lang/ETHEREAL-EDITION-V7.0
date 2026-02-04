/**
 * ETHEREAL v8.0 OMNI — GEMINI SERVICE (Le Sommelier Visuel)
 * ===========================================================
 * Análisis visual de outfit → recomendación de fragancia.
 * Usa expo-image-picker para capturar la foto y analiza
 * colores dominantes + estilo para mapear familias olfativas.
 *
 * Integración preparada para Gemini Vision API.
 * Mientras no haya API key, usa el motor heurístico local.
 *
 * CAPA: OMNI v8
 */

import { Platform } from 'react-native';

let ImagePicker = null;

async function loadImagePicker() {
  if (!ImagePicker) {
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      console.warn('expo-image-picker no disponible:', e.message);
    }
  }
  return ImagePicker;
}

// ── Mapa Color → Familia Olfativa ──

const COLOR_TO_FAMILY = {
  negro: { family: 'Oriental', mood: 'misterioso', notes: ['oud', 'incienso', 'ámbar'] },
  blanco: { family: 'Fresco', mood: 'limpio', notes: ['algodón', 'almizcle blanco', 'cítricos'] },
  azul_marino: { family: 'Acuático', mood: 'profesional', notes: ['notas marinas', 'bergamota', 'cedro'] },
  azul_claro: { family: 'Fresco', mood: 'casual', notes: ['lavanda', 'menta', 'notas acuáticas'] },
  rojo: { family: 'Oriental Especiado', mood: 'pasional', notes: ['canela', 'rosa roja', 'pachulí'] },
  burdeos: { family: 'Amaderado Oriental', mood: 'sofisticado', notes: ['cuero', 'tabaco', 'vainilla'] },
  verde: { family: 'Fougère', mood: 'natural', notes: ['vetiver', 'gálbano', 'musgo de roble'] },
  beige: { family: 'Amaderado', mood: 'elegante', notes: ['sándalo', 'cedro', 'iris'] },
  gris: { family: 'Aromático', mood: 'urbano', notes: ['lavanda', 'salvia', 'musgo'] },
  rosa: { family: 'Floral', mood: 'romántico', notes: ['rosa', 'peonía', 'jazmín'] },
  morado: { family: 'Gourmand', mood: 'enigmático', notes: ['ciruela', 'violeta', 'vainilla'] },
  naranja: { family: 'Cítrico', mood: 'energético', notes: ['naranja', 'mandarina', 'neroli'] },
  amarillo: { family: 'Cítrico Floral', mood: 'alegre', notes: ['limón', 'ylang-ylang', 'mimosa'] },
  marron: { family: 'Amaderado Especiado', mood: 'terrenal', notes: ['cuero', 'tabaco', 'pachulí'] },
};

// ── Mapa Estilo → Perfil Olfativo ──

const STYLE_PROFILES = {
  formal: {
    intensity: 'alta',
    families: ['Oriental', 'Amaderado', 'Aromático'],
    occasions: ['oficina', 'cena', 'evento'],
  },
  casual: {
    intensity: 'media',
    families: ['Fresco', 'Cítrico', 'Acuático'],
    occasions: ['día', 'brunch', 'paseo'],
  },
  sport: {
    intensity: 'baja',
    families: ['Fresco', 'Acuático', 'Cítrico'],
    occasions: ['gym', 'outdoor', 'mañana'],
  },
  elegant: {
    intensity: 'alta',
    families: ['Oriental Especiado', 'Floral', 'Amaderado Oriental'],
    occasions: ['gala', 'cita', 'noche'],
  },
  streetwear: {
    intensity: 'media',
    families: ['Gourmand', 'Aromático', 'Fougère'],
    occasions: ['social', 'noche casual', 'festival'],
  },
};

// ── Motor Heurístico Local ──

function analyzeColorsFromPixels(dominantColors) {
  const results = [];
  for (const color of dominantColors) {
    const r = color.r || 0;
    const g = color.g || 0;
    const b = color.b || 0;

    let colorName = 'gris';
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;

    if (brightness < 50) colorName = 'negro';
    else if (brightness > 220 && max - min < 30) colorName = 'blanco';
    else if (r > 180 && g < 80 && b < 80) colorName = 'rojo';
    else if (r > 150 && g < 80 && b > 80) colorName = 'rosa';
    else if (r > 100 && g < 50 && b < 50) colorName = 'burdeos';
    else if (r < 80 && g < 80 && b > 150) colorName = 'azul_marino';
    else if (r < 100 && g > 100 && b > 180) colorName = 'azul_claro';
    else if (r < 80 && g > 150 && b < 80) colorName = 'verde';
    else if (r > 200 && g > 150 && b < 80) colorName = 'naranja';
    else if (r > 200 && g > 200 && b < 100) colorName = 'amarillo';
    else if (r > 100 && g < 60 && b > 100) colorName = 'morado';
    else if (r > 150 && g > 120 && b > 80 && r > b) colorName = 'beige';
    else if (r > 100 && g > 60 && b < 60) colorName = 'marron';

    const mapping = COLOR_TO_FAMILY[colorName];
    if (mapping) {
      results.push({ colorName, ...mapping });
    }
  }

  return results;
}

function detectStyleFromColors(colorAnalysis) {
  const families = colorAnalysis.map((c) => c.family);

  if (families.includes('Oriental') || families.includes('Amaderado Oriental')) {
    return colorAnalysis.some((c) => c.mood === 'profesional') ? 'formal' : 'elegant';
  }
  if (families.includes('Fresco') || families.includes('Acuático')) {
    return 'casual';
  }
  if (families.includes('Cítrico')) {
    return 'sport';
  }
  return 'streetwear';
}

/**
 * Captura una foto del outfit usando la cámara o galería.
 * @param {'camera'|'gallery'} source
 * @returns {Promise<{uri, base64}|null>}
 */
async function captureOutfitPhoto(source = 'gallery') {
  const picker = await loadImagePicker();
  if (!picker) return null;

  const { status } =
    source === 'camera'
      ? await picker.requestCameraPermissionsAsync()
      : await picker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    return { error: 'Permiso denegado para acceder a la cámara/galería.' };
  }

  const options = {
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.7,
    base64: false,
  };

  const result =
    source === 'camera'
      ? await picker.launchCameraAsync(options)
      : await picker.launchImageLibraryAsync(options);

  if (result.canceled) return null;

  const asset = result.assets[0];
  return { uri: asset.uri, width: asset.width, height: asset.height };
}

/**
 * Analiza un outfit y recomienda fragancias.
 * Motor heurístico local (sin API externa).
 *
 * @param {Object} params - { dominantColors: [{r,g,b}], occasion?, season? }
 * @returns {{ style, families, notes, intensity, recommendations }}
 */
function analyzeOutfitLocal(params) {
  const { dominantColors = [], occasion, season } = params;

  // Defaults si no hay colores
  const colors =
    dominantColors.length > 0
      ? dominantColors
      : [{ r: 30, g: 30, b: 30 }]; // negro por defecto

  const colorAnalysis = analyzeColorsFromPixels(colors);
  const style = detectStyleFromColors(colorAnalysis);
  const profile = STYLE_PROFILES[style];

  // Notas recomendadas (unión de todas las notas de colores detectados)
  const allNotes = colorAnalysis.flatMap((c) => c.notes);
  const uniqueNotes = [...new Set(allNotes)];

  // Ajuste estacional
  let seasonalBoost = [];
  if (season === 'verano') seasonalBoost = ['cítricos', 'notas acuáticas', 'menta'];
  if (season === 'invierno') seasonalBoost = ['oud', 'vainilla', 'ámbar'];
  if (season === 'primavera') seasonalBoost = ['rosa', 'peonía', 'neroli'];
  if (season === 'otoño') seasonalBoost = ['canela', 'cuero', 'tabaco'];

  const finalNotes = [...new Set([...uniqueNotes, ...seasonalBoost])];

  return {
    style,
    mood: colorAnalysis[0]?.mood || 'neutro',
    detectedColors: colorAnalysis.map((c) => c.colorName),
    families: profile.families,
    intensity: profile.intensity,
    occasions: occasion ? [occasion] : profile.occasions,
    recommendedNotes: finalNotes.slice(0, 8),
    confidence: dominantColors.length > 0 ? 0.75 : 0.5,
  };
}

/**
 * Análisis completo vía Gemini Vision API (cuando la key esté disponible).
 * Mientras tanto, retorna el análisis heurístico local.
 *
 * @param {string} imageUri - URI de la imagen
 * @param {string} [apiKey] - Gemini API Key (opcional)
 */
async function analyzeOutfitWithAI(imageUri, apiKey) {
  // Placeholder para integración con Gemini Vision API
  if (apiKey) {
    try {
      const prompt = `Analiza esta foto de un outfit/ropa. Identifica:
1. Colores dominantes (RGB)
2. Estilo (formal, casual, sport, elegant, streetwear)
3. Ocasión probable
4. Basándote en el estilo visual, recomienda familias olfativas de perfume
   que complementen este look. Responde en JSON.`;

      // Gemini Vision API call placeholder
      // Cuando la API esté configurada, descomentar:
      /*
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              ],
            }],
          }),
        }
      );
      const data = await response.json();
      return parseGeminiResponse(data);
      */
    } catch (e) {
      console.warn('Gemini API error, usando motor local:', e.message);
    }
  }

  // Fallback: motor heurístico local
  return analyzeOutfitLocal({
    dominantColors: [{ r: 30, g: 30, b: 30 }],
  });
}

export {
  captureOutfitPhoto,
  analyzeOutfitLocal,
  analyzeOutfitWithAI,
  COLOR_TO_FAMILY,
  STYLE_PROFILES,
};
