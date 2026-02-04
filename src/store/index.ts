import { create } from 'zustand';
import { Trade, TradeStatus, UserPreferences } from '../types';
import * as db from '../database';

interface TradeStore {
  trades: Trade[];
  preferences: UserPreferences | null;
  selectedTrade: Trade | null;
  loading: boolean;
  error: string | null;

  // Trade actions
  loadTrades: (status?: TradeStatus) => Promise<void>;
  loadTrade: (id: string) => Promise<void>;
  saveTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  setSelectedTrade: (trade: Trade | null) => void;

  // Preferences actions
  loadPreferences: () => Promise<void>;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  trades: [],
  preferences: null,
  selectedTrade: null,
  loading: false,
  error: null,

  loadTrades: async (status?: TradeStatus) => {
    set({ loading: true, error: null });
    try {
      const trades = await db.getAllTrades(status);
      set({ trades, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load trades',
        loading: false,
      });
    }
  },

  loadTrade: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const trade = await db.getTrade(id);
      if (trade) {
        set({ selectedTrade: trade, loading: false });
      } else {
        set({ error: 'Trade not found', loading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load trade',
        loading: false,
      });
    }
  },

  saveTrade: async (trade: Trade) => {
    console.log('=== STORE: saveTrade called ===');
    console.log('Trade ID:', trade.id);
    
    set({ loading: true, error: null });
    try {
      // Check if trade exists in database
      console.log('Checking if trade exists...');
      const existingTrade = trade.id ? await db.getTrade(trade.id) : null;
      console.log('Existing trade:', existingTrade ? 'Found' : 'Not found');
      
      if (existingTrade) {
        console.log('Updating existing trade...');
        await db.updateTrade(trade);
        console.log('Trade updated successfully');
      } else {
        console.log('Creating new trade...');
        await db.createTrade(trade);
        console.log('Trade created successfully');
      }
      
      set({ selectedTrade: trade, loading: false });
      
      // Reload all trades
      console.log('Reloading all trades...');
      const updatedTrades = await db.getAllTrades();
      console.log('Loaded trades count:', updatedTrades.length);
      set({ trades: updatedTrades });
      console.log('=== STORE: saveTrade completed ===');
    } catch (error) {
      console.error('=== STORE: saveTrade error ===', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to save trade',
        loading: false,
      });
      throw error;
    }
  },

  deleteTrade: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await db.deleteTrade(id);
      set((state) => ({
        trades: state.trades.filter((t) => t.id !== id),
        selectedTrade: state.selectedTrade?.id === id ? null : state.selectedTrade,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete trade',
        loading: false,
      });
    }
  },

  setSelectedTrade: (trade: Trade | null) => {
    set({ selectedTrade: trade });
  },

  loadPreferences: async () => {
    try {
      const preferences = await db.getUserPreferences();
      set({ preferences });
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
