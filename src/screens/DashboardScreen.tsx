import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList, Trade } from '../types';
import { COLORS } from '../constants';
import { useTradeStore } from '../store';
import * as db from '../database';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

const DashboardScreen = ({ navigation }: Props) => {
  console.log('[DashboardScreen] component mounted');
  const insets = useSafeAreaInsets();
  const { trades, loadTrades } = useTradeStore();
  const [winRate, setWinRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    console.log('[DashboardScreen] loadData called');
    try {
      console.log('[DashboardScreen] About to call loadTrades');
      setLoading(true);
      await loadTrades();
      console.log('[DashboardScreen] loadTrades completed, trades count:', trades.length);
      
      console.log('[DashboardScreen] About to call getWinRate');
      const rate = await db.getWinRate();
      console.log('[DashboardScreen] getWinRate returned:', rate);
      setWinRate(Math.round(rate));
    } catch (e) {
      console.error('[DashboardScreen] Error in loadData:', e);
    } finally {
      console.log('[DashboardScreen] loadData finally block');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DashboardScreen] useEffect 1 - initial load');
    loadData();
  }, []);

  useEffect(() => {
    console.log('[DashboardScreen] useEffect 2 - focus listener setup');
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[DashboardScreen] focus event fired');
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  console.log('[DashboardScreen] render - trades:', trades.length, 'loading:', loading);

  const recentTrades: Trade[] = trades.slice(0, 3);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getPnLColor = (pnl: string | null) => {
    if (!pnl) return COLORS.textLight;
    const v = parseFloat(pnl);
    return v > 0 ? COLORS.success : v < 0 ? COLORS.error : COLORS.textLight;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{trades.length}</Text>
          <Text style={styles.statLabel}>Total Trades</Text>
        </View>
        <View style={[styles.statCell, styles.statCellBordered]}>
          <Text style={[styles.statValue, { color: winRate >= 50 ? COLORS.success : COLORS.error }]}>
            {winRate}%
          </Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <TouchableOpacity
          style={[styles.statCell, styles.analyticsCell]}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text style={styles.analyticsIcon}>📊</Text>
          <Text style={[styles.statLabel, { color: COLORS.secondary }]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Trades */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          {trades.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Trades')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 32 }} />
        ) : recentTrades.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No trades yet</Text>
            <Text style={styles.emptySubtext}>Tap + to log your first trade</Text>
          </View>
        ) : (
          recentTrades.map((trade) => (
            <TouchableOpacity
              key={trade.id}
              style={styles.tradeRow}
              onPress={() => navigation.navigate('TradeDetail', { tradeId: trade.id })}
              activeOpacity={0.7}
            >
              <View style={styles.tradeRowLeft}>
                <Text style={styles.tradeMarket}>{trade.market}</Text>
                <Text style={styles.tradeDate}>
                  {formatDate(trade.date)} · {trade.timeframe}
                </Text>
              </View>
              <View style={styles.tradeRowRight}>
                {trade.pnl ? (
                  <Text style={[styles.tradePnl, { color: getPnLColor(trade.pnl) }]}>
                    {trade.pnl}
                  </Text>
                ) : (
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          trade.status === 'active' ? COLORS.warning : COLORS.border,
                      },
                    ]}
                  >
                    <Text style={styles.statusPillText}>{trade.status}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statCellBordered: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  analyticsCell: {
    backgroundColor: COLORS.primary,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  analyticsIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tradeRowLeft: {
    flex: 1,
  },
  tradeMarket: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  tradeDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  tradeRowRight: {
    alignItems: 'flex-end',
  },
  tradePnl: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});

export default DashboardScreen;
