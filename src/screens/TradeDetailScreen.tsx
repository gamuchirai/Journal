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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, CheckCircle2, X, XCircle } from 'lucide-react-native';
import { RootStackParamList, Trade, BiasData, NarrativeData, EntryData } from '../types';
import { C } from '../constants/Colors';
import { cardShadow, amberShadow } from '../constants/Styles';
import * as db from '../database';
import { deleteTradeImages } from '../utils/imageUtils';
import { useTradeStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeDetail'>;

const LCheck = Check as React.ComponentType<any>;
const LCheckCircle2 = CheckCircle2 as React.ComponentType<any>;
const LX = X as React.ComponentType<any>;
const LXCircle = XCircle as React.ComponentType<any>;

const DetailSectionTitle = ({
  icon,
  label,
}: {
  icon: React.ComponentType<any>;
  label: string;
}) => (
  <View style={styles.detailSectionTitleRow}>
    {React.createElement(icon, { size: 14, strokeWidth: 2.2, style: { color: C.teal } })}
    <Text style={styles.buildingBlockTitle}>{label}</Text>
  </View>
);

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
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.teal} />
        </View>
      </SafeAreaView>
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
              <Text style={styles.playedOutBadgeText}>-</Text>
            </View>
          ) : (
            <View style={[
              styles.playedOutBadge,
              { backgroundColor: playedOut ? C.gain : C.loss }
            ]}>
              {playedOut ? (
                <LCheck size={12} strokeWidth={2.8} style={{ color: '#ffffff' }} />
              ) : (
                <LX size={12} strokeWidth={2.8} style={{ color: '#ffffff' }} />
              )}
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
        <Text style={styles.outcomeUnanswered}>-</Text>
      ) : (
        <View
          style={[
            styles.outcomeBadge,
            { backgroundColor: value ? C.gain : C.loss },
          ]}
        >
          <Text style={styles.outcomeBadgeText}>{value ? 'Yes' : 'No'}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header Info */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.market}>{trade.market}</Text>
          <Text style={[styles.pnl, { color: trade.pnl ? (parseFloat(trade.pnl) > 0 ? C.gain : C.loss) : C.textMuted }]}>
            {trade.pnl || '-'}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(trade.date)}</Text>
        <View style={styles.headerDetails}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{trade.timeframe}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: C.surface }]}>
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
          title="Bias"
          playedOut={typeof trade.bias === 'object' ? (trade.bias as BiasData).playedOut : null}
        >
          {typeof trade.bias === 'object' ? (
            <>
              <View style={styles.blockRow}>
                <Text style={styles.blockFieldLabel}>Direction:</Text>
                <View style={[styles.directionBadge, { 
                  backgroundColor: (trade.bias as BiasData).direction === 'Long' ? C.gain : 
                                   (trade.bias as BiasData).direction === 'Short' ? C.loss : C.textMuted 
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
          title="Narrative"
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
          title="Entry"
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
              <View style={styles.noteTitleRow}>
                <LCheckCircle2 size={14} strokeWidth={2.2} style={{ color: C.gain }} />
                <Text style={styles.noteTitle}>What Went Right</Text>
              </View>
              <Text style={styles.noteText}>{trade.notes.whatWentRight}</Text>
            </View>
          )}
          {trade.notes.whatWentWrong && (
            <View style={styles.noteBox}>
              <View style={styles.noteTitleRow}>
                <LXCircle size={14} strokeWidth={2.2} style={{ color: C.loss }} />
                <Text style={styles.noteTitle}>What Went Wrong</Text>
              </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  headerCard: {
    backgroundColor: C.teal,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    ...amberShadow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  market: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  pnl: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 14,
  },
  headerDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: C.amber,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...cardShadow,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.teal,
    marginBottom: 14,
  },
  detailSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: 280,
    backgroundColor: C.surface,
  },
  tapToViewText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(13,46,56,0.7)',
    color: '#ffffff',
    fontFamily: 'DMSans_500Medium',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
  },
  blockGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  blockItem: {
    flex: 1,
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  blockLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 4,
  },
  blockValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: C.text,
  },
  buildingBlockCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  buildingBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buildingBlockTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.teal,
  },
  buildingBlockContent: {
    padding: 12,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  blockFieldLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: C.textMuted,
  },
  blockFieldValue: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: C.text,
  },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  directionBadgeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  playedOutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playedOutText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: C.textDim,
    letterSpacing: 0.3,
  },
  playedOutBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBadgeNeutral: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBadgeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 11,
  },
  riskGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  riskItem: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  riskLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 6,
  },
  riskValue: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
    color: C.text,
  },
  outcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editOutcomesButton: {
    backgroundColor: C.tealLight,
    borderWidth: 1,
    borderColor: C.tealDim,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editOutcomesText: {
    fontFamily: 'DMSans_600SemiBold',
    color: C.teal,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  outcomeGrid: {
    gap: 2,
  },
  outcomeBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  outcomeLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: C.text,
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outcomeBadgeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  outcomeUnanswered: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 16,
    color: C.textDim,
  },
  noteBox: {
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  noteTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.teal,
    marginBottom: 6,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  noteText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: C.amber,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    ...amberShadow,
  },
  editButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  deleteButton: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: C.lossDim,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(192,66,74,0.22)',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: C.loss,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
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
