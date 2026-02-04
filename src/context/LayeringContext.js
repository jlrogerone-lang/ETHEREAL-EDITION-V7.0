/**
 * ETHEREAL EDITION v7.0 - LAYERING CONTEXT (ViewModel)
 * ======================================================
 * React Context + useReducer = equivalente a ViewModel en Android.
 *
 * Provee estado global reactivo para:
 * - Protocolos de layering (500)
 * - Inventario de perfumes (53)
 * - Ahorro fiscal acumulado
 * - Favoritos
 * - Estado de carga / error
 *
 * USO: Envolver la App con <LayeringProvider> y usar useLayering() en componentes.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import * as Repository from '../services/LayeringRepository';
import * as InventoryManager from '../services/InventoryManager';

// ── ESTADO INICIAL ────────────────────────────────────

const initialState = {
  // Estado de sistema
  initialized: false,
  loading: true,
  error: null,

  // Protocolos
  protocols: [],
  protocolsPaginated: { data: [], total: 0, page: 1, totalPages: 0 },
  currentProtocol: null,

  // Inventario
  inventory: [],
  inventorySummary: null,

  // Favoritos
  favorites: [],
  favoriteProtocols: [],

  // Fiscal
  savingsSummary: null,
  financialReport: null,

  // Estadísticas
  stats: null,
};

// ── ACTION TYPES ──────────────────────────────────────

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  INITIALIZED: 'INITIALIZED',

  SET_PROTOCOLS: 'SET_PROTOCOLS',
  SET_PROTOCOLS_PAGE: 'SET_PROTOCOLS_PAGE',
  SET_CURRENT_PROTOCOL: 'SET_CURRENT_PROTOCOL',

  SET_INVENTORY: 'SET_INVENTORY',
  SET_INVENTORY_SUMMARY: 'SET_INVENTORY_SUMMARY',

  SET_FAVORITES: 'SET_FAVORITES',
  SET_FAVORITE_PROTOCOLS: 'SET_FAVORITE_PROTOCOLS',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',

  SET_SAVINGS: 'SET_SAVINGS',
  SET_FINANCIAL_REPORT: 'SET_FINANCIAL_REPORT',

  SET_STATS: 'SET_STATS',

  PERFUME_ADDED: 'PERFUME_ADDED',
  PERFUME_REMOVED: 'PERFUME_REMOVED',
  USAGE_REGISTERED: 'USAGE_REGISTERED',
};

// ── REDUCER ───────────────────────────────────────────

function layeringReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.INITIALIZED:
      return {
        ...state,
        initialized: true,
        loading: false,
        error: null,
        ...action.payload,
      };

    case ACTIONS.SET_PROTOCOLS:
      return { ...state, protocols: action.payload };

    case ACTIONS.SET_PROTOCOLS_PAGE:
      return { ...state, protocolsPaginated: action.payload };

    case ACTIONS.SET_CURRENT_PROTOCOL:
      return { ...state, currentProtocol: action.payload };

    case ACTIONS.SET_INVENTORY:
      return { ...state, inventory: action.payload };

    case ACTIONS.SET_INVENTORY_SUMMARY:
      return { ...state, inventorySummary: action.payload };

    case ACTIONS.SET_FAVORITES:
      return { ...state, favorites: action.payload };

    case ACTIONS.SET_FAVORITE_PROTOCOLS:
      return { ...state, favoriteProtocols: action.payload };

    case ACTIONS.TOGGLE_FAVORITE: {
      const { protocolId, isFavorite } = action.payload;
      let newFavs;
      if (isFavorite) {
        newFavs = [...state.favorites, protocolId];
      } else {
        newFavs = state.favorites.filter(id => id !== protocolId);
      }
      return { ...state, favorites: newFavs };
    }

    case ACTIONS.SET_SAVINGS:
      return { ...state, savingsSummary: action.payload };

    case ACTIONS.SET_FINANCIAL_REPORT:
      return { ...state, financialReport: action.payload };

    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };

    case ACTIONS.PERFUME_ADDED:
      return {
        ...state,
        inventory: action.payload.inventory,
        protocols: action.payload.protocols,
      };

    case ACTIONS.PERFUME_REMOVED:
      return {
        ...state,
        inventory: action.payload.inventory,
        protocols: action.payload.protocols,
      };

    case ACTIONS.USAGE_REGISTERED:
      return {
        ...state,
        savingsSummary: action.payload.savingsSummary,
      };

    default:
      return state;
  }
}

// ── CONTEXT ───────────────────────────────────────────

const LayeringContext = createContext(null);

// ── PROVIDER ──────────────────────────────────────────

export function LayeringProvider({ children }) {
  const [state, dispatch] = useReducer(layeringReducer, initialState);
  const initRef = useRef(false);

  // ── Inicialización automática al montar ──
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        const initResult = await Repository.initialize();
        const [inventory, favorites, savings, stats] = await Promise.all([
          InventoryManager.getFullInventory(),
          Repository.getFavorites(),
          Repository.getSavingsSummary(),
          Repository.getStats(),
        ]);

        dispatch({
          type: ACTIONS.INITIALIZED,
          payload: {
            inventory,
            favorites,
            savingsSummary: savings,
            stats,
          },
        });
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      }
    })();
  }, []);

  // ══════════════════════════════════════════════════
  // ACCIONES DISPONIBLES
  // ══════════════════════════════════════════════════

  // ── Protocolos ──

  const loadProtocols = useCallback(async (filtros = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const protocols = await Repository.searchProtocols(filtros);
      dispatch({ type: ACTIONS.SET_PROTOCOLS, payload: protocols });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return protocols;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  }, []);

  const loadProtocolsPage = useCallback(async (page = 1, pageSize = 20, filtros = {}) => {
    try {
      const result = await Repository.getProtocolsPaginated(page, pageSize, filtros);
      dispatch({ type: ACTIONS.SET_PROTOCOLS_PAGE, payload: result });
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { data: [], total: 0, page: 1, totalPages: 0 };
    }
  }, []);

  const selectProtocol = useCallback(async (protocolId) => {
    try {
      const protocol = await Repository.getProtocolById(protocolId);
      dispatch({ type: ACTIONS.SET_CURRENT_PROTOCOL, payload: protocol });
      return protocol;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, []);

  // ── Inventario ──

  const refreshInventory = useCallback(async () => {
    try {
      const [inventory, summary] = await Promise.all([
        InventoryManager.getFullInventory(),
        InventoryManager.getInventorySummary(),
      ]);
      dispatch({ type: ACTIONS.SET_INVENTORY, payload: inventory });
      dispatch({ type: ACTIONS.SET_INVENTORY_SUMMARY, payload: summary });
      return inventory;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  }, []);

  const addPerfume = useCallback(async (perfumeId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await InventoryManager.addPerfume(perfumeId);

      if (result.success) {
        const [inventory, protocols] = await Promise.all([
          InventoryManager.getFullInventory(),
          Repository.getAllProtocols(),
        ]);

        dispatch({
          type: ACTIONS.PERFUME_ADDED,
          payload: { inventory, protocols },
        });
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  const removePerfume = useCallback(async (perfumeId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await InventoryManager.removePerfume(perfumeId);

      if (result.success) {
        const [inventory, protocols] = await Promise.all([
          InventoryManager.getFullInventory(),
          Repository.getAllProtocols(),
        ]);

        dispatch({
          type: ACTIONS.PERFUME_REMOVED,
          payload: { inventory, protocols },
        });
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // ── Favoritos ──

  const toggleFavorite = useCallback(async (protocolId) => {
    try {
      const isFavorite = await Repository.toggleFavorite(protocolId);
      dispatch({
        type: ACTIONS.TOGGLE_FAVORITE,
        payload: { protocolId, isFavorite },
      });
      return isFavorite;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  }, []);

  const loadFavoriteProtocols = useCallback(async () => {
    try {
      const favProtocols = await Repository.getFavoriteProtocols();
      dispatch({ type: ACTIONS.SET_FAVORITE_PROTOCOLS, payload: favProtocols });
      return favProtocols;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  }, []);

  // ── Fiscal ──

  const registerUsage = useCallback(async (protocolId) => {
    try {
      const result = await Repository.registerProtocolUsage(protocolId);
      const savings = await Repository.getSavingsSummary();

      dispatch({
        type: ACTIONS.USAGE_REGISTERED,
        payload: { savingsSummary: savings },
      });

      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, []);

  const loadFinancialReport = useCallback(async () => {
    try {
      const report = await Repository.getFinancialReport();
      dispatch({ type: ACTIONS.SET_FINANCIAL_REPORT, payload: report });
      return report;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, []);

  const loadSavings = useCallback(async () => {
    try {
      const savings = await Repository.getSavingsSummary();
      dispatch({ type: ACTIONS.SET_SAVINGS, payload: savings });
      return savings;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, []);

  // ── Stats ──

  const refreshStats = useCallback(async () => {
    try {
      const stats = await Repository.getStats();
      dispatch({ type: ACTIONS.SET_STATS, payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return null;
    }
  }, []);

  // ── Sistema ──

  const resetSystem = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await Repository.resetAll();

      const [inventory, favorites, savings, stats] = await Promise.all([
        InventoryManager.getFullInventory(),
        Repository.getFavorites(),
        Repository.getSavingsSummary(),
        Repository.getStats(),
      ]);

      dispatch({
        type: ACTIONS.INITIALIZED,
        payload: {
          inventory,
          favorites,
          savingsSummary: savings,
          stats,
        },
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const exportData = useCallback(async () => {
    return Repository.exportData();
  }, []);

  const importData = useCallback(async (data) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await Repository.importData(data);

      const [inventory, favorites, savings, stats] = await Promise.all([
        InventoryManager.getFullInventory(),
        Repository.getFavorites(),
        Repository.getSavingsSummary(),
        Repository.getStats(),
      ]);

      dispatch({
        type: ACTIONS.INITIALIZED,
        payload: {
          inventory,
          favorites,
          savingsSummary: savings,
          stats,
        },
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // ── Consultas del InventoryManager ──

  const getTopValuePerfumes = useCallback(async (topN = 10) => {
    return InventoryManager.getTopValuePerfumes(topN);
  }, []);

  const getUnusedPerfumes = useCallback(async () => {
    return InventoryManager.getUnusedPerfumes();
  }, []);

  const suggestPerfumesToBuy = useCallback(async (topN = 5) => {
    return InventoryManager.suggestPerfumesToBuy(topN);
  }, []);

  const getInventoryByFamily = useCallback(async () => {
    return InventoryManager.getInventoryByFamily();
  }, []);

  const getInventoryByHouse = useCallback(async () => {
    return InventoryManager.getInventoryByHouse();
  }, []);

  const getAvailablePerfumes = useCallback(async () => {
    return InventoryManager.getAvailablePerfumes();
  }, []);

  // ══════════════════════════════════════════════════
  // VALOR DEL CONTEXTO
  // ══════════════════════════════════════════════════

  const value = {
    // Estado
    ...state,

    // Acciones - Protocolos
    loadProtocols,
    loadProtocolsPage,
    selectProtocol,

    // Acciones - Inventario
    refreshInventory,
    addPerfume,
    removePerfume,
    getTopValuePerfumes,
    getUnusedPerfumes,
    suggestPerfumesToBuy,
    getInventoryByFamily,
    getInventoryByHouse,
    getAvailablePerfumes,

    // Acciones - Favoritos
    toggleFavorite,
    loadFavoriteProtocols,

    // Acciones - Fiscal
    registerUsage,
    loadFinancialReport,
    loadSavings,

    // Acciones - Sistema
    refreshStats,
    resetSystem,
    exportData,
    importData,
  };

  return (
    <LayeringContext.Provider value={value}>
      {children}
    </LayeringContext.Provider>
  );
}

// ── HOOK ──────────────────────────────────────────────

/**
 * Hook para acceder al contexto de Layering.
 *
 * @example
 * const {
 *   inventory,
 *   savingsSummary,
 *   loadProtocols,
 *   addPerfume,
 *   registerUsage,
 * } = useLayering();
 */
export function useLayering() {
  const context = useContext(LayeringContext);
  if (!context) {
    throw new Error('useLayering debe usarse dentro de un <LayeringProvider>');
  }
  return context;
}

export default LayeringContext;
