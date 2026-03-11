import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, TabParamList } from '../types';
import { COLORS } from '../constants';
// Diagnose what react-native-screens exports — if Screen is undefined on web this is the root cause
import * as RNScreens from 'react-native-screens';

import DashboardScreen from '../screens/DashboardScreen';
import TradeListScreen from '../screens/TradeListScreen';
import CreateEditTradeScreen from '../screens/CreateEditTradeScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

// ── DIAGNOSTIC LOGS ──────────────────────────────────────────────────────────
console.log('[NAV] createBottomTabNavigator type:', typeof createBottomTabNavigator);
console.log('[NAV] Screens:', {
  DashboardScreen: typeof DashboardScreen,
  TradeListScreen: typeof TradeListScreen,
  CreateEditTradeScreen: typeof CreateEditTradeScreen,
  TradeDetailScreen: typeof TradeDetailScreen,
  AnalyticsScreen: typeof AnalyticsScreen,
});
console.log('[NAV] RNScreens.Screen:', typeof (RNScreens as any).Screen);
console.log('[NAV] RNScreens.ScreenContainer:', typeof (RNScreens as any).ScreenContainer);
console.log('[NAV] RNScreens keys:', Object.keys(RNScreens).join(', '));

try {
  const Tab_test = createBottomTabNavigator();
  console.log('[NAV] Tab.Navigator type:', typeof Tab_test.Navigator);
  console.log('[NAV] Tab.Screen type:', typeof Tab_test.Screen);
  console.log('[NAV] Tab.Group type:', typeof Tab_test.Group);
} catch (e) {
  console.error('[NAV] createBottomTabNavigator() threw:', e);
}
// ──────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

console.log('[NAV] Tab.Navigator type (real):', typeof Tab.Navigator);
console.log('[NAV] Tab.Screen type (real):', typeof Tab.Screen);

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const handleAddTrade = () => { navigation.getParent()?.navigate('CreateEditTrade', {}); };
  const tabs = [
    { name: 'Dashboard' as const, icon: '⊞', label: 'Dashboard' },
    { name: 'Trades' as const, icon: '☰', label: 'Trades' },
  ];
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity key={tab.name} style={styles.tab}
            onPress={() => { if (!isFocused) navigation.navigate(tab.name); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fab} onPress={handleAddTrade} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabNavigator = () => {
  console.log('[TabNavigator] rendering - DashboardScreen:', typeof DashboardScreen, DashboardScreen);
  console.log('[TabNavigator] rendering - TradeListScreen:', typeof TradeListScreen, TradeListScreen);
  console.log('[TabNavigator] Tab.Navigator:', typeof Tab.Navigator);
  console.log('[TabNavigator] Tab.Screen:', typeof Tab.Screen);
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'TradeFlow' }} />
      <Tab.Screen name="Trades" component={TradeListScreen} options={{ title: 'My Trades' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  console.log('[RootNavigator] rendering');
  console.log('[RootNavigator] Stack.Navigator:', typeof Stack.Navigator);
  console.log('[RootNavigator] TabNavigator:', typeof TabNavigator);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="CreateEditTrade"
          component={CreateEditTradeScreen}
          options={({ route }: { route: any }) => ({
            title: route.params?.tradeId ? 'Edit Trade' : 'New Trade',
            presentation: 'modal',
          })}
        />
        <Stack.Screen name="TradeDetail" component={TradeDetailScreen}
          options={{ title: 'Trade Details', presentation: 'card' }}
        />
        <Stack.Screen name="Analytics" component={AnalyticsScreen}
          options={{ title: 'Analytics', presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, position: 'relative' },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 4 },
  tabIcon: { fontSize: 22, color: COLORS.textLight, marginBottom: 2 },
  tabIconActive: { color: COLORS.primary },
  tabLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
  fabWrapper: { position: 'absolute', top: -24, left: '50%', transform: [{ translateX: -28 }], zIndex: 10 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 32, color: COLORS.white, fontWeight: 'bold', lineHeight: 36 },
});
