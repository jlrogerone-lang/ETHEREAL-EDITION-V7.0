/**
 * ETHEREAL v7.0 - CAVA SCREEN (Inventario)
 * ==========================================
 * Gestión del inventario conectada al InventoryManager.
 * Añadir/eliminar perfumes sincroniza automáticamente los protocolos.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Background,
  LuxuryCard,
  GoldButton,
  StatCard,
  SectionHeader,
  EmptyState,
  THEME,
} from '../components/ui/SharedComponents';
import { useLayering } from '../context/LayeringContext';

export default function CavaScreen() {
  const {
    initialized,
    inventory,
    refreshInventory,
    addPerfume,
    removePerfume,
    getInventoryByFamily,
    getAvailablePerfumes,
  } = useLayering();

  const [searchText, setSearchText] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [availablePerfumes, setAvailablePerfumes] = useState([]);
  const [groupedInventory, setGroupedInventory] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    loadData();
  }, [initialized, inventory]);

  const loadData = useCallback(async () => {
    const grouped = await getInventoryByFamily();
    setGroupedInventory(grouped);
  }, [getInventoryByFamily]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshInventory();
    setRefreshing(false);
  }, [refreshInventory]);

  const openAddPanel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const available = await getAvailablePerfumes();
    setAvailablePerfumes(available);
    setShowAddPanel(true);
  };

  const handleAddPerfume = async (perfumeId) => {
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const result = await addPerfume(perfumeId);
    setBusy(false);
    if (result.success) {
      const updated = await getAvailablePerfumes();
      setAvailablePerfumes(updated);
    }
  };

  const handleRemovePerfume = (perfumeId, perfumeName) => {
    Alert.alert(
      'Eliminar Perfume',
      `Eliminar ${perfumeName} desactivará todos los protocolos que lo usen. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await removePerfume(perfumeId);
            setBusy(false);
          },
        },
      ]
    );
  };

  const filteredInventory = searchText
    ? inventory.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
          p.casa.toLowerCase().includes(searchText.toLowerCase())
      )
    : inventory;

  const filteredAvailable = searchText
    ? availablePerfumes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
          p.casa.toLowerCase().includes(searchText.toLowerCase())
      )
    : availablePerfumes;

  const totalValue = inventory.reduce((sum, p) => sum + p.precioRetail, 0);
  const totalFiscal = inventory.reduce(
    (sum, p) => sum + (p.valorFiscal || 0),
    0
  );

  const familyNames = Object.keys(groupedInventory);

  return (
    <SafeAreaView style={styles.container}>
      <Background />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.gold}
          />
        }
      >
        <Text style={styles.headerTitle}>LE BUNKER</Text>

        {/* ── RESUMEN ── */}
        <LuxuryCard title="Inventario" subtitle="Colección Offline">
          <Text style={styles.bigCount}>{inventory.length}</Text>
          <Text style={styles.bigLabel}>FRAGANCIAS GUARDADAS</Text>
          <View style={styles.statsRow}>
            <StatCard label="Valor Retail" value={`${totalValue}`} unit="€" small />
            <StatCard
              label="Valor Fiscal"
              value={totalFiscal.toFixed(0)}
              unit="€"
              small
            />
          </View>
          <GoldButton
            text={showAddPanel ? 'CERRAR CATÁLOGO' : 'AÑADIR A LA CAVA'}
            onPress={() => (showAddPanel ? setShowAddPanel(false) : openAddPanel())}
          />
        </LuxuryCard>

        {/* ── BÚSQUEDA ── */}
        <View style={styles.searchContainer}>
          <Search color={THEME.colors.goldDim} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar perfume..."
            placeholderTextColor={THEME.colors.textDim}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X color={THEME.colors.textDim} size={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── PANEL AÑADIR ── */}
        {showAddPanel && (
          <>
            <SectionHeader title="Catálogo disponible" />
            {filteredAvailable.length === 0 ? (
              <EmptyState message="Todos los perfumes ya están en tu inventario" />
            ) : (
              filteredAvailable.slice(0, 20).map((perfume) => (
                <TouchableOpacity
                  key={perfume.id}
                  onPress={() => handleAddPerfume(perfume.id)}
                  disabled={busy}
                  activeOpacity={0.7}
                >
                  <View style={styles.perfumeRow}>
                    <View style={styles.perfumeInfo}>
                      <Text style={styles.perfumeName}>{perfume.nombre}</Text>
                      <Text style={styles.perfumeHouse}>{perfume.casa}</Text>
                    </View>
                    <View style={styles.perfumeMeta}>
                      <Text style={styles.perfumeFamily}>
                        {perfume.familia}
                      </Text>
                      <Plus color={THEME.colors.success} size={18} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* ── INVENTARIO POR FAMILIA ── */}
        {!showAddPanel && (
          <>
            {familyNames.map((family) => (
              <View key={family}>
                <SectionHeader title={family} />
                {(groupedInventory[family] || [])
                  .filter(
                    (p) =>
                      !searchText ||
                      p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                      p.casa.toLowerCase().includes(searchText.toLowerCase())
                  )
                  .map((perfume) => (
                    <View key={perfume.id} style={styles.perfumeRow}>
                      <View style={styles.perfumeInfo}>
                        <Text style={styles.perfumeName} numberOfLines={1}>
                          {perfume.nombre}
                        </Text>
                        <Text style={styles.perfumeHouse}>
                          {perfume.casa} | {perfume.concentracion} |{' '}
                          {perfume.volumenMl}ml
                        </Text>
                        <Text style={styles.perfumeDetail}>
                          {perfume.precioRetail}€ retail |{' '}
                          {perfume.costeAtomizacion.toFixed(3)}€/spray |{' '}
                          {perfume.protocolosActivos} protocolos
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleRemovePerfume(perfume.id, perfume.nombre)
                        }
                        disabled={busy}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Minus color={THEME.colors.danger} size={18} />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            ))}

            {filteredInventory.length === 0 && !searchText && (
              <EmptyState message="Tu inventario está vacío. Toca 'Añadir a la Cava' para empezar." />
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 20,
  },
  bigCount: {
    color: '#FFF',
    fontSize: 40,
    textAlign: 'center',
  },
  bigLabel: {
    color: THEME.colors.gold,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  perfumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  perfumeInfo: {
    flex: 1,
    marginRight: 12,
  },
  perfumeName: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  perfumeHouse: {
    color: THEME.colors.goldDim,
    fontSize: 11,
    marginTop: 2,
  },
  perfumeDetail: {
    color: THEME.colors.textDim,
    fontSize: 9,
    marginTop: 2,
  },
  perfumeMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  perfumeFamily: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 1,
  },
});
