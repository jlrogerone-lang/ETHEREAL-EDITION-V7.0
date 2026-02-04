/**
 * ETHEREAL EDITION v7.0 - INVENTARIO DE 53 PERFUMES REALES
 * ==========================================================
 * Colección valorada en >6.500€.
 * Cada perfume incluye: familia olfativa, pirámide de notas, coste por atomización.
 *
 * Coste por atomización = (precioRetail / volumenMl) * 0.1ml por spray
 */

import { createPerfume, OlfactoryFamily } from './models';

const F = OlfactoryFamily;

const RAW_INVENTORY = [
  // ── HUGO BOSS (6) ────────────────────────────────────
  { id: 'BOSS-001', nombre: 'Boss Bottled', casa: 'Hugo Boss', familia: F.AMADERADA,
    subfamilia: 'Amaderada Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 85,
    notasTop: ['manzana', 'limón', 'bergamota', 'ciruela'],
    notasHeart: ['geranio', 'canela', 'clavo'],
    notasBase: ['sándalo', 'cedro', 'vainilla', 'vetiver'] },

  { id: 'BOSS-002', nombre: 'Boss Bottled Night', casa: 'Hugo Boss', familia: F.AMADERADA,
    subfamilia: 'Amaderada Oriental', concentracion: 'EDT', volumenMl: 100, precioRetail: 90,
    notasTop: ['lavanda', 'abedul'],
    notasHeart: ['violeta', 'davana', 'alcanfor'],
    notasBase: ['almizcle', 'madera de louro', 'oud sintético'] },

  { id: 'BOSS-003', nombre: 'Boss Bottled Infinite', casa: 'Hugo Boss', familia: F.AROMATICA,
    subfamilia: 'Aromática Amaderada', concentracion: 'EDP', volumenMl: 100, precioRetail: 95,
    notasTop: ['mandarina', 'manzana', 'canela'],
    notasHeart: ['pimienta', 'salvia esclarea', 'palo santo'],
    notasBase: ['sándalo', 'ciprés', 'olíbano'] },

  { id: 'BOSS-004', nombre: 'Boss The Scent', casa: 'Hugo Boss', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 92,
    notasTop: ['jengibre', 'mandarina', 'fruta de maninka'],
    notasHeart: ['lavanda', 'absoluto de maninka'],
    notasBase: ['cuero', 'pachuli', 'haba tonka'] },

  { id: 'BOSS-005', nombre: 'Boss The Scent Absolute', casa: 'Hugo Boss', familia: F.ORIENTAL,
    subfamilia: 'Oriental Amaderada', concentracion: 'EDP', volumenMl: 100, precioRetail: 110,
    notasTop: ['piña', 'jengibre'],
    notasHeart: ['osmanthus', 'lavanda'],
    notasBase: ['vainilla', 'cuero', 'vetiver'] },

  { id: 'BOSS-006', nombre: 'Hugo Man', casa: 'Hugo Boss', familia: F.AROMATICA,
    subfamilia: 'Aromática Verde', concentracion: 'EDT', volumenMl: 125, precioRetail: 78,
    notasTop: ['manzana verde', 'menta', 'lavanda'],
    notasHeart: ['geranio', 'salvia', 'aguja de abeto'],
    notasBase: ['musgo de roble', 'sándalo', 'cedro'] },

  // ── CHLOÉ (4) ────────────────────────────────────────
  { id: 'CHLO-001', nombre: 'Chloé Eau de Parfum', casa: 'Chloé', familia: F.FLORAL,
    subfamilia: 'Floral Empolvado', concentracion: 'EDP', volumenMl: 75, precioRetail: 115,
    notasTop: ['peonía', 'lichi', 'fresia'],
    notasHeart: ['rosa', 'magnolia', 'lirio del valle'],
    notasBase: ['cedro', 'ámbar', 'almizcle blanco'] },

  { id: 'CHLO-002', nombre: 'Chloé Nomade', casa: 'Chloé', familia: F.CHIPRE,
    subfamilia: 'Chypre Floral', concentracion: 'EDP', volumenMl: 75, precioRetail: 110,
    notasTop: ['bergamota', 'naranja', 'limón'],
    notasHeart: ['fresia', 'jazmín sambac', 'durazno'],
    notasBase: ['musgo de roble', 'ambroxan', 'sándalo'] },

  { id: 'CHLO-003', nombre: 'Chloé Love Story', casa: 'Chloé', familia: F.FLORAL,
    subfamilia: 'Floral Verde', concentracion: 'EDP', volumenMl: 75, precioRetail: 105,
    notasTop: ['flor de naranjo', 'bergamota', 'pera'],
    notasHeart: ['jazmín de Grasse', 'rosa damasco'],
    notasBase: ['cedro', 'iris', 'almizcle'] },

  { id: 'CHLO-004', nombre: "Chloé L'Eau", casa: 'Chloé', familia: F.CITRICA,
    subfamilia: 'Cítrica Floral', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['cítricos', 'toronja', 'flor de ciruelo'],
    notasHeart: ['rosa', 'pétalo de rosa'],
    notasBase: ['cedro', 'almizcle', 'ámbar gris'] },

  // ── GUCCI (5) ────────────────────────────────────────
  { id: 'GUCC-001', nombre: 'Gucci Guilty Pour Homme', casa: 'Gucci', familia: F.AROMATICA,
    subfamilia: 'Aromática Fougère', concentracion: 'EDT', volumenMl: 90, precioRetail: 98,
    notasTop: ['lavanda', 'limón', 'naranja amarga'],
    notasHeart: ['flor de naranjo', 'neroli'],
    notasBase: ['cedro', 'pachuli', 'ámbar'] },

  { id: 'GUCC-002', nombre: 'Gucci Guilty Absolute', casa: 'Gucci', familia: F.CUERO,
    subfamilia: 'Cuero Amaderado', concentracion: 'EDP', volumenMl: 90, precioRetail: 120,
    notasTop: ['norilas', 'ciprés'],
    notasHeart: ['madera de gaiac', 'vetiver'],
    notasBase: ['cuero', 'goldenwood', 'pachuli'] },

  { id: 'GUCC-003', nombre: 'Gucci Bloom', casa: 'Gucci', familia: F.FLORAL,
    subfamilia: 'Floral Blanco', concentracion: 'EDP', volumenMl: 100, precioRetail: 125,
    notasTop: ['jazmín sambac', 'nardo'],
    notasHeart: ['jazmín', 'nardo indio'],
    notasBase: ['rangoon creeper', 'almizcle', 'sándalo'] },

  { id: 'GUCC-004', nombre: 'Gucci Flora Gorgeous Gardenia', casa: 'Gucci', familia: F.FLORAL,
    subfamilia: 'Floral Frutal', concentracion: 'EDT', volumenMl: 100, precioRetail: 108,
    notasTop: ['pera', 'pomelo rosado'],
    notasHeart: ['gardenia', 'jazmín', 'frangipani'],
    notasBase: ['pachuli', 'azúcar moreno', 'almizcle'] },

  { id: 'GUCC-005', nombre: 'Gucci Pour Homme II', casa: 'Gucci', familia: F.AMADERADA,
    subfamilia: 'Amaderada Acuática', concentracion: 'EDT', volumenMl: 100, precioRetail: 88,
    notasTop: ['bergamota', 'violeta', 'pimienta negra'],
    notasHeart: ['canela', 'tabaco', 'jazmín'],
    notasBase: ['almizcle', 'ámbar', 'oud'] },

  // ── LACOSTE (5) ──────────────────────────────────────
  { id: 'LACO-001', nombre: 'Lacoste L.12.12 Blanc', casa: 'Lacoste', familia: F.ACUATICA,
    subfamilia: 'Acuática Aromática', concentracion: 'EDT', volumenMl: 100, precioRetail: 72,
    notasTop: ['pomelo', 'romero', 'cardamomo'],
    notasHeart: ['nardo', 'ylang-ylang'],
    notasBase: ['cedro', 'gamuza', 'coumarina'] },

  { id: 'LACO-002', nombre: 'Lacoste L.12.12 Noir', casa: 'Lacoste', familia: F.AMADERADA,
    subfamilia: 'Amaderada Oscura', concentracion: 'EDT', volumenMl: 100, precioRetail: 72,
    notasTop: ['lavanda', 'pimienta oscura'],
    notasHeart: ['chocolate', 'hoja de violeta'],
    notasBase: ['coumarina', 'madera oscura', 'cuero'] },

  { id: 'LACO-003', nombre: 'Lacoste Essential', casa: 'Lacoste', familia: F.CITRICA,
    subfamilia: 'Cítrica Verde', concentracion: 'EDT', volumenMl: 125, precioRetail: 68,
    notasTop: ['mandarina', 'bergamota', 'cassis'],
    notasHeart: ['pimienta rosa', 'rosa', 'lirio del valle'],
    notasBase: ['sándalo', 'pachuli', 'almizcle'] },

  { id: 'LACO-004', nombre: 'Lacoste Eau de Lacoste', casa: 'Lacoste', familia: F.AROMATICA,
    subfamilia: 'Aromática Fresca', concentracion: 'EDT', volumenMl: 100, precioRetail: 65,
    notasTop: ['pomelo', 'mandarina', 'manzana verde'],
    notasHeart: ['jazmín', 'pimienta rosa', 'lirio del valle'],
    notasBase: ['sándalo', 'gamuza', 'almizcle'] },

  { id: 'LACO-005', nombre: "Lacoste L'Homme", casa: 'Lacoste', familia: F.ACUATICA,
    subfamilia: 'Acuática Amaderada', concentracion: 'EDT', volumenMl: 100, precioRetail: 70,
    notasTop: ['mandarina', 'pimienta', 'pomelo'],
    notasHeart: ['jazmín', 'naranja amarga', 'notas acuáticas'],
    notasBase: ['madera de cachemira', 'ámbar gris', 'almizcle'] },

  // ── MARC JACOBS (3) ─────────────────────────────────
  { id: 'MARC-001', nombre: 'Marc Jacobs Daisy', casa: 'Marc Jacobs', familia: F.FLORAL,
    subfamilia: 'Floral Frutal', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['fresa silvestre', 'violeta', 'pomelo rojo'],
    notasHeart: ['gardenia', 'jazmín', 'rosa'],
    notasBase: ['almizcle blanco', 'vainilla', 'madera de cedro'] },

  { id: 'MARC-002', nombre: 'Marc Jacobs Decadence', casa: 'Marc Jacobs', familia: F.ORIENTAL,
    subfamilia: 'Oriental Amaderada', concentracion: 'EDP', volumenMl: 100, precioRetail: 118,
    notasTop: ['iris italiano', 'ciruela', 'azafrán'],
    notasHeart: ['rosa búlgara', 'jazmín', 'orquídea'],
    notasBase: ['ámbar', 'vetiver', 'papiro', 'madera de cedro'] },

  { id: 'MARC-003', nombre: 'Marc Jacobs Perfect', casa: 'Marc Jacobs', familia: F.FLORAL,
    subfamilia: 'Floral Almizclado', concentracion: 'EDP', volumenMl: 100, precioRetail: 108,
    notasTop: ['ruibarbo', 'narciso'],
    notasHeart: ['almendra', 'jazmín sambac', 'flor de azahar'],
    notasBase: ['cedro', 'almizcle de cachemira', 'ámbar'] },

  // ── VERSACE (3) ──────────────────────────────────────
  { id: 'VERS-001', nombre: 'Versace Pour Homme', casa: 'Versace', familia: F.ACUATICA,
    subfamilia: 'Acuática Aromática', concentracion: 'EDT', volumenMl: 100, precioRetail: 82,
    notasTop: ['neroli', 'bergamota', 'cítricos'],
    notasHeart: ['cedro azul', 'salvia', 'estragón'],
    notasBase: ['ámbar', 'almizcle', 'sándalo'] },

  { id: 'VERS-002', nombre: 'Versace Eros', casa: 'Versace', familia: F.ORIENTAL,
    subfamilia: 'Oriental Fresco', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['menta', 'manzana verde', 'limón'],
    notasHeart: ['haba tonka', 'ambrosía', 'geranio'],
    notasBase: ['vainilla', 'vetiver', 'musgo de roble', 'cedro'] },

  { id: 'VERS-003', nombre: 'Versace Dylan Blue', casa: 'Versace', familia: F.FOUGERE,
    subfamilia: 'Fougère Amaderada', concentracion: 'EDT', volumenMl: 100, precioRetail: 88,
    notasTop: ['bergamota', 'pomelo', 'agua'],
    notasHeart: ['violeta', 'pimienta negra', 'papiro', 'pachuli'],
    notasBase: ['almizcle', 'incienso', 'ambroxan', 'azafrán'] },

  // ── DOLCE & GABBANA (4) ─────────────────────────────
  { id: 'DG-001', nombre: 'Light Blue Pour Homme', casa: 'Dolce & Gabbana', familia: F.CITRICA,
    subfamilia: 'Cítrica Acuática', concentracion: 'EDT', volumenMl: 125, precioRetail: 92,
    notasTop: ['siciliano', 'mandarina', 'pomelo', 'enebro'],
    notasHeart: ['pimienta', 'romero', 'madera de rosa'],
    notasBase: ['almizcle', 'roble', 'incienso'] },

  { id: 'DG-002', nombre: 'The One for Men', casa: 'Dolce & Gabbana', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['pomelo', 'semilla de coriandro', 'albahaca'],
    notasHeart: ['cardamomo', 'jengibre', 'flor de naranjo'],
    notasBase: ['cedro', 'labdanum', 'ámbar'] },

  { id: 'DG-003', nombre: 'The One EDP', casa: 'Dolce & Gabbana', familia: F.ORIENTAL,
    subfamilia: 'Oriental Amaderada', concentracion: 'EDP', volumenMl: 100, precioRetail: 110,
    notasTop: ['pomelo', 'semilla de coriandro', 'albahaca'],
    notasHeart: ['cardamomo', 'jengibre', 'flor de naranjo'],
    notasBase: ['tabaco', 'ámbar', 'cedro', 'labdanum'] },

  { id: 'DG-004', nombre: 'K by Dolce & Gabbana', casa: 'Dolce & Gabbana', familia: F.AROMATICA,
    subfamilia: 'Aromática Especiada', concentracion: 'EDP', volumenMl: 100, precioRetail: 105,
    notasTop: ['sangre de dragón', 'enebro', 'cítricos'],
    notasHeart: ['geranio', 'clavo', 'pimienta'],
    notasBase: ['cedro', 'vetiver', 'pachuli'] },

  // ── PACO RABANNE (4) ────────────────────────────────
  { id: 'PACO-001', nombre: '1 Million', casa: 'Paco Rabanne', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['pomelo', 'menta', 'mandarina'],
    notasHeart: ['canela', 'rosa', 'absoluto de especias'],
    notasBase: ['cuero', 'ámbar', 'madera blanca'] },

  { id: 'PACO-002', nombre: '1 Million Lucky', casa: 'Paco Rabanne', familia: F.GOURMAND,
    subfamilia: 'Gourmand Amaderado', concentracion: 'EDT', volumenMl: 100, precioRetail: 92,
    notasTop: ['ciruela verde', 'ozono'],
    notasHeart: ['avellana', 'miel'],
    notasBase: ['cedro', 'pachuli', 'ámbar'] },

  { id: 'PACO-003', nombre: 'Invictus', casa: 'Paco Rabanne', familia: F.ACUATICA,
    subfamilia: 'Acuática Amaderada', concentracion: 'EDT', volumenMl: 100, precioRetail: 90,
    notasTop: ['pomelo', 'notas marinas', 'mandarina'],
    notasHeart: ['laurel', 'jazmín', 'hoja de violeta'],
    notasBase: ['guayaco', 'pachuli', 'ámbar gris', 'musgo de roble'] },

  { id: 'PACO-004', nombre: 'Phantom', casa: 'Paco Rabanne', familia: F.AROMATICA,
    subfamilia: 'Aromática Futurista', concentracion: 'EDT', volumenMl: 100, precioRetail: 98,
    notasTop: ['limón', 'lavanda'],
    notasHeart: ['manzana', 'haba tonka', 'almizcle'],
    notasBase: ['vainilla', 'lavanda creamy', 'madera de cachemira'] },

  // ── JEAN PAUL GAULTIER (3) ──────────────────────────
  { id: 'JPG-001', nombre: 'Le Male', casa: 'Jean Paul Gaultier', familia: F.FOUGERE,
    subfamilia: 'Fougère Oriental', concentracion: 'EDT', volumenMl: 125, precioRetail: 88,
    notasTop: ['menta', 'lavanda', 'bergamota', 'cardamomo'],
    notasHeart: ['canela', 'comino', 'flor de naranjo'],
    notasBase: ['vainilla', 'haba tonka', 'sándalo', 'ámbar'] },

  { id: 'JPG-002', nombre: 'Ultra Male', casa: 'Jean Paul Gaultier', familia: F.GOURMAND,
    subfamilia: 'Gourmand Oriental', concentracion: 'EDT Intense', volumenMl: 125, precioRetail: 105,
    notasTop: ['pera', 'bergamota', 'menta negra', 'limón'],
    notasHeart: ['lavanda', 'canela', 'salvia esclarea'],
    notasBase: ['vainilla', 'ámbar negro', 'pachuli'] },

  { id: 'JPG-003', nombre: 'Le Beau', casa: 'Jean Paul Gaultier', familia: F.GOURMAND,
    subfamilia: 'Gourmand Tropical', concentracion: 'EDT', volumenMl: 125, precioRetail: 92,
    notasTop: ['bergamota', 'coco'],
    notasHeart: ['haba tonka', 'ylang-ylang'],
    notasBase: ['sándalo', 'almizcle'] },

  // ── DIOR (3) ─────────────────────────────────────────
  { id: 'DIOR-001', nombre: 'Sauvage EDT', casa: 'Dior', familia: F.AROMATICA,
    subfamilia: 'Aromática Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 115,
    notasTop: ['pimienta de Sichuan', 'bergamota'],
    notasHeart: ['pimienta', 'lavanda', 'vetiver de Haití', 'geranio de Egipto'],
    notasBase: ['ambroxan', 'cedro', 'labdanum'] },

  { id: 'DIOR-002', nombre: 'Sauvage EDP', casa: 'Dior', familia: F.AMADERADA,
    subfamilia: 'Amaderada Especiada', concentracion: 'EDP', volumenMl: 100, precioRetail: 130,
    notasTop: ['bergamota', 'pimienta'],
    notasHeart: ['pimienta de Sichuan', 'lavanda', 'nuez moscada', 'estrella de anís'],
    notasBase: ['ambroxan', 'vainilla', 'cedro de Virginia'] },

  { id: 'DIOR-003', nombre: 'Dior Homme EDT', casa: 'Dior', familia: F.FLORAL,
    subfamilia: 'Floral Amaderado', concentracion: 'EDT', volumenMl: 100, precioRetail: 110,
    notasTop: ['lavanda', 'bergamota', 'salvia'],
    notasHeart: ['iris', 'cacao amargo', 'ámbar'],
    notasBase: ['vetiver', 'cuero', 'musgo'] },

  // ── CAROLINA HERRERA (3) ────────────────────────────
  { id: 'CH-001', nombre: '212 VIP Men', casa: 'Carolina Herrera', familia: F.ORIENTAL,
    subfamilia: 'Oriental Amaderada', concentracion: 'EDT', volumenMl: 100, precioRetail: 95,
    notasTop: ['maracuyá', 'lima', 'jengibre picante'],
    notasHeart: ['vodka', 'menta', 'pimienta del rey'],
    notasBase: ['ámbar', 'coriandro silvestre', 'madera preciosa'] },

  { id: 'CH-002', nombre: 'Bad Boy', casa: 'Carolina Herrera', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 98,
    notasTop: ['pimienta negra', 'pimienta blanca', 'bergamota'],
    notasHeart: ['salvia', 'cedro', 'canela'],
    notasBase: ['haba tonka', 'cacao', 'amberwood'] },

  { id: 'CH-003', nombre: 'Good Girl', casa: 'Carolina Herrera', familia: F.ORIENTAL,
    subfamilia: 'Oriental Floral', concentracion: 'EDP', volumenMl: 80, precioRetail: 120,
    notasTop: ['almendra', 'café'],
    notasHeart: ['nardo', 'jazmín sambac', 'rosa'],
    notasBase: ['haba tonka', 'cacao', 'sándalo'] },

  // ── YVES SAINT LAURENT (3) ──────────────────────────
  { id: 'YSL-001', nombre: 'Y Eau de Parfum', casa: 'Yves Saint Laurent', familia: F.AROMATICA,
    subfamilia: 'Aromática Amaderada', concentracion: 'EDP', volumenMl: 100, precioRetail: 112,
    notasTop: ['manzana', 'jengibre', 'bergamota'],
    notasHeart: ['salvia', 'geranio', 'enebro'],
    notasBase: ['amberwood', 'bálsamo de abeto', 'cedro', 'olíbano'] },

  { id: 'YSL-002', nombre: 'La Nuit de L\'Homme', casa: 'Yves Saint Laurent', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 105,
    notasTop: ['cardamomo', 'bergamota', 'lavanda'],
    notasHeart: ['cedro de Virginia', 'comino'],
    notasBase: ['vetiver', 'haba tonka', 'ámbar'] },

  { id: 'YSL-003', nombre: 'Libre', casa: 'Yves Saint Laurent', familia: F.FOUGERE,
    subfamilia: 'Fougère Floral', concentracion: 'EDP', volumenMl: 90, precioRetail: 118,
    notasTop: ['mandarina', 'grosella negra', 'lavanda'],
    notasHeart: ['flor de naranjo', 'jazmín'],
    notasBase: ['vainilla de Madagascar', 'cedro', 'almizcle'] },

  // ── GIORGIO ARMANI (3) ──────────────────────────────
  { id: 'ARM-001', nombre: 'Acqua di Giò', casa: 'Giorgio Armani', familia: F.ACUATICA,
    subfamilia: 'Acuática Marina', concentracion: 'EDT', volumenMl: 100, precioRetail: 98,
    notasTop: ['bergamota', 'neroli', 'mandarina verde', 'limón'],
    notasHeart: ['jazmín', 'calone', 'notas marinas', 'romero'],
    notasBase: ['cedro blanco', 'almizcle', 'ámbar', 'pachuli'] },

  { id: 'ARM-002', nombre: 'Acqua di Giò Profumo', casa: 'Giorgio Armani', familia: F.ACUATICA,
    subfamilia: 'Acuática Amaderada', concentracion: 'EDP', volumenMl: 75, precioRetail: 125,
    notasTop: ['bergamota', 'notas acuáticas', 'geranio'],
    notasHeart: ['romero', 'salvia esclarea', 'ciprés'],
    notasBase: ['ámbar', 'pachuli', 'incienso', 'musgo de roble'] },

  { id: 'ARM-003', nombre: 'Armani Code Absolu', casa: 'Giorgio Armani', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDP', volumenMl: 110, precioRetail: 130,
    notasTop: ['manzana verde', 'mandarina'],
    notasHeart: ['flor de naranjo', 'nuez moscada', 'cardamomo'],
    notasBase: ['haba tonka', 'suede', 'vainilla'] },

  // ── CALVIN KLEIN (3) ────────────────────────────────
  { id: 'CK-001', nombre: 'CK One', casa: 'Calvin Klein', familia: F.CITRICA,
    subfamilia: 'Cítrica Aromática', concentracion: 'EDT', volumenMl: 200, precioRetail: 65,
    notasTop: ['bergamota', 'cardamomo', 'limón', 'papaya', 'piña'],
    notasHeart: ['jazmín', 'violeta', 'rosa', 'nuez moscada'],
    notasBase: ['almizcle', 'sándalo', 'ámbar', 'cedro'] },

  { id: 'CK-002', nombre: 'Eternity for Men', casa: 'Calvin Klein', familia: F.FOUGERE,
    subfamilia: 'Fougère Aromática', concentracion: 'EDT', volumenMl: 100, precioRetail: 75,
    notasTop: ['lavanda', 'mandarina', 'salvia'],
    notasHeart: ['jazmín', 'albahaca', 'geranio'],
    notasBase: ['sándalo', 'ámbar', 'vetiver'] },

  { id: 'CK-003', nombre: 'Obsession for Men', casa: 'Calvin Klein', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 125, precioRetail: 70,
    notasTop: ['mandarina', 'bergamota', 'lavanda', 'lima'],
    notasHeart: ['nuez moscada', 'coriandro', 'pimienta roja', 'canela'],
    notasBase: ['ámbar', 'sándalo', 'vetiver', 'almizcle', 'vainilla'] },

  // ── MONTBLANC (1) ───────────────────────────────────
  { id: 'MONT-001', nombre: 'Explorer', casa: 'Montblanc', familia: F.AMADERADA,
    subfamilia: 'Amaderada Aromática', concentracion: 'EDP', volumenMl: 100, precioRetail: 85,
    notasTop: ['bergamota', 'pimienta rosa', 'salvia esclarea'],
    notasHeart: ['cuero', 'vetiver de Haití'],
    notasBase: ['cacao', 'pachuli de Indonesia', 'akigalawood'] },

  // ── AZZARO (2) ──────────────────────────────────────
  { id: 'AZZ-001', nombre: 'Azzaro Wanted', casa: 'Azzaro', familia: F.GOURMAND,
    subfamilia: 'Gourmand Especiado', concentracion: 'EDT', volumenMl: 100, precioRetail: 82,
    notasTop: ['limón', 'jengibre', 'menta'],
    notasHeart: ['cardamomo', 'manzana confitada', 'enebro'],
    notasBase: ['haba tonka', 'vetiver', 'amberwood'] },

  { id: 'AZZ-002', nombre: 'Azzaro The Most Wanted', casa: 'Azzaro', familia: F.GOURMAND,
    subfamilia: 'Gourmand Intenso', concentracion: 'EDP', volumenMl: 100, precioRetail: 98,
    notasTop: ['cardamomo', 'lavanda'],
    notasHeart: ['toffee', 'iris'],
    notasBase: ['madera de cedro', 'ambrosía', 'ámbar'] },

  // ── ISSEY MIYAKE (2) ────────────────────────────────
  { id: 'ISS-001', nombre: "L'Eau d'Issey Pour Homme", casa: 'Issey Miyake', familia: F.ACUATICA,
    subfamilia: 'Acuática Cítrica', concentracion: 'EDT', volumenMl: 125, precioRetail: 80,
    notasTop: ['yuzu', 'ciprés', 'limón', 'mandarina', 'bergamota'],
    notasHeart: ['canela', 'nuez moscada', 'geranio', 'salvia', 'loto azul'],
    notasBase: ['sándalo', 'cedro', 'vetiver', 'ámbar', 'almizcle'] },

  { id: 'ISS-002', nombre: "Nuit d'Issey", casa: 'Issey Miyake', familia: F.CUERO,
    subfamilia: 'Cuero Amaderado', concentracion: 'EDT', volumenMl: 125, precioRetail: 90,
    notasTop: ['bergamota', 'pomelo'],
    notasHeart: ['cuero', 'pimienta negra'],
    notasBase: ['pachuli', 'incienso', 'vetiver', 'ámbar gris'] },

  // ── BURBERRY (2) ────────────────────────────────────
  { id: 'BURB-001', nombre: 'Burberry London for Men', casa: 'Burberry', familia: F.ORIENTAL,
    subfamilia: 'Oriental Especiada', concentracion: 'EDT', volumenMl: 100, precioRetail: 78,
    notasTop: ['lavanda', 'bergamota', 'canela'],
    notasHeart: ['mimosa', 'cuero'],
    notasBase: ['tabaco', 'opoponax', 'musgo de roble', 'guayaco'] },

  { id: 'BURB-002', nombre: 'Burberry Touch for Men', casa: 'Burberry', familia: F.FOUGERE,
    subfamilia: 'Fougère Aromática', concentracion: 'EDT', volumenMl: 100, precioRetail: 72,
    notasTop: ['artemisa', 'violeta'],
    notasHeart: ['pimienta blanca', 'cedro de Virginia', 'nuez moscada'],
    notasBase: ['haba tonka', 'vetiver', 'musgo de roble'] },

  // ── HERMÈS (1) ──────────────────────────────────────
  { id: 'HERM-001', nombre: "Terre d'Hermès", casa: 'Hermès', familia: F.AMADERADA,
    subfamilia: 'Amaderada Mineral', concentracion: 'EDT', volumenMl: 100, precioRetail: 108,
    notasTop: ['naranja', 'pomelo', 'pedernal'],
    notasHeart: ['pimienta', 'geranio', 'rosa', 'pachuli'],
    notasBase: ['cedro', 'vetiver', 'benzoe'] },
];

// ── Calcular coste por atomización para cada perfume ──
// 1 atomización = ~0.1ml. Coste = (precioRetail / volumenMl) * 0.1
function buildInventory() {
  return RAW_INVENTORY.map(raw => {
    const costeAtomizacion = Math.round(((raw.precioRetail / raw.volumenMl) * 0.1) * 1000) / 1000;
    return createPerfume({
      ...raw,
      costeAtomizacion,
    });
  });
}

/** Los 53 perfumes reales con costes de atomización calculados */
export const PERFUME_INVENTORY = buildInventory();

/** Mapa rápido por ID */
export const PERFUME_MAP = Object.freeze(
  PERFUME_INVENTORY.reduce((map, p) => { map[p.id] = p; return map; }, {})
);

/** Obtener perfume por ID */
export function getPerfumeById(id) {
  return PERFUME_MAP[id] || null;
}

/** Filtrar perfumes por familia */
export function getPerfumesByFamily(familia) {
  return PERFUME_INVENTORY.filter(p => p.familia === familia);
}

/** Filtrar perfumes por casa */
export function getPerfumesByHouse(casa) {
  return PERFUME_INVENTORY.filter(p => p.casa === casa);
}

/** Buscar perfumes que contengan una nota específica */
export function getPerfumesByNote(nota) {
  const notaLower = nota.toLowerCase();
  return PERFUME_INVENTORY.filter(p =>
    p.todasLasNotas().some(n => n.toLowerCase().includes(notaLower))
  );
}

/** Valor total de la colección */
export function getCollectionValue() {
  return PERFUME_INVENTORY.reduce((sum, p) => sum + p.precioRetail, 0);
}
