import { useCallback, useEffect, useState } from 'react';
import * as db from '../database';

interface DashboardAnalytics {
  totalTrades: number;
  winRate: number;
  blockRates: {
    bias: number;
    narrative: number;
    context: number;
    entry: number;
    risk: number;
  };
}

interface UseDashboardAnalyticsResult {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Loads win rate, block success rates, and trade count from the database.
 * Re-runs whenever `reload()` is called (e.g. on screen focus).
 */
export const useDashboardAnalytics = (): UseDashboardAnalyticsResult => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    console.log('[useDashboardAnalytics] loadData called');
    try {
      setLoading(true);
      const trades = await db.getAllTrades();
      const rate = await db.getWinRate();
      const blockRates = await db.getBlockSuccessRates();
      setAnalytics({
        totalTrades: trades.length,
        winRate: Math.round(rate),
        blockRates,
      });
    } catch (e) {
      console.error('[useDashboardAnalytics] Error in loadData:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { analytics, loading, reload: loadData };
};
