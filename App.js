/**
 * ETHEREAL EDITION v8.0 OMNI — GOLDEN MASTER
 * =============================================
 * Punto de entrada principal. Conecta el motor de layering
 * (6 Pilares, 500 protocolos, Auditoría Fiscal) con la UI.
 *
 * ARQUITECTURA:
 * - ErrorBoundary global (Self-Healing Navigation)
 * - LayeringProvider envuelve toda la app (ViewModel global)
 * - Stack Navigator: Login → MainTabs → Detail screens
 * - Tab Navigator: Home, Cava, LeNez, Oracle, Profile
 *
 * UI: Componentes importados desde SharedComponents.
 */

import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Gem, Sparkles, Eye, User } from 'lucide-react-native';

// --- SELF-HEALING NAVIGATION ---
import ErrorBoundary from './src/components/ui/ErrorBoundary';

// --- MOTOR DE LAYERING ---
import { LayeringProvider } from './src/context/LayeringContext';

// --- COMPONENTES UI COMPARTIDOS ---
import { Background, LuxuryCard, GoldButton, THEME } from './src/components/ui/SharedComponents';

// --- PANTALLAS CON LÓGICA VIVA ---
import HomeScreen from './src/screens/HomeScreen';
import CavaScreen from './src/screens/CavaScreen';
import BiblioScreen from './src/screens/BiblioScreen';
import LeNezScreen from './src/screens/LeNezScreen';
import OracleScreen from './src/screens/OracleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProtocolDetailScreen from './src/screens/ProtocolDetailScreen';

// --- PANTALLAS OMNI v8 ---
import AcademieScreen from './src/screens/AcademieScreen';
import SommelierScreen from './src/screens/SommelierScreen';

// ==========================================
// LOGIN SCREEN (UI INMUTABLE)
// ==========================================

const LoginScreen = ({ navigation }) => (
  <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <StatusBar barStyle="light-content" backgroundColor="#000000" />
    <Background />
    <Text style={styles.brandTitle}>L'ESSENCE DU LUXE</Text>
    <View style={{width:'80%'}}>
      <LuxuryCard title="Bienvenue" subtitle="ETHEREAL OMNI v8.0">
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
// APP ROOT — OMNI v8.0
// ==========================================

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <LayeringProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="ProtocolDetail" component={ProtocolDetailScreen} options={{ presentation: 'card', gestureEnabled: true }} />
              <Stack.Screen name="Biblio" component={BiblioScreen} options={{ presentation: 'card', gestureEnabled: true }} />
              <Stack.Screen name="Academie" component={AcademieScreen} options={{ presentation: 'card', gestureEnabled: true }} />
              <Stack.Screen name="Sommelier" component={SommelierScreen} options={{ presentation: 'card', gestureEnabled: true }} />
            </Stack.Navigator>
          </NavigationContainer>
        </LayeringProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  brandTitle: { color: THEME.colors.gold, fontSize: 22, letterSpacing: 8, marginBottom: 40 },
  tabBar: { backgroundColor: '#000', borderTopWidth: 0, height: 85, paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 }
});
