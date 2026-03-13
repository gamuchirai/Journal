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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList, Trade } from '../types';
import { C } from '../constants/Colors';
import { T, S, cardShadow } from '../constants/Styles';
import { useTradeStore } from '../store';
import {
  calculateTradeRiskRewardRatio,
  calculateTradeRiskRewardValue,
} from '../utils/riskUtils';
import { resolveExistingImageUri } from '../utils/imageUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Trades'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TradeListScreen = ({ navigation }: Props) => {
  console.log('[TradeListScreen] component mounted');
  const { trades, loadTrades, loading } = useTradeStore();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [tradeImageUriMap, setTradeImageUriMap] = useState<Record<string, string | null>>({});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('[TradeListScreen] useEffect 1 - filter changed:', filter);
    loadTrades(filter as any);
  }, [filter]);

  useEffect(() => {
    let mounted = true;

    const resolveTradeImages = async () => {
      const pairs = await Promise.all(
        trades.map(async (trade) => {
          const resolvedUri = await resolveExistingImageUri(trade.thumbnailUri, trade.screenshotUri);
          return [trade.id, resolvedUri] as const;
        })
      );

      if (!mounted) return;

      const map = Object.fromEntries(pairs);
      setTradeImageUriMap(map);

      const withImages = trades.filter((trade) => !!(trade.thumbnailUri || trade.screenshotUri));
      const unresolved = withImages.filter((trade) => !map[trade.id]).map((trade) => trade.id);
      console.log('[TradeListScreen] image debug summary', {
        totalTrades: trades.length,
        withImages: withImages.length,
        resolvedImages: Object.values(map).filter(Boolean).length,
        unresolvedTradeIds: unresolved,
      });
    };

    resolveTradeImages();

    return () => {
      mounted = false;
    };
  }, [trades]);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPnLColor = (pnl: string | null) => {
    if (!pnl) return C.textMuted;
    const value = parseFloat(pnl);
    return value > 0 ? C.gain : value < 0 ? C.loss : C.textMuted;
  };

  const getRrColor = (ratioValue: number | null) => {
    if (ratioValue === null) return C.textMuted;
    if (ratioValue >= 3) return C.gain;
    if (ratioValue < 1) return C.loss;
    return C.teal;
  };

  const renderTradeCard = ({ item }: { item: Trade }) => {
    const isActive = item.status === 'active';
    const rrRatio = calculateTradeRiskRewardRatio(item);
    const rrRatioValue = calculateTradeRiskRewardValue(item);
    const imageUri = tradeImageUriMap[item.id] || null;
    return (
    <TouchableOpacity
      style={[ls.card, isActive && ls.cardActive]}
      onPress={() => handleSelectTrade(item)}
      activeOpacity={0.85}
    >
      <View style={ls.cardLeft}>
        <View style={ls.titleRow}>
          <Text style={ls.pairText}>{String(item.market || '')}</Text>
          {imageUri ? (
            <View style={ls.thumbnailIndicator}>
              <Image
                source={{ uri: imageUri }}
                style={ls.thumbnailMini}
                onLoadStart={() =>
                  console.log('[TradeListScreen] thumbnail onLoadStart', {
                    tradeId: item.id,
                    imageUri,
                  })
                }
                onLoad={() =>
                  console.log('[TradeListScreen] thumbnail onLoad', {
                    tradeId: item.id,
                    imageUri,
                  })
                }
                onError={(event) =>
                  console.error('[TradeListScreen] thumbnail onError', {
                    tradeId: item.id,
                    imageUri,
                    error: event.nativeEvent.error,
                  })
                }
              />
            </View>
          ) : null}
        </View>
        <View style={ls.cardMeta}>
          <Text style={ls.dateText}>{formatDate(item.date)}</Text>
          {item.timeframe ? (
            <View style={S.tfChip}>
              <Text style={S.tfChipText}>{String(item.timeframe)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={ls.cardRight}>
        <Text style={[ls.pnlText, { color: getPnLColor(item.pnl) }]}>
          {String(item.pnl || '—')}
        </Text>
        <Text style={[ls.rrText, { color: getRrColor(rrRatioValue) }]}>{rrRatio || '-'}</Text>
        
        <View style={isActive ? S.badgeActive : S.badgeClosed}>
          <Text style={isActive ? S.badgeActiveText : S.badgeClosedText}>
            {String(item.status || 'draft')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );};

  const filters = ['All', 'Active', 'Closed'];

  return (
    <SafeAreaView style={ls.screen} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={S.header}>
        <Text style={T.screenTitle}>My Trades</Text>
        <Text style={T.headerSub}>{trades.length} total</Text>
      </View>

      {/* Filter chips */}
      <View style={ls.filterRow}>
        {filters.map((f) => {
          const val = f === 'All' ? undefined : f.toLowerCase();
          const isActive = filter === val;
          return (
            <TouchableOpacity
              key={f}
              style={[ls.chip, isActive && ls.chipActive]}
              onPress={() => setFilter(val)}
            >
              <Text style={[ls.chipText, isActive && ls.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={ls.center}>
          <ActivityIndicator size="large" color={C.teal} />
        </View>
      ) : trades.length === 0 ? (
        <View style={ls.center}>
          <Text style={ls.emptyText}>No trades yet</Text>
          <Text style={ls.emptySubtext}>Create your first trade to get started</Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          renderItem={renderTradeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: insets.bottom + 90, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const ls = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  chipText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: C.textMuted,
  },
  chipTextActive: { color: '#ffffff' },
  card: {
    backgroundColor: C.elevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardShadow,
  },
  cardActive: {
    borderColor: 'rgba(243,149,48,0.4)',
    backgroundColor: '#fffdf9',
  },
  cardLeft: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  thumbnailIndicator: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  thumbnailMini: {
    width: '100%',
    height: '100%',
  },
  pairText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 15,
    color: C.text,
    letterSpacing: 0.6,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: C.textDim,
  },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  pnlText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  rrText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: C.textMuted,
  },
  emptyText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: C.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.textMuted,
  },
});

export default TradeListScreen;
