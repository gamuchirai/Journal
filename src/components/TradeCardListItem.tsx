import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Trade } from '../types';
import { C } from '../constants/Colors';
import { S, cardShadow } from '../constants/Styles';
import { calculateTradeRiskRewardRatio, calculateTradeRiskRewardValue } from '../utils/riskUtils';
import { formatShortDate } from '../utils/dateUtils';
import { getPnLColor, getRrColor } from '../utils/colorUtils';

interface TradeCardListItemProps {
  trade: Trade;
  imageUri: string | null;
  onPress: () => void;
}

const TradeCardListItem = ({ trade, imageUri, onPress }: TradeCardListItemProps) => {
  const isActive = trade.status === 'active';
  const rrRatio = calculateTradeRiskRewardRatio(trade);
  const rrRatioValue = calculateTradeRiskRewardValue(trade);

  return (
    <TouchableOpacity
      style={[cs.card, isActive && cs.cardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={cs.cardLeft}>
        <View style={cs.titleRow}>
          <Text style={cs.pairText}>{String(trade.market || '')}</Text>
          {imageUri ? (
            <View style={cs.thumbnailIndicator}>
              <Image
                source={{ uri: imageUri }}
                style={cs.thumbnailMini}
                onLoadStart={() =>
                  console.log('[TradeCardListItem] thumbnail onLoadStart', {
                    tradeId: trade.id,
                    imageUri,
                  })
                }
                onLoad={() =>
                  console.log('[TradeCardListItem] thumbnail onLoad', {
                    tradeId: trade.id,
                    imageUri,
                  })
                }
                onError={(event) =>
                  console.error('[TradeCardListItem] thumbnail onError', {
                    tradeId: trade.id,
                    imageUri,
                    error: event.nativeEvent.error,
                  })
                }
              />
            </View>
          ) : null}
        </View>
        <View style={cs.cardMeta}>
          <Text style={cs.dateText}>{formatShortDate(trade.date)}</Text>
          {trade.timeframe ? (
            <View style={S.tfChip}>
              <Text style={S.tfChipText}>{String(trade.timeframe)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={cs.cardRight}>
        <Text style={[cs.pnlText, { color: getPnLColor(trade.pnl) }]}>
          {String(trade.pnl || '—')}
        </Text>
        <Text style={[cs.rrText, { color: getRrColor(rrRatioValue) }]}>{rrRatio || '-'}</Text>
        <View style={isActive ? S.badgeActive : S.badgeClosed}>
          <Text style={isActive ? S.badgeActiveText : S.badgeClosedText}>
            {String(trade.status || 'draft')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const cs = StyleSheet.create({
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
});

export default TradeCardListItem;
