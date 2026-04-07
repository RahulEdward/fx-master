/**
 * FX-Master Terminal Store (Zustand)
 * Central state management — panels, watchlist, connection, logs, etc.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PANELS, DEFAULT_LAYOUT, FOREX_PAIRS } from '../lib/constants';

export const useTerminalStore = create(
  persist(
    (set, get) => ({
      // ─── Connection ──────────────────────────
      connection: { api: 'checking', ws: 'disconnected', lastCheck: null, mode: 'live' },
      setConnection: (update) => set(s => ({ connection: { ...s.connection, ...update } })),

      // ─── Panels ──────────────────────────────
      panels: DEFAULT_PANELS,
      togglePanel: (id) => set(s => ({
        panels: s.panels.map(p => p.id === id ? { ...p, visible: !p.visible } : p),
      })),
      minimizePanel: (id) => set(s => ({
        panels: s.panels.map(p => p.id === id ? { ...p, minimized: !p.minimized } : p),
      })),
      maximizedPanelId: null,
      setMaximizedPanel: (id) => set({ maximizedPanelId: id }),

      // ─── Layout ──────────────────────────────
      isEditMode: false,
      setEditMode: (v) => set({ isEditMode: v }),
      isAutosaveEnabled: true,
      savedLayouts: { default: { lg: DEFAULT_LAYOUT } },
      activeLayoutName: 'default',
      pendingLayouts: null,
      saveLayout: (name, layouts) => set(s => ({
        savedLayouts: { ...s.savedLayouts, [name]: layouts },
        pendingLayouts: null,
      })),
      updatePendingLayout: (layouts) => set({ pendingLayouts: layouts }),
      setActiveLayout: (name) => set({ activeLayoutName: name }),

      // ─── Watchlists ──────────────────────────
      watchlists: {
        'Favorites': FOREX_PAIRS.slice(0, 8).map(p => p.symbol),
        'Majors': ['EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD', 'USD_CAD', 'NZD_USD'],
      },
      activeWatchlist: 'Favorites',
      setActiveWatchlist: (name) => set({ activeWatchlist: name }),
      createWatchlist: (name) => set(s => {
        if (s.watchlists[name]) return s;
        return { watchlists: { ...s.watchlists, [name]: [] }, activeWatchlist: name };
      }),
      deleteWatchlist: (name) => set(s => {
        if (name === 'Favorites') return s; // Cannot delete default
        const newWatchlists = { ...s.watchlists };
        delete newWatchlists[name];
        const nextActive = s.activeWatchlist === name ? 'Favorites' : s.activeWatchlist;
        return { watchlists: newWatchlists, activeWatchlist: nextActive };
      }),
      addToWatchlist: (symbol) => set(s => {
        const list = s.watchlists[s.activeWatchlist] || [];
        if (list.includes(symbol)) return s;
        return { watchlists: { ...s.watchlists, [s.activeWatchlist]: [...list, symbol] } };
      }),
      removeFromWatchlist: (symbol) => set(s => {
        const list = s.watchlists[s.activeWatchlist] || [];
        return { watchlists: { ...s.watchlists, [s.activeWatchlist]: list.filter(sym => sym !== symbol) } };
      }),

      // ─── Selected Symbol ─────────────────────
      selectedSymbol: 'EUR_USD',
      setSelectedSymbol: (sym) => set({ selectedSymbol: sym }),

      // ─── Prices (live) ───────────────────────
      prices: {},
      updatePrice: (symbol, data) => set(s => {
        const prev = s.prices[symbol];
        const bidDir = prev && data.bid !== undefined
          ? (data.bid > prev.bid ? 'up' : data.bid < prev.bid ? 'down' : prev.bidDir || null)
          : null;
        const askDir = prev && data.ask !== undefined
          ? (data.ask > prev.ask ? 'up' : data.ask < prev.ask ? 'down' : prev.askDir || null)
          : null;
        const openBid = prev?.openBid ?? data.bid;
        return {
          prices: {
            ...s.prices,
            [symbol]: {
              ...prev,
              ...data,
              prevBid: prev?.bid,
              prevAsk: prev?.ask,
              openBid,
              bidDir,
              askDir,
              flashAt: (data.bid !== prev?.bid || data.ask !== prev?.ask) ? Date.now() : (prev?.flashAt || 0),
              updatedAt: Date.now(),
            },
          },
        };
      }),

      // ─── Logs / Command Output ───────────────
      logs: [],
      addLog: (type, message) => set(s => ({
        logs: [...s.logs.slice(-200), { type, message, time: new Date().toISOString() }],
      })),
      clearLogs: () => set({ logs: [] }),
      showCommandOutput: false,
      setShowCommandOutput: (v) => set({ showCommandOutput: v }),

      // ─── Chart Settings ──────────────────────
      chartSettings: { timeframe: 'H1', chartType: 'candlestick', showVolume: true },
      setChartSettings: (update) => set(s => ({
        chartSettings: { ...s.chartSettings, ...update },
      })),

      // ─── Defaults ────────────────────────────
      defaults: {
        lotSize: 0.01,
        slPips: 50,
        tpPips: 100,
      },
      setDefaults: (update) => set(s => ({
        defaults: { ...s.defaults, ...update },
      })),

      // ─── Command Bar ─────────────────────────
      commandBarOpen: false,
      setCommandBarOpen: (v) => set({ commandBarOpen: v }),
    }),
    {
      name: 'fxmaster-terminal',
      merge: (persistedState, currentState) => {
        const safePersist = persistedState || {};
        // Ensure every watchlist value is a valid array
        const rawWatchlists = safePersist.watchlists || currentState.watchlists;
        const safeWatchlists = {};
        for (const [key, val] of Object.entries(rawWatchlists)) {
          safeWatchlists[key] = Array.isArray(val) ? val : [];
        }
        return {
          ...currentState,
          ...safePersist,
          watchlists: safeWatchlists,
          panels: Array.isArray(safePersist.panels) ? safePersist.panels : currentState.panels,
          activeWatchlist: safePersist.activeWatchlist || currentState.activeWatchlist,
        };
      },
      partialize: (state) => ({
        watchlists: state.watchlists,
        activeWatchlist: state.activeWatchlist,
        savedLayouts: state.savedLayouts,
        activeLayoutName: state.activeLayoutName,
        chartSettings: state.chartSettings,
        defaults: state.defaults,
        panels: state.panels,
        isAutosaveEnabled: state.isAutosaveEnabled,
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
);
