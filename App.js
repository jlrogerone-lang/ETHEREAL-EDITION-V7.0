import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Platform, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Search, Gem, Sparkles, Eye, Award, User, ArrowRight, ChevronLeft } from 'lucide-react-native';

// --- NUEVOS CONTROLADORES DE HARDWARE v7 ---
import * as Haptics from 'expo-haptics'; // Le Toucher
import * as Speech from 'expo-speech';   // La Voix
import AsyncStorage from '@react-native-async-storage/async-storage'; // Le Bunker

const THEME = {
  colors: { gold: '#D4AF37', goldDim: '#8A7120', goldLight: '#F8E79A', bg: '#000000', text: '#FFFFFF', textDim: '#666666' },
  fonts: { serif: Platform.OS === 'ios' ? 'Didot' : 'serif' }
};

// ==========================================
// COMPONENTES CON LÓGICA ACTIVA
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
// PANTALLAS FUNCIONALES
// ==========================================

const LoginScreen = ({ navigation }) => (
  <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <Background />
    <Text style={styles.brandTitle}>L'ESSENCE DU LUXE</Text>
    <View style={{width:'80%'}}>
      <LuxuryCard title="Bienvenue" subtitle="ETHEREAL v7.0">
         <GoldButton text="ENTRAR" onPress={() => navigation.replace('MainTabs')} />
      </LuxuryCard>
    </View>
  </View>
);

const LeNezScreen = () => {
  const [isListening, setIsListening] = useState(false);

  const startVoice = () => {
    // ACTIVACIÓN LA VOIX
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsListening(!isListening);
    if(!isListening) {
        Speech.speak("Monsieur, mis sensores están listos. ¿Qué aroma buscamos?", { language: 'es-ES', rate: 0.85 });
    }
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <Background />
      <View style={{flex:1, padding:20, justifyContent:'flex-end'}}>
        <LuxuryCard title="Le Nez" subtitle="Artificial Intelligence">
          <Text style={{color:THEME.colors.gold, fontStyle:'italic', textAlign:'center'}}>
            {isListening ? "Escuchando su voz..." : "Toque el sensor para hablar."}
          </Text>
        </LuxuryCard>
        <TouchableOpacity onPress={startVoice} style={[styles.voiceCircle, isListening && {borderColor: THEME.colors.goldLight}]}>
           <Sparkles color={THEME.colors.gold} size={32} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const CavaScreen = () => {
  const [count, setCount] = useState(0);

  // ACTIVACIÓN LE BUNKER (Persistencia)
  useEffect(() => {
    const load = async () => {
      const val = await AsyncStorage.getItem('@cava_count');
      if (val) setCount(parseInt(val));
    };
    load();
  }, []);

  const addPerfume = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const newCount = count + 1;
    setCount(newCount);
    await AsyncStorage.setItem('@cava_count', newCount.toString());
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <Background />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>LE BUNKER</Text>
        <LuxuryCard title="Inventario" subtitle="Colección Offline">
           <Text style={{color:'#FFF', fontSize:40, textAlign:'center'}}>{count}</Text>
           <Text style={{color:THEME.colors.gold, textAlign:'center', marginBottom:20}}>FRAGANCIAS GUARDADAS</Text>
           <GoldButton text="AÑADIR A LA CAVA" onPress={addPerfume} />
        </LuxuryCard>
      </ScrollView>
    </SafeAreaView>
  );
};

// Resto de pantallas simuladas para navegación...
const HomeScreen = () => <View style={{flex:1}}><Background /><Text style={styles.headerTitle}>DASHBOARD</Text></View>;
const BiblioScreen = () => <View style={{flex:1}}><Background /><Text style={styles.headerTitle}>BIBLIOTHÈQUE</Text></View>;
const OracleScreen = () => <View style={{flex:1}}><Background /><Text style={styles.headerTitle}>L'ORACLE</Text></View>;
const AcademyScreen = () => <View style={{flex:1}}><Background /><Text style={styles.headerTitle}>ACADEMY</Text></View>;
const ProfileScreen = () => <View style={{flex:1}}><Background /><Text style={styles.headerTitle}>PROFIL</Text></View>;

// ==========================================
// NAVEGACIÓN
// ==========================================
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: THEME.colors.gold }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({color}) => <Home color={color} size={20} /> }} />
    <Tab.Screen name="Cava" component={CavaScreen} options={{ tabBarIcon: ({color}) => <Gem color={color} size={20} /> }} />
    <Tab.Screen name="LeNez" component={LeNezScreen} options={{ tabBarIcon: ({color}) => <Sparkles color={color} size={24} /> }} />
    <Tab.Screen name="Oracle" component={OracleScreen} options={{ tabBarIcon: ({color}) => <Eye color={color} size={20} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({color}) => <User color={color} size={20} /> }} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

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
  voiceCircle: { width: 80, height: 80, borderRadius: 40, borderLineWidth: 1, borderColor: THEME.colors.gold, alignSelf: 'center', marginTop: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)' },
  tabBar: { backgroundColor: '#000', borderTopWidth: 0, height: 85 }
});
