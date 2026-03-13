import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList, Trade } from '../types';
import { C } from '../constants/Colors';
import { T, S } from '../constants/Styles';
import { useTradeStore } from '../store';
import { useTradeImageMap } from '../hooks';
import { TradeCardListItem } from '../components';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Trades'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TradeListScreen = ({ navigation }: Props) => {
  console.log('[TradeListScreen] component mounted');
  const { trades, loadTrades, loading } = useTradeStore();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const tradeImageUriMap = useTradeImageMap(trades);
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



  const renderTradeCard = ({ item }: { item: Trade }) => (
    <TradeCardListItem
      trade={item}
      imageUri={tradeImageUriMap[item.id] || null}
      onPress={() => handleSelectTrade(item)}
    />
  );

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
