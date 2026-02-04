/**
 * ETHEREAL EDITION v7.0 - BASE DE DATOS DE REFERENTES NICHO
 * ===========================================================
 * 60 fragancias de nicho con precios reales de mercado.
 * Cada referente tiene notas clave que el algoritmo usa para emparejar
 * con combinaciones de layering del inventario del usuario.
 *
 * El ahorro fiscal se calcula: precioReferenteNiche - costeLayering
 */

import { createNicheReference, OlfactoryFamily } from './models';

const F = OlfactoryFamily;

const RAW_NICHE_REFERENCES = [
  // ── TOM FORD ────────────────────────────────────────
  { id: 'NICHE-TF-001', nombre: 'Tobacco Vanille', casa: 'Tom Ford', precioRetail: 350,
    familia: F.ORIENTAL, notasClave: ['tabaco', 'vainilla', 'haba tonka', 'cacao', 'especias'],
    descripcion: 'Tabaco dulce con vainilla cremosa. El estándar dorado del nicho oriental.' },

  { id: 'NICHE-TF-002', nombre: 'Oud Wood', casa: 'Tom Ford', precioRetail: 380,
    familia: F.AMADERADA, notasClave: ['oud', 'sándalo', 'vetiver', 'cardamomo', 'pimienta'],
    descripcion: 'Oud refinado y elegante. Madera oscura con toques especiados.' },

  { id: 'NICHE-TF-003', nombre: 'Tuscan Leather', casa: 'Tom Ford', precioRetail: 350,
    familia: F.CUERO, notasClave: ['cuero', 'frambuesa', 'azafrán', 'jazmín', 'ámbar'],
    descripcion: 'Cuero italiano noble. Opulencia pura en cada molécula.' },

  { id: 'NICHE-TF-004', nombre: 'Lost Cherry', casa: 'Tom Ford', precioRetail: 390,
    familia: F.GOURMAND, notasClave: ['cereza', 'almendra', 'rosa', 'sándalo', 'vainilla'],
    descripcion: 'Cereza oscura y almendra en un gourmand adictivo.' },

  { id: 'NICHE-TF-005', nombre: 'Neroli Portofino', casa: 'Tom Ford', precioRetail: 320,
    familia: F.CITRICA, notasClave: ['neroli', 'bergamota', 'limón', 'ámbar', 'almizcle'],
    descripcion: 'Costa Amalfitana embotellada. Cítricos mediterráneos de élite.' },

  { id: 'NICHE-TF-006', nombre: 'Black Orchid', casa: 'Tom Ford', precioRetail: 180,
    familia: F.ORIENTAL, notasClave: ['orquídea negra', 'chocolate', 'pachuli', 'vainilla', 'incienso'],
    descripcion: 'Oscuridad floral opulenta. Un clásico del nicho contemporáneo.' },

  // ── CREED ───────────────────────────────────────────
  { id: 'NICHE-CR-001', nombre: 'Aventus', casa: 'Creed', precioRetail: 435,
    familia: F.CHIPRE, notasClave: ['piña', 'abedul', 'almizcle', 'musgo de roble', 'ámbar gris'],
    descripcion: 'El rey del nicho masculino. Frescura frutal con base ahumada.' },

  { id: 'NICHE-CR-002', nombre: 'Green Irish Tweed', casa: 'Creed', precioRetail: 395,
    familia: F.AROMATICA, notasClave: ['iris', 'verbena', 'sándalo', 'ámbar gris', 'musgo'],
    descripcion: 'Praderas irlandesas. Frescura verde aristocrática.' },

  { id: 'NICHE-CR-003', nombre: 'Silver Mountain Water', casa: 'Creed', precioRetail: 395,
    familia: F.ACUATICA, notasClave: ['bergamota', 'mandarina', 'grosella negra', 'sándalo', 'almizcle'],
    descripcion: 'Agua de montaña alpina. Frescura cristalina absoluta.' },

  { id: 'NICHE-CR-004', nombre: 'Royal Oud', casa: 'Creed', precioRetail: 445,
    familia: F.AMADERADA, notasClave: ['oud', 'cedro', 'pimienta rosa', 'limón', 'gaiac'],
    descripcion: 'Oud real para la realeza. Madera y especias sin concesiones.' },

  // ── MAISON FRANCIS KURKDJIAN ────────────────────────
  { id: 'NICHE-MFK-001', nombre: 'Baccarat Rouge 540', casa: 'MFK', precioRetail: 325,
    familia: F.ORIENTAL, notasClave: ['azafrán', 'jazmín', 'amberwood', 'cedro', 'almizcle'],
    descripcion: 'El fenómeno del siglo. Cristal y ámbar en un aura magnética.' },

  { id: 'NICHE-MFK-002', nombre: 'Grand Soir', casa: 'MFK', precioRetail: 295,
    familia: F.ORIENTAL, notasClave: ['ámbar', 'vainilla', 'benzoe', 'labdanum', 'incienso'],
    descripcion: 'La noche grande. Ámbar absoluto, cálido y envolvente.' },

  { id: 'NICHE-MFK-003', nombre: 'Oud Satin Mood', casa: 'MFK', precioRetail: 355,
    familia: F.ORIENTAL, notasClave: ['oud', 'rosa búlgara', 'vainilla', 'benzoe', 'violeta'],
    descripcion: 'Oud rosa sedoso. Oriente Medio refinado por manos francesas.' },

  { id: 'NICHE-MFK-004', nombre: 'Aqua Universalis', casa: 'MFK', precioRetail: 245,
    familia: F.CITRICA, notasClave: ['bergamota', 'limón', 'lily', 'almizcle blanco', 'cedro'],
    descripcion: 'Agua universal. La frescura limpia elevada a arte.' },

  // ── LE LABO ─────────────────────────────────────────
  { id: 'NICHE-LL-001', nombre: 'Santal 33', casa: 'Le Labo', precioRetail: 290,
    familia: F.AMADERADA, notasClave: ['sándalo', 'cardamomo', 'cuero', 'violeta', 'cedro'],
    descripcion: 'El sándalo definitivo. Maderas y cuero en armonía cruda.' },

  { id: 'NICHE-LL-002', nombre: 'Rose 31', casa: 'Le Labo', precioRetail: 290,
    familia: F.FLORAL, notasClave: ['rosa', 'comino', 'cedro', 'ámbar', 'gaiac'],
    descripcion: 'Rosa para hombres. Pétalos sobre madera oscura y comino.' },

  { id: 'NICHE-LL-003', nombre: 'Another 13', casa: 'Le Labo', precioRetail: 310,
    familia: F.AMADERADA, notasClave: ['ambroxan', 'almizcle', 'jazmín', 'musgo', 'pera'],
    descripcion: 'Molécula pura amplificada. Almizcle y ambroxan hipnótico.' },

  // ── AMOUAGE ─────────────────────────────────────────
  { id: 'NICHE-AM-001', nombre: 'Interlude Man', casa: 'Amouage', precioRetail: 330,
    familia: F.ORIENTAL, notasClave: ['incienso', 'oregano', 'ámbar', 'oud', 'labdanum'],
    descripcion: 'Caos controlado. Incienso omaní con especias en llamas.' },

  { id: 'NICHE-AM-002', nombre: 'Reflection Man', casa: 'Amouage', precioRetail: 320,
    familia: F.FLORAL, notasClave: ['jazmín', 'neroli', 'romero', 'sándalo', 'cedro'],
    descripcion: 'Elegancia floral masculina extrema. Jazmín sobre maderas nobles.' },

  { id: 'NICHE-AM-003', nombre: 'Jubilation XXV', casa: 'Amouage', precioRetail: 375,
    familia: F.ORIENTAL, notasClave: ['olíbano', 'labdanum', 'musgo', 'almizcle', 'oud', 'orchidea'],
    descripcion: 'Celebración de Arabia. La perfumería de Oriente en su máxima expresión.' },

  // ── PARFUMS DE MARLY ────────────────────────────────
  { id: 'NICHE-PDM-001', nombre: 'Layton', casa: 'Parfums de Marly', precioRetail: 305,
    familia: F.ORIENTAL, notasClave: ['manzana', 'lavanda', 'cardamomo', 'vainilla', 'sándalo'],
    descripcion: 'Manzana especiada sobre vainilla. El best-seller del nicho accesible.' },

  { id: 'NICHE-PDM-002', nombre: 'Herod', casa: 'Parfums de Marly', precioRetail: 305,
    familia: F.GOURMAND, notasClave: ['canela', 'tabaco', 'vainilla', 'oud', 'vetiver'],
    descripcion: 'Tabaco y especias dulces. Masculinidad clásica elevada.' },

  { id: 'NICHE-PDM-003', nombre: 'Pegasus', casa: 'Parfums de Marly', precioRetail: 305,
    familia: F.ORIENTAL, notasClave: ['almendra', 'vainilla', 'sándalo', 'ámbar', 'bergamota'],
    descripcion: 'Almendra y vainilla cremosas. El vuelo del caballo alado.' },

  { id: 'NICHE-PDM-004', nombre: 'Sedley', casa: 'Parfums de Marly', precioRetail: 280,
    familia: F.CITRICA, notasClave: ['menta', 'bergamota', 'geranio', 'lavanda', 'sándalo'],
    descripcion: 'Frescura aristocrática. Menta y cítricos de la nobleza francesa.' },

  // ── XERJOFF ─────────────────────────────────────────
  { id: 'NICHE-XJ-001', nombre: 'Naxos', casa: 'Xerjoff', precioRetail: 290,
    familia: F.GOURMAND, notasClave: ['miel', 'tabaco', 'lavanda', 'canela', 'haba tonka', 'vainilla'],
    descripcion: 'Miel de tabaco siciliano. Dulzura mediterránea con cuerpo.' },

  { id: 'NICHE-XJ-002', nombre: 'Erba Pura', casa: 'Xerjoff', precioRetail: 280,
    familia: F.CITRICA, notasClave: ['naranja', 'bergamota', 'mandarina', 'almizcle blanco', 'ámbar'],
    descripcion: 'Hierba pura en forma líquida. Frescura frutal radiante.' },

  { id: 'NICHE-XJ-003', nombre: 'Alexandria II', casa: 'Xerjoff', precioRetail: 420,
    familia: F.ORIENTAL, notasClave: ['almizcle', 'ámbar', 'sándalo', 'vainilla', 'rosa'],
    descripcion: 'La Alejandría antigua en perfume. Opulencia total.' },

  // ── INITIO ──────────────────────────────────────────
  { id: 'NICHE-IN-001', nombre: 'Oud for Greatness', casa: 'Initio', precioRetail: 340,
    familia: F.AMADERADA, notasClave: ['oud', 'lavanda', 'azafrán', 'almizcle', 'nuez moscada'],
    descripcion: 'Oud para la grandeza. Madera oscura con lavanda aristocrática.' },

  { id: 'NICHE-IN-002', nombre: 'Side Effect', casa: 'Initio', precioRetail: 340,
    familia: F.GOURMAND, notasClave: ['tabaco', 'vainilla', 'ron', 'canela', 'haba tonka'],
    descripcion: 'El efecto secundario del placer. Tabaco empapado en ron y vainilla.' },

  { id: 'NICHE-IN-003', nombre: 'Rehab', casa: 'Initio', precioRetail: 310,
    familia: F.AROMATICA, notasClave: ['lavanda', 'salvia', 'ámbar', 'almizcle', 'sándalo'],
    descripcion: 'Rehabilitación olfativa. Lavanda cremosa y sándalo en terapia.' },

  // ── ROJA DOVE ───────────────────────────────────────
  { id: 'NICHE-RD-001', nombre: 'Elysium', casa: 'Roja Dove', precioRetail: 395,
    familia: F.CITRICA, notasClave: ['pomelo', 'bergamota', 'pimienta rosa', 'jazmín', 'cedro', 'ámbar'],
    descripcion: 'El Elíseo en botella. Cítricos nobles con fondo ambarado.' },

  { id: 'NICHE-RD-002', nombre: 'Enigma Pour Homme', casa: 'Roja Dove', precioRetail: 450,
    familia: F.ORIENTAL, notasClave: ['cardamomo', 'incienso', 'oud', 'ámbar', 'sándalo'],
    descripcion: 'Enigma resuelto en oud e incienso. Opulencia británica pura.' },

  // ── NISHANE ─────────────────────────────────────────
  { id: 'NICHE-NS-001', nombre: 'Hacivat', casa: 'Nishane', precioRetail: 240,
    familia: F.CHIPRE, notasClave: ['piña', 'pomelo', 'pachuli', 'musgo de roble', 'sándalo'],
    descripcion: 'El Aventus turco. Piña ahumada sobre base de musgo.' },

  { id: 'NICHE-NS-002', nombre: 'Ani', casa: 'Nishane', precioRetail: 240,
    familia: F.ORIENTAL, notasClave: ['cardamomo', 'rosa', 'vainilla', 'haba tonka', 'ámbar'],
    descripcion: 'Cardamomo y vainilla en danza turca. Calidez eterna.' },

  // ── BYREDO ──────────────────────────────────────────
  { id: 'NICHE-BY-001', nombre: 'Gypsy Water', casa: 'Byredo', precioRetail: 250,
    familia: F.AMADERADA, notasClave: ['bergamota', 'pimienta', 'sándalo', 'vainilla', 'pino'],
    descripcion: 'Agua gitana. Nómada en forma de fragancia.' },

  { id: 'NICHE-BY-002', nombre: "Bal d'Afrique", casa: 'Byredo', precioRetail: 250,
    familia: F.FLORAL, notasClave: ['bergamota', 'neroli', 'violeta', 'cedro', 'vetiver', 'almizcle'],
    descripcion: 'El baile africano. Neroli y cedro bajo sol tropical.' },

  { id: 'NICHE-BY-003', nombre: 'Mojave Ghost', casa: 'Byredo', precioRetail: 250,
    familia: F.AMADERADA, notasClave: ['ambretta', 'magnolia', 'sándalo', 'cedro', 'almizcle'],
    descripcion: 'Fantasma del desierto. Maderas fantasmales y flor del Mojave.' },

  // ── DIPTYQUE ────────────────────────────────────────
  { id: 'NICHE-DI-001', nombre: 'Tam Dao', casa: 'Diptyque', precioRetail: 185,
    familia: F.AMADERADA, notasClave: ['sándalo', 'ciprés', 'cedro', 'almizcle', 'rosa'],
    descripcion: 'Templo de sándalo. Madera sagrada en su forma más pura.' },

  { id: 'NICHE-DI-002', nombre: 'Philosykos', casa: 'Diptyque', precioRetail: 175,
    familia: F.AROMATICA, notasClave: ['higuera', 'leche de higo', 'cedro', 'coco'],
    descripcion: 'Higuera griega al atardecer. Leche vegetal y madera.' },

  // ── MEMO PARIS ──────────────────────────────────────
  { id: 'NICHE-MP-001', nombre: 'African Leather', casa: 'Memo Paris', precioRetail: 310,
    familia: F.CUERO, notasClave: ['cuero', 'azafrán', 'oud', 'geranio', 'cardamomo'],
    descripcion: 'Cuero africano salvaje. Safaris y fuego bajo estrellas.' },

  // ── PENHALIGON'S ────────────────────────────────────
  { id: 'NICHE-PH-001', nombre: 'Halfeti', casa: "Penhaligon's", precioRetail: 280,
    familia: F.ORIENTAL, notasClave: ['oud', 'rosa', 'azafrán', 'bergamota', 'cuero'],
    descripcion: 'La rosa de Halfeti, la más negra. Oud turco de Penhaligon.' },

  // ── MANCERA ─────────────────────────────────────────
  { id: 'NICHE-MC-001', nombre: 'Red Tobacco', casa: 'Mancera', precioRetail: 165,
    familia: F.ORIENTAL, notasClave: ['tabaco', 'canela', 'azafrán', 'oud', 'vainilla', 'pachuli'],
    descripcion: 'Tabaco rojo especiado. Potencia árabe a precio accesible.' },

  { id: 'NICHE-MC-002', nombre: 'Cedrat Boisé', casa: 'Mancera', precioRetail: 155,
    familia: F.CITRICA, notasClave: ['limón', 'pimienta negra', 'frutas', 'cedro', 'pachuli', 'cuero'],
    descripcion: 'Cítrico boisé con cuero. El Aventus del pueblo.' },

  // ── MONTALE ─────────────────────────────────────────
  { id: 'NICHE-MT-001', nombre: 'Intense Café', casa: 'Montale', precioRetail: 155,
    familia: F.GOURMAND, notasClave: ['café', 'rosa', 'vainilla', 'ámbar', 'almizcle blanco'],
    descripcion: 'Café y rosa. El latte de lujo embotellado.' },

  { id: 'NICHE-MT-002', nombre: 'Chocolate Greedy', casa: 'Montale', precioRetail: 155,
    familia: F.GOURMAND, notasClave: ['cacao', 'vainilla', 'haba tonka', 'café', 'naranja seca'],
    descripcion: 'Adicción de chocolate. Para los golosos del nicho.' },

  // ── ACQUA DI PARMA ─────────────────────────────────
  { id: 'NICHE-ADP-001', nombre: 'Colonia', casa: 'Acqua di Parma', precioRetail: 165,
    familia: F.CITRICA, notasClave: ['bergamota', 'lavanda', 'romero', 'vetiver', 'sándalo', 'pachuli'],
    descripcion: 'La colonia italiana definitiva. Elegancia citrica desde 1916.' },

  { id: 'NICHE-ADP-002', nombre: 'Oud', casa: 'Acqua di Parma', precioRetail: 295,
    familia: F.AMADERADA, notasClave: ['oud', 'sándalo', 'pachuli', 'ámbar', 'cuero'],
    descripcion: 'Oud con alma italiana. Oriente Medio pasado por Roma.' },

  // ── TIZIANA TERENZI ─────────────────────────────────
  { id: 'NICHE-TT-001', nombre: 'Kirke', casa: 'Tiziana Terenzi', precioRetail: 290,
    familia: F.FLORAL, notasClave: ['grosella', 'frambuesa', 'rosa', 'pachuli', 'almizcle', 'vainilla'],
    descripcion: 'La hechicera. Frutas rojas y rosa en un hechizo almizclado.' },

  // ── CLIVE CHRISTIAN ─────────────────────────────────
  { id: 'NICHE-CC-001', nombre: 'No. 1 Masculine', casa: 'Clive Christian', precioRetail: 850,
    familia: F.ORIENTAL, notasClave: ['bergamota', 'lima', 'cardamomo', 'sándalo', 'cedro', 'vainilla'],
    descripcion: 'El perfume más caro del mundo. Lujo sin límites ni perdón.' },

  // ── FREDERIC MALLE ──────────────────────────────────
  { id: 'NICHE-FM-001', nombre: 'Portrait of a Lady', casa: 'Frédéric Malle', precioRetail: 310,
    familia: F.ORIENTAL, notasClave: ['rosa turca', 'pachuli', 'incienso', 'sándalo', 'ámbar'],
    descripcion: 'El retrato. Rosa oscura sobre pachuli e incienso.' },

  { id: 'NICHE-FM-002', nombre: 'Musc Ravageur', casa: 'Frédéric Malle', precioRetail: 265,
    familia: F.ORIENTAL, notasClave: ['almizcle', 'ámbar', 'vainilla', 'canela', 'lavanda'],
    descripcion: 'Almizcle devastador. La bestia almizclada del nicho.' },

  // ── KILIAN ──────────────────────────────────────────
  { id: 'NICHE-KI-001', nombre: 'Angels\' Share', casa: 'Kilian', precioRetail: 295,
    familia: F.GOURMAND, notasClave: ['cognac', 'canela', 'praline', 'roble', 'haba tonka', 'sándalo'],
    descripcion: 'La parte de los ángeles. Cognac y praline en barrica de roble.' },

  { id: 'NICHE-KI-002', nombre: 'Good Girl Gone Bad', casa: 'Kilian', precioRetail: 275,
    familia: F.FLORAL, notasClave: ['rosa', 'jazmín', 'nardo', 'osmanthus', 'cedro', 'almizcle'],
    descripcion: 'La buena que se fue al lado oscuro. Flores blancas sin inocencia.' },

  // ── BOND NO. 9 ──────────────────────────────────────
  { id: 'NICHE-BN-001', nombre: 'New York Oud', casa: 'Bond No. 9', precioRetail: 420,
    familia: F.AMADERADA, notasClave: ['oud', 'rosa', 'incienso', 'pachuli', 'ámbar'],
    descripcion: 'Oud de Manhattan. Oriente Medio en la Quinta Avenida.' },

  // ── FLORIS ──────────────────────────────────────────
  { id: 'NICHE-FL-001', nombre: 'Honey Oud', casa: 'Floris', precioRetail: 200,
    familia: F.ORIENTAL, notasClave: ['miel', 'oud', 'rosa', 'almizcle', 'ámbar'],
    descripcion: 'Miel y oud londinense. Dulzura y madera de la Corona.' },

  // ── PROFUMUM ROMA ───────────────────────────────────
  { id: 'NICHE-PR-001', nombre: 'Fumidus', casa: 'Profumum Roma', precioRetail: 275,
    familia: F.AROMATICA, notasClave: ['lavanda', 'incienso', 'mirra', 'cedro', 'ámbar'],
    descripcion: 'Humo sagrado romano. Incienso y lavanda de los dioses.' },

  // ── JOVOY ───────────────────────────────────────────
  { id: 'NICHE-JV-001', nombre: 'Psychédélique', casa: 'Jovoy', precioRetail: 230,
    familia: F.AMADERADA, notasClave: ['oud', 'cannabis', 'incienso', 'sándalo', 'cedro'],
    descripcion: 'Viaje psicodélico. Maderas y resinas en un trip olfativo.' },
];

export const NICHE_REFERENCES = RAW_NICHE_REFERENCES.map(raw =>
  createNicheReference(raw)
);

/** Mapa rápido por ID */
export const NICHE_MAP = Object.freeze(
  NICHE_REFERENCES.reduce((map, n) => { map[n.id] = n; return map; }, {})
);

/** Obtener referente por ID */
export function getNicheById(id) {
  return NICHE_MAP[id] || null;
}

/** Filtrar referentes por familia */
export function getNicheByFamily(familia) {
  return NICHE_REFERENCES.filter(n => n.familia === familia);
}

/** Filtrar referentes por rango de precio */
export function getNicheByPriceRange(min, max) {
  return NICHE_REFERENCES.filter(n => n.precioRetail >= min && n.precioRetail <= max);
}

/**
 * Calcula el "score de emulación" entre un set de notas de layering
 * y un referente nicho. Cuantas más notas clave del nicho están presentes
 * en el layering, mayor es el score.
 *
 * @param {string[]} layeringNotes - Todas las notas del combo layering (lowercase)
 * @param {object} nicheRef - Referente nicho
 * @returns {number} 0-100 score de emulación
 */
export function calculateEmulationScore(layeringNotes, nicheRef) {
  const layeringSet = new Set(layeringNotes.map(n => n.toLowerCase()));
  let matches = 0;

  for (const notaClave of nicheRef.notasClave) {
    const notaLower = notaClave.toLowerCase();
    // Buscar coincidencia parcial (ej: "vainilla" match con "vainilla de madagascar")
    const found = [...layeringSet].some(n => n.includes(notaLower) || notaLower.includes(n));
    if (found) matches++;
  }

  // Score base: % de notas clave del nicho que están presentes
  const baseScore = (matches / nicheRef.notasClave.length) * 100;

  // Bonus si coincide la familia
  return Math.min(Math.round(baseScore * 10) / 10, 100);
}

/**
 * Encuentra los N mejores referentes nicho para un conjunto de notas de layering.
 * @param {string[]} layeringNotes - Notas combinadas del layering
 * @param {string} familiaPreferida - Familia olfativa del combo (opcional)
 * @param {number} topN - Cuántos devolver
 * @returns {Array<{ reference: object, score: number }>}
 */
export function findBestNicheMatches(layeringNotes, familiaPreferida = null, topN = 3) {
  const scored = NICHE_REFERENCES.map(ref => {
    let score = calculateEmulationScore(layeringNotes, ref);

    // Bonus +10 si la familia coincide
    if (familiaPreferida && ref.familia === familiaPreferida) {
      score = Math.min(score + 10, 100);
    }

    return { reference: ref, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN);
}

/** Precio medio de los referentes nicho */
export function getAverageNichePrice() {
  const total = NICHE_REFERENCES.reduce((sum, n) => sum + n.precioRetail, 0);
  return Math.round(total / NICHE_REFERENCES.length);
}
