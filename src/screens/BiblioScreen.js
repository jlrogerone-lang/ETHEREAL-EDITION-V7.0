/**
 * ETHEREAL v7.0 - BIBLIOTHÈQUE SCREEN (Enciclopedia Magna)
 * ==========================================================
 * Navegador de los 500 protocolos de layering con filtros,
 * búsqueda y paginación infinita.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Filter, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Background,
  LuxuryCard,
  TierBadge,
  SectionHeader,
  EmptyState,
  THEME,
} from '../components/ui/SharedComponents';
import { useLayering } from '../context/LayeringContext';
import { OlfactoryFamily, ProtocolTier } from '../data/models';

const PAGE_SIZE = 20;

const TIER_FILTERS = [null, 'Alpha', 'Beta', 'Gamma', 'Delta'];
const SORT_OPTIONS = [
  { key: 'compatibilidad', label: 'Compatibilidad' },
  { key: 'ahorro', label: 'Ahorro' },
  { key: 'coste', label: 'Menor Coste' },
  { key: 'nombre', label: 'A-Z' },
];

export default function BiblioScreen({ navigation }) {
  const {
    initialized,
    loadProtocolsPage,
    favorites,
    toggleFavorite,
  } = useLayering();

  const [protocols, setProtocols] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedSort, setSelectedSort] = useState('compatibilidad');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const favSet = new Set(favorites);

  useEffect(() => {
    if (!initialized) return;
    resetAndLoad();
  }, [initialized, searchText, selectedTier, selectedSort]);

  const buildFilters = () => {
    const filtros = { ordenarPor: selectedSort, soloActivos: true };
    if (searchText) filtros.texto = searchText;
    if (selectedTier) filtros.tier = selectedTier;
    return filtros;
  };

  const resetAndLoad = async () => {
    const filtros = buildFilters();
    const result = await loadProtocolsPage(1, PAGE_SIZE, filtros);
    setProtocols(result.data);
    setPage(1);
    setTotalPages(result.totalPages);
    setTotal(result.total);
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await loadProtocolsPage(nextPage, PAGE_SIZE, buildFilters());
    setProtocols((prev) => [...prev, ...result.data]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await resetAndLoad();
    setRefreshing(false);
  }, [searchText, selectedTier, selectedSort]);

  const handleToggleFavorite = async (protocolId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite(protocolId);
  };

  const renderProtocol = ({ item }) => {
    const isFav = favSet.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('ProtocolDetail', { protocolId: item.id });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.protocolName} numberOfLines={1}>
                {item.nombreOperacion}
              </Text>
              <Text style={styles.protocolCategory} numberOfLines={1}>
                {item.categoria}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart
                color={isFav ? THEME.colors.gold : THEME.colors.textDim}
                size={18}
                fill={isFav ? THEME.colors.gold : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.protocolBody}>
            <View style={styles.protocolDetail}>
              <Text style={styles.detailLabel}>Perfumes</Text>
              <Text style={styles.detailValue}>
                {item.activosReales.length}
              </Text>
            </View>
            <View style={styles.protocolDetail}>
              <Text style={styles.detailLabel}>Compat.</Text>
              <Text style={styles.detailValue}>
                {item.compatibilidadQuimica.porcentajeParentesco.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.protocolDetail}>
              <Text style={styles.detailLabel}>Coste</Text>
              <Text style={styles.detailValue}>
                {item.analisisCoste.costeRealLayering.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.protocolDetail}>
              <Text style={[styles.detailValue, { color: THEME.colors.success }]}>
                +{item.analisisCoste.ahorroGenerado.toFixed(0)}€
              </Text>
              <TierBadge tier={item.compatibilidadQuimica.tier} size="small" />
            </View>
          </View>

          <Text style={styles.protocolDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Background />

      {/* ── HEADER ── */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>BIBLIOTHÈQUE</Text>
        <Text style={styles.headerSub}>
          {total} protocolos en la Enciclopedia Magna
        </Text>
      </View>

      {/* ── BÚSQUEDA ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search color={THEME.colors.goldDim} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar protocolo, categoría..."
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
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Filter
            color={showFilters ? THEME.colors.gold : THEME.colors.textDim}
            size={18}
          />
        </TouchableOpacity>
      </View>

      {/* ── FILTROS ── */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>TIER</Text>
          <View style={styles.filterRow}>
            {TIER_FILTERS.map((tier) => (
              <TouchableOpacity
                key={tier || 'all'}
                onPress={() => setSelectedTier(tier)}
                style={[
                  styles.filterChip,
                  selectedTier === tier && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTier === tier && styles.filterChipTextActive,
                  ]}
                >
                  {tier || 'Todos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>ORDENAR</Text>
          <View style={styles.filterRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSelectedSort(opt.key)}
                style={[
                  styles.filterChip,
                  selectedSort === opt.key && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSort === opt.key && styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── LISTA ── */}
      <FlatList
        data={protocols}
        renderItem={renderProtocol}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.gold}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState message="No se encontraron protocolos con estos filtros" />
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>Cargando más...</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: THEME.colors.gold,
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    color: THEME.colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  filterLabel: {
    color: THEME.colors.goldDim,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    backgroundColor: THEME.colors.cardBg,
  },
  filterChipActive: {
    borderColor: THEME.colors.gold,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  filterChipText: {
    color: THEME.colors.textDim,
    fontSize: 11,
  },
  filterChipTextActive: {
    color: THEME.colors.gold,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  protocolCard: {
    backgroundColor: THEME.colors.cardBg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  protocolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  protocolName: {
    color: THEME.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  protocolCategory: {
    color: THEME.colors.goldDim,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1,
  },
  protocolBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  protocolDetail: {
    alignItems: 'center',
    gap: 2,
  },
  detailLabel: {
    color: THEME.colors.textDim,
    fontSize: 9,
    letterSpacing: 1,
  },
  detailValue: {
    color: THEME.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  protocolDesc: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  loadingMore: {
    color: THEME.colors.goldDim,
    textAlign: 'center',
    padding: 16,
    fontSize: 11,
    letterSpacing: 1,
  },
});
