/**
 * ETHEREAL v8.0 OMNI — INTERNACIONALIZACIÓN (i18n)
 * ===================================================
 * Soporte trilingüe: Español (ES), English (EN), Français (FR).
 * Persiste la preferencia del usuario en AsyncStorage.
 *
 * CAPA: GLOBAL v2
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = '@ethereal/language';

// ═══════════════════════════════════════════
// DICCIONARIOS
// ═══════════════════════════════════════════

const dictionaries = {
  es: {
    // ── Navegación ──
    'nav.home': 'Inicio',
    'nav.cava': 'Cava',
    'nav.lenez': 'Le Nez',
    'nav.oracle': 'Oráculo',
    'nav.profile': 'Perfil',

    // ── Home ──
    'home.dashboard': 'DASHBOARD',
    'home.savings': 'Ahorro Fiscal',
    'home.audit': 'Auditoría acumulada',
    'home.eurSaved': 'EUR AHORRADOS',
    'home.protocols': 'Protocolos',
    'home.perfumes': 'Perfumes',
    'home.collection': 'Colección',
    'home.topProtocols': 'Top Protocolos',
    'home.tierDist': 'Distribución por Tier',
    'home.dailyPerfume': 'Perfume del Día',
    'home.oracleRecommends': 'L\'Oracle recomienda',

    // ── Cava ──
    'cava.title': 'CAVA',
    'cava.inventory': 'Inventario',
    'cava.add': 'Añadir Perfume',
    'cava.remove': 'Eliminar',
    'cava.search': 'Buscar perfume...',
    'cava.empty': 'Tu cava está vacía. Añade perfumes para crear protocolos.',
    'cava.family': 'Familia',
    'cava.atomization': 'Atomización',

    // ── Le Nez ──
    'lenez.title': 'Le Nez',
    'lenez.listening': 'Escuchando su voz...',
    'lenez.ready': 'Recomendación lista. Toque para otra.',
    'lenez.tap': 'Toque el sensor para hablar.',
    'lenez.suggestions': 'SUGERENCIAS RÁPIDAS',

    // ── Oracle ──
    'oracle.title': 'ORACLE',
    'oracle.fiscal': 'Motor Fiscal',
    'oracle.savings': 'Total Ahorrado',
    'oracle.avgSaving': 'Ahorro Medio',
    'oracle.bestProtocol': 'Mejor Protocolo',
    'oracle.report': 'Informe Financiero',

    // ── Profile ──
    'profile.title': 'PROFIL',
    'profile.system': 'Sistema',
    'profile.engine': 'ETHEREAL Engine v8.0',
    'profile.tiers': 'Tiers',
    'profile.tierDist': 'Distribución de calidad',
    'profile.suggestions': 'Sugerencias de Compra',
    'profile.actions': 'Acciones',
    'profile.export': 'Exportar Backup',
    'profile.regen': 'Regenerar Enciclopedia',
    'profile.olfactoryDNA': 'ADN Olfativo',
    'profile.language': 'Idioma',

    // ── Académie ──
    'academie.title': 'L\'ACADÉMIE',
    'academie.subtitle': 'Maestría Olfativa',
    'academie.score': 'Puntuación',
    'academie.question': 'Pregunta',
    'academie.correct': '¡Correcto!',
    'academie.incorrect': 'Incorrecto',
    'academie.next': 'Siguiente',
    'academie.finish': 'Finalizar',
    'academie.result': 'Resultado Final',

    // ── Sommelier ──
    'sommelier.title': 'LE SOMMELIER VISUEL',
    'sommelier.subtitle': 'IA de Estilo + Fragancia',
    'sommelier.upload': 'Subir Foto de Outfit',
    'sommelier.analyzing': 'Analizando estilo...',
    'sommelier.recommendation': 'Recomendación',

    // ── General ──
    'general.loading': 'Cargando...',
    'general.error': 'Error',
    'general.retry': 'Reintentar',
    'general.cancel': 'Cancelar',
    'general.confirm': 'Confirmar',
    'general.save': 'Guardar',
    'general.delete': 'Eliminar',
    'general.seeAll': 'Ver todo',
    'general.back': 'Volver',

    // ── Decant ──
    'decant.title': 'Calculadora de Decants',
    'decant.volume': 'Volumen (ml)',
    'decant.price': 'Precio (€)',
    'decant.costPerMl': 'Coste por ml',
    'decant.calculate': 'Calcular',

    // ── Diary ──
    'diary.title': 'Diario Olfativo',
    'diary.today': 'Hoy',
    'diary.addEntry': 'Añadir entrada',
    'diary.noEntries': 'Sin entradas para este día.',

    // ── Batch ──
    'batch.title': 'Verificador de Lotes',
    'batch.scan': 'Escanear Código',
    'batch.enter': 'Introducir código...',
    'batch.verify': 'Verificar',
    'batch.result': 'Resultado',
  },

  en: {
    'nav.home': 'Home',
    'nav.cava': 'Cellar',
    'nav.lenez': 'Le Nez',
    'nav.oracle': 'Oracle',
    'nav.profile': 'Profile',

    'home.dashboard': 'DASHBOARD',
    'home.savings': 'Fiscal Savings',
    'home.audit': 'Accumulated audit',
    'home.eurSaved': 'EUR SAVED',
    'home.protocols': 'Protocols',
    'home.perfumes': 'Perfumes',
    'home.collection': 'Collection',
    'home.topProtocols': 'Top Protocols',
    'home.tierDist': 'Tier Distribution',
    'home.dailyPerfume': 'Perfume of the Day',
    'home.oracleRecommends': 'L\'Oracle recommends',

    'cava.title': 'CELLAR',
    'cava.inventory': 'Inventory',
    'cava.add': 'Add Perfume',
    'cava.remove': 'Remove',
    'cava.search': 'Search perfume...',
    'cava.empty': 'Your cellar is empty. Add perfumes to create protocols.',
    'cava.family': 'Family',
    'cava.atomization': 'Atomization',

    'lenez.title': 'Le Nez',
    'lenez.listening': 'Listening...',
    'lenez.ready': 'Recommendation ready. Tap for another.',
    'lenez.tap': 'Tap the sensor to speak.',
    'lenez.suggestions': 'QUICK SUGGESTIONS',

    'oracle.title': 'ORACLE',
    'oracle.fiscal': 'Fiscal Engine',
    'oracle.savings': 'Total Saved',
    'oracle.avgSaving': 'Average Saving',
    'oracle.bestProtocol': 'Best Protocol',
    'oracle.report': 'Financial Report',

    'profile.title': 'PROFILE',
    'profile.system': 'System',
    'profile.engine': 'ETHEREAL Engine v8.0',
    'profile.tiers': 'Tiers',
    'profile.tierDist': 'Quality Distribution',
    'profile.suggestions': 'Purchase Suggestions',
    'profile.actions': 'Actions',
    'profile.export': 'Export Backup',
    'profile.regen': 'Regenerate Encyclopedia',
    'profile.olfactoryDNA': 'Olfactory DNA',
    'profile.language': 'Language',

    'academie.title': 'L\'ACADÉMIE',
    'academie.subtitle': 'Olfactory Mastery',
    'academie.score': 'Score',
    'academie.question': 'Question',
    'academie.correct': 'Correct!',
    'academie.incorrect': 'Incorrect',
    'academie.next': 'Next',
    'academie.finish': 'Finish',
    'academie.result': 'Final Result',

    'sommelier.title': 'LE SOMMELIER VISUEL',
    'sommelier.subtitle': 'Style + Fragrance AI',
    'sommelier.upload': 'Upload Outfit Photo',
    'sommelier.analyzing': 'Analyzing style...',
    'sommelier.recommendation': 'Recommendation',

    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.retry': 'Retry',
    'general.cancel': 'Cancel',
    'general.confirm': 'Confirm',
    'general.save': 'Save',
    'general.delete': 'Delete',
    'general.seeAll': 'See all',
    'general.back': 'Back',

    'decant.title': 'Decant Calculator',
    'decant.volume': 'Volume (ml)',
    'decant.price': 'Price (€)',
    'decant.costPerMl': 'Cost per ml',
    'decant.calculate': 'Calculate',

    'diary.title': 'Olfactory Diary',
    'diary.today': 'Today',
    'diary.addEntry': 'Add entry',
    'diary.noEntries': 'No entries for this day.',

    'batch.title': 'Batch Verifier',
    'batch.scan': 'Scan Code',
    'batch.enter': 'Enter code...',
    'batch.verify': 'Verify',
    'batch.result': 'Result',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.cava': 'Cave',
    'nav.lenez': 'Le Nez',
    'nav.oracle': 'Oracle',
    'nav.profile': 'Profil',

    'home.dashboard': 'TABLEAU DE BORD',
    'home.savings': 'Économies Fiscales',
    'home.audit': 'Audit accumulé',
    'home.eurSaved': 'EUR ÉCONOMISÉS',
    'home.protocols': 'Protocoles',
    'home.perfumes': 'Parfums',
    'home.collection': 'Collection',
    'home.topProtocols': 'Meilleurs Protocoles',
    'home.tierDist': 'Distribution par Tier',
    'home.dailyPerfume': 'Parfum du Jour',
    'home.oracleRecommends': 'L\'Oracle recommande',

    'cava.title': 'CAVE',
    'cava.inventory': 'Inventaire',
    'cava.add': 'Ajouter Parfum',
    'cava.remove': 'Supprimer',
    'cava.search': 'Chercher un parfum...',
    'cava.empty': 'Votre cave est vide. Ajoutez des parfums pour créer des protocoles.',
    'cava.family': 'Famille',
    'cava.atomization': 'Atomisation',

    'lenez.title': 'Le Nez',
    'lenez.listening': 'À l\'écoute...',
    'lenez.ready': 'Recommandation prête. Touchez pour une autre.',
    'lenez.tap': 'Touchez le capteur pour parler.',
    'lenez.suggestions': 'SUGGESTIONS RAPIDES',

    'oracle.title': 'ORACLE',
    'oracle.fiscal': 'Moteur Fiscal',
    'oracle.savings': 'Total Économisé',
    'oracle.avgSaving': 'Économie Moyenne',
    'oracle.bestProtocol': 'Meilleur Protocole',
    'oracle.report': 'Rapport Financier',

    'profile.title': 'PROFIL',
    'profile.system': 'Système',
    'profile.engine': 'ETHEREAL Engine v8.0',
    'profile.tiers': 'Tiers',
    'profile.tierDist': 'Distribution de qualité',
    'profile.suggestions': 'Suggestions d\'achat',
    'profile.actions': 'Actions',
    'profile.export': 'Exporter la sauvegarde',
    'profile.regen': 'Régénérer l\'encyclopédie',
    'profile.olfactoryDNA': 'ADN Olfactif',
    'profile.language': 'Langue',

    'academie.title': 'L\'ACADÉMIE',
    'academie.subtitle': 'Maîtrise Olfactive',
    'academie.score': 'Score',
    'academie.question': 'Question',
    'academie.correct': 'Correct !',
    'academie.incorrect': 'Incorrect',
    'academie.next': 'Suivant',
    'academie.finish': 'Terminer',
    'academie.result': 'Résultat Final',

    'sommelier.title': 'LE SOMMELIER VISUEL',
    'sommelier.subtitle': 'IA Style + Parfum',
    'sommelier.upload': 'Télécharger Photo Tenue',
    'sommelier.analyzing': 'Analyse du style...',
    'sommelier.recommendation': 'Recommandation',

    'general.loading': 'Chargement...',
    'general.error': 'Erreur',
    'general.retry': 'Réessayer',
    'general.cancel': 'Annuler',
    'general.confirm': 'Confirmer',
    'general.save': 'Enregistrer',
    'general.delete': 'Supprimer',
    'general.seeAll': 'Voir tout',
    'general.back': 'Retour',

    'decant.title': 'Calculatrice de Decants',
    'decant.volume': 'Volume (ml)',
    'decant.price': 'Prix (€)',
    'decant.costPerMl': 'Coût par ml',
    'decant.calculate': 'Calculer',

    'diary.title': 'Journal Olfactif',
    'diary.today': 'Aujourd\'hui',
    'diary.addEntry': 'Ajouter une entrée',
    'diary.noEntries': 'Aucune entrée pour ce jour.',

    'batch.title': 'Vérificateur de Lots',
    'batch.scan': 'Scanner le code',
    'batch.enter': 'Entrer le code...',
    'batch.verify': 'Vérifier',
    'batch.result': 'Résultat',
  },
};

// ═══════════════════════════════════════════
// MOTOR DE TRADUCCIÓN
// ═══════════════════════════════════════════

let _currentLang = 'es';

function t(key) {
  const dict = dictionaries[_currentLang] || dictionaries.es;
  return dict[key] || dictionaries.es[key] || key;
}

function getCurrentLanguage() {
  return _currentLang;
}

function getAvailableLanguages() {
  return [
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'fr', name: 'Français', flag: 'FR' },
  ];
}

async function setLanguage(langCode) {
  if (!dictionaries[langCode]) return;
  _currentLang = langCode;
  await AsyncStorage.setItem(LANG_KEY, langCode);
}

async function loadLanguage() {
  const saved = await AsyncStorage.getItem(LANG_KEY);
  if (saved && dictionaries[saved]) {
    _currentLang = saved;
  }
  return _currentLang;
}

// ═══════════════════════════════════════════
// HOOK DE REACT
// ═══════════════════════════════════════════

function useTranslation() {
  const [lang, setLang] = useState(_currentLang);

  useEffect(() => {
    loadLanguage().then(setLang);
  }, []);

  const changeLanguage = useCallback(async (code) => {
    await setLanguage(code);
    setLang(code);
  }, []);

  const translate = useCallback((key) => {
    const dict = dictionaries[lang] || dictionaries.es;
    return dict[key] || dictionaries.es[key] || key;
  }, [lang]);

  return {
    t: translate,
    lang,
    changeLanguage,
    languages: getAvailableLanguages(),
  };
}

export { t, getCurrentLanguage, getAvailableLanguages, setLanguage, loadLanguage, useTranslation };
export default { t, useTranslation };
