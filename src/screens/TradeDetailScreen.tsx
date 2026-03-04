import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Trade, BiasData, NarrativeData, EntryData } from '../types';
import { COLORS } from '../constants';
import * as db from '../database';
import { deleteTradeImages } from '../utils/imageUtils';
import { useTradeStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeDetail'>;

const TradeDetailScreen = ({ navigation, route }: Props) => {
  const { tradeId } = route.params;
  const { deleteTrade } = useTradeStore();
  const insets = useSafeAreaInsets();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTrade();
  }, [tradeId]);

  const loadTrade = async () => {
    try {
      const loaded = await db.getTrade(tradeId);
      setTrade(loaded);
    } catch (error) {
      Alert.alert('Error', 'Failed to load trade');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Trade', 'Are you sure you want to delete this trade?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            if (trade?.screenshotUri || trade?.thumbnailUri) {
              await deleteTradeImages(trade.screenshotUri, trade.thumbnailUri);
            }
            await deleteTrade(tradeId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete trade');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditOutcomes = () => {
    // Navigate to edit mode or show modal
    navigation.navigate('CreateEditTrade', { tradeId });
  };

  if (loading || !trade) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Building Block Card Component with Played Out indicator
  const BuildingBlockCard = ({ 
    title, 
    playedOut, 
    children 
  }: { 
    title: string; 
    playedOut: boolean | null; 
    children: React.ReactNode 
  }) => (
    <View style={styles.buildingBlockCard}>
      <View style={styles.buildingBlockHeader}>
        <Text style={styles.buildingBlockTitle}>{title}</Text>
        <View style={styles.playedOutIndicator}>
          <Text style={styles.playedOutText}>Played Out</Text>
          {playedOut === null ? (
            <View style={styles.playedOutBadgeNeutral}>
              <Text style={styles.playedOutBadgeText}>—</Text>
            </View>
          ) : (
            <View style={[
              styles.playedOutBadge,
              { backgroundColor: playedOut ? COLORS.success : COLORS.error }
            ]}>
              <Text style={styles.playedOutBadgeText}>{playedOut ? '✓' : '✕'}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.buildingBlockContent}>
        {children}
      </View>
    </View>
  );

  const OutcomeBlock = ({ label, value }: { label: string; value: boolean | null }) => (
    <View style={styles.outcomeBlock}>
      <Text style={styles.outcomeLabel}>{label}</Text>
      {value === null ? (
        <Text style={styles.outcomeUnanswered}>—</Text>
      ) : (
        <View
          style={[
            styles.outcomeBadge,
            { backgroundColor: value ? COLORS.success : COLORS.error },
          ]}
        >
          <Text style={styles.outcomeBadgeText}>{value ? 'Yes' : 'No'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.market}>{trade.market}</Text>
          <Text style={[styles.pnl, { color: trade.pnl ? (parseFloat(trade.pnl) > 0 ? COLORS.success : COLORS.error) : COLORS.textLight }]}>
            {trade.pnl || '-'}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(trade.date)}</Text>
        <View style={styles.headerDetails}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{trade.timeframe}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.secondary }]}>
            <Text style={styles.badgeText}>{trade.status}</Text>
          </View>
        </View>
      </View>

      {/* Chart Screenshot */}
      {trade.screenshotUri && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chart Analysis</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setImageModalVisible(true)}
          >
            <Image source={{ uri: trade.screenshotUri }} style={styles.detailImage} />
            <Text style={styles.tapToViewText}>Tap to expand</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Trading Building Blocks - New Structured Format */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading Building Blocks</Text>
        
        {/* Bias Block */}
        <BuildingBlockCard 
          title="📊 Bias"
          playedOut={typeof trade.bias === 'object' ? (trade.bias as BiasData).playedOut : null}
        >
          {typeof trade.bias === 'object' ? (
            <>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Direction:</Text>
                <View style={[styles.directionBadge, { 
                  backgroundColor: (trade.bias as BiasData).direction === 'Long' ? COLORS.success : 
                                   (trade.bias as BiasData).direction === 'Short' ? COLORS.error : COLORS.textLight 
                }]}>
                  <Text style={styles.directionBadgeText}>{(trade.bias as BiasData).direction}</Text>
                </View>
              </View>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>PD Array:</Text>
                <Text style={styles.blockFieldValue}>{(trade.bias as BiasData).pdArray}</Text>
              </View>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Timeframe:</Text>
                <Text style={styles.blockFieldValue}>{(trade.bias as BiasData).timeframe}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.blockValue}>{trade.bias as string}</Text>
          )}
        </BuildingBlockCard>
        
        {/* Narrative Block */}
        <BuildingBlockCard 
          title="📖 Narrative"
          playedOut={typeof trade.narrative === 'object' ? (trade.narrative as NarrativeData).playedOut : null}
        >
          {typeof trade.narrative === 'object' ? (
            <>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Context Area:</Text>
                <Text style={styles.blockFieldValue}>{(trade.narrative as NarrativeData).contextArea}</Text>
              </View>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>PD Array:</Text>
                <Text style={styles.blockFieldValue}>{(trade.narrative as NarrativeData).pdArray}</Text>
              </View>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Timeframe:</Text>
                <Text style={styles.blockFieldValue}>{(trade.narrative as NarrativeData).timeframe}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.blockValue}>{trade.narrative as string}</Text>
          )}
        </BuildingBlockCard>
        
        {/* Entry Block */}
        <BuildingBlockCard 
          title="🎯 Entry"
          playedOut={typeof trade.entry === 'object' ? (trade.entry as EntryData).playedOut : null}
        >
          {typeof trade.entry === 'object' ? (
            <>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Entry Pattern:</Text>
                <Text style={styles.blockFieldValue}>{(trade.entry as EntryData).entryPattern}</Text>
              </View>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Timeframe:</Text>
                <Text style={styles.blockFieldValue}>{(trade.entry as EntryData).timeframe}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.blockValue}>{trade.entry as string}</Text>
          )}
        </BuildingBlockCard>
      </View>

      {/* Risk Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Management</Text>
        <View style={styles.riskGrid}>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Stop Loss</Text>
            <Text style={styles.riskValue}>{trade.risk.stop}</Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>Target</Text>
            <Text style={styles.riskValue}>{trade.risk.target}</Text>
          </View>
          <View style={styles.riskItem}>
            <Text style={styles.riskLabel}>R:R Ratio</Text>
            <Text style={styles.riskValue}>{trade.risk.riskReward}</Text>
          </View>
        </View>
      </View>

      {/* Outcomes Evaluation */}
      {(trade.status === 'closed' || trade.status === 'reviewed') && (
        <View style={styles.section}>
          <View style={styles.outcomeHeader}>
            <Text style={styles.sectionTitle}>Outcome Evaluation</Text>
            <TouchableOpacity
              style={styles.editOutcomesButton}
              onPress={handleEditOutcomes}
            >
              <Text style={styles.editOutcomesText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.outcomeGrid}>
            <OutcomeBlock label="Bias Played Out" value={trade.outcomes.biasPlayedOut} />
            <OutcomeBlock label="Narrative Played Out" value={trade.outcomes.narrativePlayedOut} />
            <OutcomeBlock label="Context Held" value={trade.outcomes.contextHeld} />
            <OutcomeBlock label="Entry Executed" value={trade.outcomes.entryExecuted} />
            <OutcomeBlock label="Risk Managed" value={trade.outcomes.riskManaged} />
          </View>
        </View>
      )}

      {/* Notes */}
      {(trade.notes.whatWentRight || trade.notes.whatWentWrong) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {trade.notes.whatWentRight && (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>✓ What Went Right</Text>
              <Text style={styles.noteText}>{trade.notes.whatWentRight}</Text>
            </View>
          )}
          {trade.notes.whatWentWrong && (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>✕ What Went Wrong</Text>
              <Text style={styles.noteText}>{trade.notes.whatWentWrong}</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('CreateEditTrade', { tradeId })}
        >
          <Text style={styles.editButtonText}>Edit Trade</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Trade</Text>
        </TouchableOpacity>
      </View>

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setImageModalVisible(false)}
          >
            <Image source={{ uri: trade.screenshotUri! }} style={styles.fullImage} />
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  market: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pnl: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  headerDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    margin: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.secondary,
  },
  tapToViewText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  blockGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  blockItem: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
  },
  blockLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  // New Building Block Card Styles
  buildingBlockCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  buildingBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buildingBlockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  buildingBlockContent: {
    padding: 12,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  blockFieldLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  blockFieldValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  directionBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  playedOutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playedOutText: {
    fontSize: 11,
    color: COLORS.secondary,
  },
  playedOutBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBadgeNeutral: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  riskItem: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
  },
  riskLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  outcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editOutcomesButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editOutcomesText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  outcomeGrid: {
    gap: 8,
  },
  outcomeBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  outcomeLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  outcomeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outcomeBadgeText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  outcomeUnanswered: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  noteBox: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    margin: 12,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default TradeDetailScreen;
