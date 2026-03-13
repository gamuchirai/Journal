import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types';
import { C } from '../constants/Colors';
import { T, S, cardShadow, accentShadow } from '../constants/Styles';
import { getStrongestBlockInsight, getWeakestBlockInsight } from '../utils/insightUtils';
import { ScreenLoadingState } from '../components';
import { useDashboardAnalytics } from '../hooks';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

const DashboardScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { analytics, loading, reload } = useDashboardAnalytics();

  const barAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', reload);
    return unsubscribe;
  }, [navigation, reload]);

  useEffect(() => {
    if (analytics) {
      barAnims.forEach((anim) => anim.setValue(0));
      const anims = barAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          delay: i * 80,
          useNativeDriver: false,
        })
      );
      Animated.stagger(80, anims).start();
    }
  }, [analytics]);



  const blocks = analytics
    ? [
        { label: 'Bias', rate: analytics.blockRates.bias },
        { label: 'Narrative', rate: analytics.blockRates.narrative },
        { label: 'Context', rate: analytics.blockRates.context },
        { label: 'Entry', rate: analytics.blockRates.entry },
        { label: 'Risk Mgmt', rate: analytics.blockRates.risk },
      ]
    : [];

  const insights = analytics
    ? [
        ...analytics.patternInsights,
        {
          icon: '◈',
          text:
            analytics.winRate >= 60
              ? 'Excellent win rate. Your process is working well.'
              : analytics.winRate >= 50
              ? 'Win rate above 50%. Focus on consistency.'
              : 'Work on identifying what is holding back your win rate.',
          type: 'positive' as const,
        },
        { icon: '▲', text: getStrongestBlockInsight(analytics.blockRates), type: 'positive' as const },
        { icon: '◇', text: getWeakestBlockInsight(analytics.blockRates), type: 'neutral' as const },
      ]
    : [];

  if (loading || !analytics) {
    return <ScreenLoadingState />;
  }

  return (
    <SafeAreaView style={ls.screen} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        style={ls.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View style={[S.header, ls.headerRow]}>
          <Image
            source={require('../../assets/header-logo.png')}
            style={ls.headerLogo}
            resizeMode="contain"
          />
          <Text style={T.headerSub}>
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Overview label */}
        <Text style={[T.sectionLabel, S.sectionLabel]}>Overview</Text>

        {/* Stat cards */}
        <View style={ls.statRow}>
          <View style={ls.statCard}>
            <Text style={T.statLabel}>Total Trades</Text>
            <Text style={[T.statValue, { marginTop: 8 }]}>{analytics.totalTrades}</Text>
            <Text style={ls.statDelta}>↑ All time</Text>
          </View>
          <View style={ls.statCardAccent}>
            <Text style={ls.statLabelLight}>Win Rate</Text>
            <Text style={[T.statValue, { color: '#ffffff', marginTop: 8 }]}>
              {analytics.winRate}%
            </Text>
            <Text style={ls.statDeltaLight}>
              {analytics.winRate >= 50 ? '↑ Above 50%' : '↓ Below 50%'}
            </Text>
          </View>
        </View>

        {/* Building Blocks label */}
        <Text style={[T.sectionLabel, S.sectionLabel]}>Building Blocks</Text>

        {/* Building block bars */}
        <View style={ls.blocksCard}>
          {blocks.map((block, i) => (
            <View key={block.label} style={[
              ls.blockRow,
              i < blocks.length - 1 && ls.blockRowDivider,
            ]}>
              <Text style={ls.blockLabel}>{block.label}</Text>
              <View style={ls.barBg}>
                <Animated.View
                  style={[
                    ls.barFill,
                    {
                      width: barAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${block.rate}%`],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={ls.barPct}>{block.rate}%</Text>
            </View>
          ))}
        </View>

        {/* Insights label */}
        <Text style={[T.sectionLabel, S.sectionLabel]}>Key Insights</Text>

        {/* Insight cards */}
        <View style={ls.insightsContainer}>
          {insights.map((insight, i) => (
            <View key={i} style={ls.insightCard}>
              <Text
                style={[
                  ls.insightIcon,
                  insight.type === 'positive'
                    ? ls.iconPositive
                    : insight.type === 'warning'
                    ? ls.iconWarning
                    : insight.type === 'negative'
                    ? ls.iconNegative
                    : ls.iconNeutral,
                ]}
              >
                {insight.icon}
              </Text>
              <Text style={ls.insightText}>{insight.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ls = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: {
    height: 36,
    width: 180,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...cardShadow,
  },
  statCardAccent: {
    flex: 1,
    backgroundColor: C.teal,
    borderRadius: 18,
    padding: 16,
    ...accentShadow,
  },
  statDelta: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: C.gain,
    marginTop: 6,
  },
  statLabelLight: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statDeltaLight: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 6,
  },
  blocksCard: {
    marginHorizontal: 24,
    backgroundColor: C.elevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    ...cardShadow,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  blockRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  blockLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: C.text,
    width: 70,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: C.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 6,
    backgroundColor: C.teal,
  },
  barPct: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: C.textMuted,
    width: 32,
    textAlign: 'right',
  },
  insightsContainer: {
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 28,
  },
  insightCard: {
    backgroundColor: C.elevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...cardShadow,
  },
  insightIcon: { fontSize: 13 },
  iconPositive: { color: C.teal },
  iconNeutral: { color: C.amber },
  iconWarning: { color: C.amber },
  iconNegative: { color: C.loss },
  insightText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
    flex: 1,
  },
});

export default DashboardScreen;
