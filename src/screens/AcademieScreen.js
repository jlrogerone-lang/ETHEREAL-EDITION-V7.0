/**
 * ETHEREAL v8.0 OMNI — L'ACADÉMIE (Quiz Olfativo)
 * ==================================================
 * Juego de preguntas sobre perfumería, familias olfativas,
 * notas, casas y técnicas de layering. Aprende jugando.
 *
 * CAPA: SINGULARITY v5
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Background, THEME } from '../components/ui/SharedComponents';
import GlassCard from '../components/ui/GlassCard';

// ── Banco de Preguntas ──

const QUESTIONS = [
  {
    category: 'Familias',
    question: '¿A qué familia olfativa pertenece el Oud?',
    options: ['Floral', 'Oriental', 'Fresco', 'Cítrico'],
    correct: 1,
    explanation: 'El Oud (madera de agar) es la piedra angular de la familia Oriental, con notas resinosas y amaderadas profundas.',
  },
  {
    category: 'Notas',
    question: '¿Cuál es la "nota de salida" en un perfume?',
    options: ['La que dura más', 'La primera que hueles', 'La del fondo', 'La nota media'],
    correct: 1,
    explanation: 'Las notas de salida (top notes) son las primeras que percibes. Son ligeras y se evaporan en 15-30 minutos.',
  },
  {
    category: 'Técnica',
    question: '¿Qué es el "layering" en perfumería?',
    options: ['Mezclar perfumes en un frasco', 'Aplicar fragancias en capas sobre la piel', 'Diluir perfume con agua', 'Guardar perfumes juntos'],
    correct: 1,
    explanation: 'El layering es la técnica de aplicar dos o más fragancias sobre la piel para crear una combinación única y personalizada.',
  },
  {
    category: 'Casas',
    question: '¿Qué casa creó "Shalimar" en 1925?',
    options: ['Chanel', 'Guerlain', 'Dior', 'Hermès'],
    correct: 1,
    explanation: 'Shalimar de Guerlain (1925) es considerado el primer oriental moderno, creado por Jacques Guerlain.',
  },
  {
    category: 'Notas',
    question: '¿Qué nota se obtiene del jazmín recolectado de noche?',
    options: ['Jazmín Sambac', 'Jazmín Grandiflorum', 'Absoluto de Jazmín Nocturno', 'Jazmín Sintético'],
    correct: 0,
    explanation: 'El Jazmín Sambac se recolecta de noche porque sus flores se abren al anochecer, concentrando su aroma.',
  },
  {
    category: 'Familias',
    question: '¿Cuál de estas NO es una familia olfativa clásica?',
    options: ['Fougère', 'Chypre', 'Umami', 'Hesperidée'],
    correct: 2,
    explanation: 'Umami es un sabor (gusto), no una familia olfativa. Las familias clásicas incluyen Fougère, Chypre, Floral y Hesperidée.',
  },
  {
    category: 'Técnica',
    question: '¿Cuántas atomizaciones tiene aprox. un decant de 10ml?',
    options: ['~50', '~100', '~150', '~200'],
    correct: 1,
    explanation: 'Un decant de 10ml contiene aproximadamente 100 atomizaciones, considerando ~0.1ml por spray.',
  },
  {
    category: 'Ingredientes',
    question: '¿De dónde se extrae el ámbar gris natural?',
    options: ['Resina de árbol', 'Cachalote (ballena)', 'Mineral volcánico', 'Alga marina'],
    correct: 1,
    explanation: 'El ámbar gris se forma en el tracto digestivo del cachalote. Hoy se usan alternativas sintéticas como Ambroxan.',
  },
  {
    category: 'Casas',
    question: '¿Qué casa es conocida por "Aventus"?',
    options: ['Parfums de Marly', 'Creed', 'Tom Ford', 'Xerjoff'],
    correct: 1,
    explanation: 'Aventus de Creed (2010) es uno de los perfumes nicho más populares del mundo, con notas de piña, abedul y almizcle.',
  },
  {
    category: 'Familias',
    question: '¿Qué familia olfativa define el perfil "lavanda + musgo de roble + cumarina"?',
    options: ['Oriental', 'Chypre', 'Fougère', 'Acuático'],
    correct: 2,
    explanation: 'La tríada lavanda-musgo-cumarina es el ADN de la familia Fougère, establecida por "Fougère Royale" de Houbigant (1882).',
  },
  {
    category: 'Técnica',
    question: '¿Qué concentración tiene un "Eau de Parfum"?',
    options: ['1-3%', '4-8%', '15-20%', '30-40%'],
    correct: 2,
    explanation: 'El EDP contiene 15-20% de aceites esenciales. EDT: 5-15%, EDC: 2-4%, Parfum: 20-30%.',
  },
  {
    category: 'Ingredientes',
    question: '¿Qué molécula sintética revolucionó la perfumería en el siglo XX?',
    options: ['Iso E Super', 'Agua destilada', 'Glicerina', 'Alcohol etílico'],
    correct: 0,
    explanation: 'Iso E Super es una molécula de madera sintética (1973) usada en miles de perfumes. Crea un efecto "piel+" aterciopelado.',
  },
  {
    category: 'Casas',
    question: '¿Dónde se encuentra Grasse, la capital mundial del perfume?',
    options: ['Italia', 'España', 'Francia', 'Marruecos'],
    correct: 2,
    explanation: 'Grasse, en la Provenza francesa, es considerada la capital mundial del perfume desde el siglo XVIII.',
  },
  {
    category: 'Técnica',
    question: '¿Cuál es el mejor punto de pulso para aplicar perfume?',
    options: ['Codo', 'Muñecas y cuello', 'Espalda', 'Rodillas'],
    correct: 1,
    explanation: 'Los puntos de pulso (muñecas, cuello, detrás de orejas) tienen mayor temperatura corporal, potenciando la difusión.',
  },
  {
    category: 'Ingredientes',
    question: '¿Qué es el "accord" en perfumería?',
    options: ['Un contrato de exclusividad', 'La mezcla armónica de notas que forma un aroma nuevo', 'El envase del perfume', 'La marca registrada'],
    correct: 1,
    explanation: 'Un accord es la combinación armoniosa de varias notas que crea una percepción olfativa nueva e indivisible.',
  },
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function AcademieScreen({ navigation }) {
  const [gameState, setGameState] = useState('menu'); // menu | playing | result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(QUESTIONS).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameState('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const selectAnswer = useCallback((index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const current = questions[currentIndex];
    const isCorrect = index === current.correct;

    if (isCorrect) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setShowExplanation(true);
  }, [selectedAnswer, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setGameState('result');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [currentIndex, questions, fadeAnim]);

  const getTier = useCallback(() => {
    const pct = (score / questions.length) * 100;
    if (pct >= 90) return { tier: 'MAÎTRE PARFUMEUR', color: THEME.colors.tierAlpha || '#FFD700' };
    if (pct >= 70) return { tier: 'COMPOSITEUR', color: THEME.colors.tierBeta || '#C0C0C0' };
    if (pct >= 50) return { tier: 'APPRENTI', color: THEME.colors.tierGamma || '#CD7F32' };
    return { tier: 'NÉOPHYTE', color: THEME.colors.tierDelta || '#808080' };
  }, [score, questions]);

  const current = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Background />

      {/* Header con back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft color={THEME.colors.gold} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>L'ACADÉMIE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── MENU ── */}
        {gameState === 'menu' && (
          <View style={styles.menuContainer}>
            <GlassCard title="L'Académie" subtitle="Escuela de Perfumería">
              <Text style={styles.menuDesc}>
                Pon a prueba tu conocimiento olfativo con 10 preguntas sobre
                familias, notas, casas legendarias y técnicas de layering.
              </Text>

              <View style={styles.menuStats}>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>{QUESTIONS.length}</Text>
                  <Text style={styles.menuStatLabel}>Preguntas</Text>
                </View>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>4</Text>
                  <Text style={styles.menuStatLabel}>Categorías</Text>
                </View>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>10</Text>
                  <Text style={styles.menuStatLabel}>Por Ronda</Text>
                </View>
              </View>
            </GlassCard>

            <TouchableOpacity onPress={startGame} activeOpacity={0.7}>
              <GlassCard accentColor={THEME.colors.gold}>
                <Text style={styles.startText}>COMMENCER L'EXAMEN</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PLAYING ── */}
        {gameState === 'playing' && current && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Progress */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {questions.length} — Score: {score}
            </Text>

            <GlassCard>
              <Text style={styles.category}>{current.category.toUpperCase()}</Text>
              <Text style={styles.question}>{current.question}</Text>
            </GlassCard>

            {/* Opciones */}
            {current.options.map((opt, idx) => {
              let optStyle = styles.option;
              if (selectedAnswer !== null) {
                if (idx === current.correct) {
                  optStyle = [styles.option, styles.optionCorrect];
                } else if (idx === selectedAnswer && idx !== current.correct) {
                  optStyle = [styles.option, styles.optionWrong];
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => selectAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.7}
                  style={optStyle}
                >
                  <Text style={styles.optionLetter}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Explicación */}
            {showExplanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{current.explanation}</Text>
                <TouchableOpacity onPress={nextQuestion} style={styles.nextButton}>
                  <Text style={styles.nextText}>
                    {currentIndex + 1 >= questions.length ? 'VER RESULTADO' : 'SIGUIENTE →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        {/* ── RESULTADO ── */}
        {gameState === 'result' && (
          <View style={styles.resultContainer}>
            <GlassCard title="Résultat" subtitle="Evaluación Completada">
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreTotal}>/ {questions.length}</Text>
              </View>

              <View style={[styles.tierBadge, { borderColor: getTier().color }]}>
                <Text style={[styles.tierText, { color: getTier().color }]}>
                  {getTier().tier}
                </Text>
              </View>

              <Text style={styles.resultMessage}>
                {score >= 9 ? '¡Extraordinario! Tienes nariz de maestro perfumista.' :
                 score >= 7 ? 'Excelente conocimiento olfativo. Sigue refinando.' :
                 score >= 5 ? 'Buen inicio. Tu nariz tiene potencial.' :
                 'Sigue aprendiendo. Cada fragancia es una lección.'}
              </Text>
            </GlassCard>

            <TouchableOpacity onPress={startGame} activeOpacity={0.7}>
              <GlassCard>
                <Text style={styles.startText}>JUGAR DE NUEVO</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backToMenu}
            >
              <Text style={styles.backToMenuText}>VOLVER</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  scroll: { padding: 20 },
  menuContainer: {},
  menuDesc: {
    color: THEME.colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  menuStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  menuStatItem: { alignItems: 'center' },
  menuStatValue: {
    color: THEME.colors.gold,
    fontSize: 22,
    fontWeight: 'bold',
  },
  menuStatLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 1,
  },
  startText: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.gold,
    borderRadius: 2,
  },
  progressText: {
    color: THEME.colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  category: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 8,
  },
  question: {
    color: THEME.colors.text,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  optionWrong: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  optionLetter: {
    color: THEME.colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
  },
  optionText: {
    color: THEME.colors.text,
    fontSize: 14,
    flex: 1,
  },
  explanationBox: {
    backgroundColor: 'rgba(212,175,55,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  explanationText: {
    color: THEME.colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  nextButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: THEME.colors.gold,
    borderRadius: 20,
  },
  nextText: {
    color: THEME.colors.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  resultContainer: { alignItems: 'stretch' },
  scoreCircle: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreNumber: {
    color: THEME.colors.gold,
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreTotal: {
    color: THEME.colors.textDim,
    fontSize: 18,
    marginTop: -4,
  },
  tierBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tierText: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
  resultMessage: {
    color: THEME.colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  backToMenu: {
    alignSelf: 'center',
    padding: 12,
    marginTop: 8,
  },
  backToMenuText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    letterSpacing: 2,
  },
});
