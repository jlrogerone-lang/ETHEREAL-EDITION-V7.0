/**
 * ETHEREAL EDITION v7.0 — GOLDEN MASTER
 * ========================================
 * Punto de entrada principal. Conecta el motor de layering
 * (6 Pilares, 500 protocolos, Auditoría Fiscal) con la UI.
 *
 * ARQUITECTURA:
 * - LayeringProvider envuelve toda la app (ViewModel global)
 * - Stack Navigator: Login → MainTabs → ProtocolDetail / Biblio
 * - Tab Navigator: Home, Cava, LeNez, Oracle, Profile
 *
 * UI INMUTABLE: Los componentes visuales (Background, LuxuryCard,
 * GoldButton, THEME) se mantienen idénticos al diseño aprobado.
 *
 * BUGS CORREGIDOS:
 * - MainTabNavigator → MainTabs (referencia inexistente)
 * - borderLineWidth → borderWidth (propiedad inexistente en RN)
 */

import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Gem, Sparkles, Eye, User, ArrowRight } from 'lucide-react-native';

// --- CONTROLADORES DE HARDWARE v7 ---
import * as Haptics from 'expo-haptics'; // Le Toucher

// --- MOTOR DE LAYERING ---
import { LayeringProvider } from './src/context/LayeringContext';

// --- PANTALLAS CON LÓGICA VIVA ---
import HomeScreen from './src/screens/HomeScreen';
import CavaScreen from './src/screens/CavaScreen';
import BiblioScreen from './src/screens/BiblioScreen';
import LeNezScreen from './src/screens/LeNezScreen';
import OracleScreen from './src/screens/OracleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProtocolDetailScreen from './src/screens/ProtocolDetailScreen';

// ==========================================
// THEME SAGRADO (INMUTABLE)
// ==========================================

const THEME = {
  colors: { gold: '#D4AF37', goldDim: '#8A7120', goldLight: '#F8E79A', bg: '#000000', text: '#FFFFFF', textDim: '#666666' },
  fonts: { serif: Platform.OS === 'ios' ? 'Didot' : 'serif' }
};

// ==========================================
// COMPONENTES UI ORIGINALES (INMUTABLES)
// ==========================================

const Background = () => <LinearGradient colors={['#000000', '#1A1105', '#000000']} style={StyleSheet.absoluteFillObject} />;

const LuxuryCard = ({ title, subtitle, children }) => (
  <View style={styles.cardContainer}>
    <LinearGradient colors={['transparent', THEME.colors.gold, 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={{height:1, opacity:0.6}} />
    <BlurView intensity={20} tint='dark' style={styles.cardContent}>
      {(title || subtitle) && (
        <View style={{marginBottom: 15, alignItems: 'center'}}>
           {title && <Text style={styles.cardTitle}>{title}</Text>}
           {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </BlurView>
  </View>
);

const GoldButton = ({ text, onPress }) => {
  const handlePress = () => {
    // ACTIVACIÓN LE TOUCHER
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} style={styles.goldButton}>
      <LinearGradient colors={[THEME.colors.gold, THEME.colors.goldDim]} style={styles.goldButtonGradient}>
        <Text style={styles.goldButtonText}>{text}</Text>
        <ArrowRight color='#000' size={16} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ==========================================
// LOGIN SCREEN (UI INMUTABLE)
// ==========================================

const LoginScreen = ({ navigation }) => (
  <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <StatusBar barStyle="light-content" backgroundColor="#000000" />
    <Background />
    <Text style={styles.brandTitle}>L'ESSENCE DU LUXE</Text>
    <View style={{width:'80%'}}>
      <LuxuryCard title="Bienvenue" subtitle="ETHEREAL v7.0">
         <GoldButton text="ENTRAR" onPress={() => navigation.replace('MainTabs')} />
      </LuxuryCard>
    </View>
  </View>
);

// ==========================================
// NAVEGACIÓN
// ==========================================
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: styles.tabBar,
    tabBarActiveTintColor: THEME.colors.gold,
    tabBarInactiveTintColor: THEME.colors.textDim,
    tabBarLabelStyle: { fontSize: 9, letterSpacing: 1 },
  }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({color}) => <Home color={color} size={20} /> }} />
    <Tab.Screen name="Cava" component={CavaScreen} options={{ tabBarIcon: ({color}) => <Gem color={color} size={20} /> }} />
    <Tab.Screen name="LeNez" component={LeNezScreen} options={{ tabBarLabel: 'Le Nez', tabBarIcon: ({color}) => <Sparkles color={color} size={24} /> }} />
    <Tab.Screen name="Oracle" component={OracleScreen} options={{ tabBarIcon: ({color}) => <Eye color={color} size={20} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({color}) => <User color={color} size={20} /> }} />
  </Tab.Navigator>
);

// ==========================================
// APP ROOT — GOLDEN MASTER
// ==========================================

export default function App() {
  return (
    <SafeAreaProvider>
      <LayeringProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ProtocolDetail" component={ProtocolDetailScreen} options={{ presentation: 'card', gestureEnabled: true }} />
            <Stack.Screen name="Biblio" component={BiblioScreen} options={{ presentation: 'card', gestureEnabled: true }} />
          </Stack.Navigator>
        </NavigationContainer>
      </LayeringProvider>
    </SafeAreaProvider>
  );
}

// ==========================================
// STYLES (IDÉNTICOS AL ORIGINAL)
// ==========================================
const styles = StyleSheet.create({
  scroll: { padding: 20 },
  headerTitle: { color: THEME.colors.gold, fontSize: 14, letterSpacing: 4, textAlign: 'center', marginVertical: 40 },
  brandTitle: { color: THEME.colors.gold, fontSize: 22, letterSpacing: 8, marginBottom: 40 },
  cardContainer: { marginBottom: 20, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardContent: { padding: 24 },
  cardTitle: { fontSize: 26, color: THEME.colors.gold, fontFamily: THEME.fonts.serif, textAlign:'center' },
  cardSubtitle: { fontSize: 10, color: THEME.colors.textDim, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' },
  goldButton: { marginTop: 10, borderRadius: 25, overflow: 'hidden' },
  goldButtonGradient: { paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  goldButtonText: { color: '#000', fontWeight: 'bold', marginRight: 10 },
  voiceCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: THEME.colors.gold, alignSelf: 'center', marginTop: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)' },
  tabBar: { backgroundColor: '#000', borderTopWidth: 0, height: 85, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 }
});
