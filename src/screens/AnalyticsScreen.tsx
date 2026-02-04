import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import * as db from '../database';

type Props = NativeStackScreenProps<RootStackParamList, 'Analytics'>;

interface Analytics {
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

const AnalyticsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAnalytics();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const trades = await db.getAllTrades();
      const completedTrades = trades.filter(
        (t) => t.status === 'closed' || t.status === 'reviewed'
      );
      const winRate = await db.getWinRate();
      const blockRates = await db.getBlockSuccessRates();

      setAnalytics({
        totalTrades: trades.length,
        winRate: Math.round(winRate),
        blockRates,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const AnalyticsCard = ({
    title,
    value,
    unit = '',
    color = COLORS.primary,
  }: {
    title: string;
    value: number;
    unit?: string;
    color?: string;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>
        {value}
        {unit && <Text style={styles.cardUnit}>{unit}</Text>}
      </Text>
    </View>
  );

  const BlockCard = ({ label, rate }: { label: string; rate: number }) => (
    <View style={styles.blockCard}>
      <Text style={styles.blockLabel}>{label}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${rate}%`,
              backgroundColor:
                rate >= 70 ? COLORS.success : rate >= 50 ? COLORS.warning : COLORS.error,
            },
          ]}
        />
      </View>
      <Text style={styles.blockRate}>{rate}%</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.cardsGrid}>
          <AnalyticsCard
            title="Total Trades"
            value={analytics.totalTrades}
            color={COLORS.primary}
          />
          <AnalyticsCard
            title="Win Rate"
            value={analytics.winRate}
            unit="%"
            color={
              analytics.winRate >= 55
                ? COLORS.success
                : analytics.winRate >= 50
                ? COLORS.warning
                : COLORS.error
            }
          />
        </View>
      </View>

      {/* Building Blocks Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Building Blocks Success Rate</Text>
        <View style={styles.blocksContainer}>
          <BlockCard label="Bias" rate={analytics.blockRates.bias} />
          <BlockCard label="Narrative" rate={analytics.blockRates.narrative} />
          <BlockCard label="Context" rate={analytics.blockRates.context} />
          <BlockCard label="Entry" rate={analytics.blockRates.entry} />
          <BlockCard label="Risk Management" rate={analytics.blockRates.risk} />
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            {analytics.winRate >= 60
              ? '✓ Excellent win rate! Your process is working well.'
              : analytics.winRate >= 50
              ? '→ Your win rate is above 50%. Focus on consistency.'
              : '→ Work on identifying what\'s holding back your win rate.'}
          </Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            {Math.max(
              analytics.blockRates.bias,
              analytics.blockRates.narrative,
              analytics.blockRates.context,
              analytics.blockRates.entry,
              analytics.blockRates.risk
            ) === analytics.blockRates.bias
              ? 'Your bias analysis is your strongest block.'
              : Math.max(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.narrative
              ? 'Your narrative setup is your strongest block.'
              : Math.max(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.context
              ? 'Your context reading is your strongest block.'
              : Math.max(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.entry
              ? 'Your entry execution is your strongest block.'
              : 'Your risk management is your strongest block.'}
          </Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            {Math.min(
              analytics.blockRates.bias,
              analytics.blockRates.narrative,
              analytics.blockRates.context,
              analytics.blockRates.entry,
              analytics.blockRates.risk
            ) === analytics.blockRates.bias
              ? 'Focus on improving your bias analysis.'
              : Math.min(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.narrative
              ? 'Your narrative setups need refinement.'
              : Math.min(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.context
              ? 'Work on better context evaluation.'
              : Math.min(
                  analytics.blockRates.bias,
                  analytics.blockRates.narrative,
                  analytics.blockRates.context,
                  analytics.blockRates.entry,
                  analytics.blockRates.risk
                ) === analytics.blockRates.entry
              ? 'Refine your entry execution.'
              : 'Review your risk management process.'}
          </Text>
        </View>
      </View>
    </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
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

export default AnalyticsScreen;
