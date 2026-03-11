import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types';
import { COLORS } from '../constants';
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

const DashboardScreen = ({ navigation }: Props) => {
  console.log('[DashboardScreen] component mounted');
  const insets = useSafeAreaInsets();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    console.log('[DashboardScreen] loadData called');
    try {
      setLoading(true);
      console.log('[DashboardScreen] About to load analytics data');
      const trades = await db.getAllTrades();
      const rate = await db.getWinRate();
      const blockRates = await db.getBlockSuccessRates();
      setAnalytics({
        totalTrades: trades.length,
        winRate: Math.round(rate),
        blockRates,
      });
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

  console.log('[DashboardScreen] render - loading:', loading, 'hasAnalytics:', !!analytics);

  const getStrongestBlockInsight = (blockRates: DashboardAnalytics['blockRates']) => {
    const strongestBlock = Object.entries(blockRates).reduce((best, entry) =>
      entry[1] > best[1] ? entry : best
    );
    const labels: Record<string, string> = {
      bias: 'Your bias analysis is your strongest block.',
      narrative: 'Your narrative setup is your strongest block.',
      context: 'Your context reading is your strongest block.',
      entry: 'Your entry execution is your strongest block.',
      risk: 'Your risk management is your strongest block.',
    };
    return labels[strongestBlock[0]];
  };

  const getWeakestBlockInsight = (blockRates: DashboardAnalytics['blockRates']) => {
    const weakestBlock = Object.entries(blockRates).reduce((worst, entry) =>
      entry[1] < worst[1] ? entry : worst
    );
    const labels: Record<string, string> = {
      bias: 'Focus on improving your bias analysis.',
      narrative: 'Your narrative setups need refinement.',
      context: 'Work on better context evaluation.',
      entry: 'Refine your entry execution.',
      risk: 'Review your risk management process.',
    };
    return labels[weakestBlock[0]];
  };

  if (loading || !analytics) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.cardsGrid}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Trades</Text>
              <Text style={[styles.cardValue, styles.primaryValue]}>{analytics.totalTrades}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Win Rate</Text>
              <Text
                style={[
                  styles.cardValue,
                  analytics.winRate >= 55
                    ? styles.successValue
                    : analytics.winRate >= 50
                    ? styles.warningValue
                    : styles.errorValue,
                ]}
              >
                {analytics.winRate}
                <Text style={styles.cardUnit}>%</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Blocks Success Rate</Text>
          <View style={styles.blocksContainer}>
            {[
              { label: 'Bias', rate: analytics.blockRates.bias },
              { label: 'Narrative', rate: analytics.blockRates.narrative },
              { label: 'Context', rate: analytics.blockRates.context },
              { label: 'Entry', rate: analytics.blockRates.entry },
              { label: 'Risk Management', rate: analytics.blockRates.risk },
            ].map((block) => (
              <View key={block.label} style={styles.blockCard}>
                <Text style={styles.blockLabel}>{block.label}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${block.rate}%` },
                      block.rate >= 70
                        ? styles.successFill
                        : block.rate >= 50
                        ? styles.warningFill
                        : styles.errorFill,
                    ]}
                  />
                </View>
                <Text style={styles.blockRate}>{block.rate}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>
              {analytics.winRate >= 60
                ? 'Excellent win rate. Your process is working well.'
                : analytics.winRate >= 50
                ? 'Your win rate is above 50%. Focus on consistency.'
                : 'Work on identifying what is holding back your win rate.'}
            </Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>{getStrongestBlockInsight(analytics.blockRates)}</Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightText}>{getWeakestBlockInsight(analytics.blockRates)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 12,
  },
  section: {
    marginBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 18,
    marginLeft: 4,
  },
  primaryValue: {
    color: COLORS.primary,
  },
  successValue: {
    color: COLORS.success,
  },
  warningValue: {
    color: COLORS.warning,
  },
  errorValue: {
    color: COLORS.error,
  },
  blocksContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  blockCard: {
    marginBottom: 16,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  successFill: {
    backgroundColor: COLORS.success,
  },
  warningFill: {
    backgroundColor: COLORS.warning,
  },
  errorFill: {
    backgroundColor: COLORS.error,
  },
  blockRate: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'right',
  },
  insightBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default DashboardScreen;
