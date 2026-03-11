import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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
  BottomTabScreenProps<TabParamList, 'Trades'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TradeListScreen = ({ navigation }: Props) => {
  console.log('[TradeListScreen] component mounted');
  const { trades, loadTrades, loading } = useTradeStore();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('[TradeListScreen] useEffect 1 - filter changed:', filter);
    loadTrades(filter as any);
  }, [filter]);

  useEffect(() => {
    console.log('[TradeListScreen] useEffect 2 - focus listener setup');
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[TradeListScreen] focus event fired');
      loadTrades(filter as any);
    });
    return unsubscribe;
  }, [navigation, filter]);

  console.log('[TradeListScreen] render - trades:', trades.length, 'loading:', loading, 'filter:', filter);

  const handleSelectTrade = (trade: Trade) => {
    console.log('[TradeListScreen] Navigating to TradeDetail with id:', trade.id);
    navigation.navigate('TradeDetail', { tradeId: trade.id });
  };

  const handleAddTrade = () => {
    console.log('[TradeListScreen] handleAddTrade called');
    navigation.getParent()?.navigate('CreateEditTrade', {});
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPnLColor = (pnl: string | null) => {
    if (!pnl) return COLORS.textLight;
    const value = parseFloat(pnl);
    return value > 0 ? COLORS.success : value < 0 ? COLORS.error : COLORS.textLight;
  };

  const renderTradeCard = ({ item }: { item: Trade }) => {
    console.log('Rendering trade card:', item.id, 'Market:', item.market);
    return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectTrade(item)}
      activeOpacity={0.7}
    >
      {item.thumbnailUri && (
        <Image
          source={{ uri: item.thumbnailUri }}
          style={styles.thumbnail}
        />
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.market}>{String(item.market || '')}</Text>
          <Text style={[styles.pnl, { color: getPnLColor(item.pnl) }]}>
            {String(item.pnl || '-')}
          </Text>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <Text style={styles.timeframe}>{String(item.timeframe || '')}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'active'
                    ? COLORS.warning
                    : item.status === 'closed'
                    ? COLORS.secondary
                    : COLORS.border,
              },
            ]}
          >
            <Text style={styles.statusText}>{String(item.status || 'draft')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );};

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !filter && styles.filterButtonActive]}
          onPress={() => setFilter(undefined)}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={styles.filterButtonText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'closed' && styles.filterButtonActive]}
          onPress={() => setFilter('closed')}
        >
          <Text style={styles.filterButtonText}>Closed</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trades.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No trades yet</Text>
          <Text style={styles.emptySubtext}>Create your first trade to get started</Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          renderItem={renderTradeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={[styles.fab, { bottom: 24 + insets.bottom }]} onPress={handleAddTrade}>
        <Text style={styles.fabText}>{String('+')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.analyticsButton, { bottom: 24 + insets.bottom }]}
        onPress={() => navigation.navigate('Analytics')}
      >
        <Text style={styles.analyticsButtonText}>{String('📊')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.secondary,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  market: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pnl: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  timeframe: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  analyticsButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  analyticsButtonText: {
    fontSize: 24,
  },
});

export default TradeListScreen;
