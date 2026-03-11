import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, TabParamList } from '../types';
import { COLORS } from '../constants';

import DashboardScreen from '../screens/DashboardScreen';
import TradeListScreen from '../screens/TradeListScreen';
import CreateEditTradeScreen from '../screens/CreateEditTradeScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';

// ── DIAGNOSTIC LOGS ──────────────────────────────────────────────────────────
console.log('[NAV] Platform.OS:', Platform.OS);
console.log('[NAV] Screens:', {
  DashboardScreen: typeof DashboardScreen,
  TradeListScreen: typeof TradeListScreen,
  CreateEditTradeScreen: typeof CreateEditTradeScreen,
  TradeDetailScreen: typeof TradeDetailScreen,
});
// ──────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

console.log('[NAV] Tab.Navigator type (real):', typeof Tab.Navigator);
console.log('[NAV] Tab.Screen type (real):', typeof Tab.Screen);

// For web, use a simple state-based tab navigation
const WebTabNavigator = () => {
  const [activeTab, setActiveTab] = React.useState<'Dashboard' | 'Trades'>('Dashboard');
  const [modals, setModals] = React.useState<{ CreateEditTrade?: boolean; TradeDetail?: { tradeId: string } }>({});
  const insets = useSafeAreaInsets();
  
  console.log('[WebTabNavigator] rendering with activeTab:', activeTab, 'modals:', Object.keys(modals));
  
  // Create mock navigation object for screens
  const mockNavigation = React.useMemo(() => ({
    navigate: (screen: string, params?: any) => {
      console.log('[WebTabNavigator.navigate] Called with screen:', screen, 'params:', params);
      if (screen === 'CreateEditTrade') {
        setModals(m => ({ ...m, CreateEditTrade: true }));
      } else if (screen === 'Trades') {
        setActiveTab('Trades');
      } else if (screen === 'Dashboard') {
        setActiveTab('Dashboard');
      }
    },
    getParent: () => ({
      navigate: (screen: string, params?: any) => {
        console.log('[WebTabNavigator.getParent.navigate] Called with screen:', screen, 'params:', params);
      }
    }),
    addListener: (event: string, callback: () => void) => {
      console.log('[WebTabNavigator.addListener] Added listener for:', event);
      return () => {}; // Return unsubscribe function
    },
  }), []);
  
  const handleAddTrade = () => {
    console.log('[WebTabNavigator] handleAddTrade called');
    setModals(m => ({ ...m, CreateEditTrade: true }));
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Content - conditionally render screens */}
      <View style={{ flex: 1 }}>
        {activeTab === 'Dashboard' ? (
          <DashboardScreen 
            navigation={mockNavigation as any}
            route={{ params: {} } as any}
          />
        ) : (
          <TradeListScreen 
            navigation={mockNavigation as any}
            route={{ params: {} } as any}
          />
        )}
      </View>
      
      {/* Modals - overlay on top */}
      {modals.CreateEditTrade && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
        } as any}>
          <View style={{ 
            backgroundColor: COLORS.background, 
            maxHeight: '90%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}>
            {/* Create Trade Screen */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.text }}>
                New Trade
              </Text>
              <TouchableOpacity
                onPress={() => setModals(m => ({ ...m, CreateEditTrade: false }))}
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 24, color: COLORS.textLight }}>×</Text>
              </TouchableOpacity>
            </View>
            <CreateEditTradeScreen 
              navigation={{
                ...mockNavigation,
                goBack: () => setModals(m => ({ ...m, CreateEditTrade: false }))
              } as any}
              route={{ params: {} } as any}
            />
          </View>
        </View>
      )}
      
      {/* Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]} testID="web-tab-bar">
        {[
          { name: 'Dashboard' as const, icon: '⊞', label: 'Dashboard' },
          { name: 'Trades' as const, icon: '☰', label: 'Trades' },
        ].map((tab) => {
          const isFocused = activeTab === tab.name;
          const handleTabPress = () => {
            console.log('[WebTabNavigator] Tab pressed:', tab.name);
            setActiveTab(tab.name);
          };
          
          // For web platform, use native button element
          if (Platform.OS === 'web') {
            return (
              <button
                key={tab.name}
                onClick={handleTabPress}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: 'transparent',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: isFocused ? 1 : 0.6,
                } as any}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {tab.icon}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: isFocused ? COLORS.primary : COLORS.textLight 
                }}>
                  {tab.label}
                </div>
              </button>
            );
          }
          
          // Native version
          return (
            <TouchableOpacity 
              key={tab.name} 
              style={styles.tab}
              onPress={handleTabPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={styles.fabWrapper}>
          {Platform.OS === 'web' ? (
            <button
              onClick={handleAddTrade}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.primary,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 28,
                color: COLORS.white,
                fontWeight: 'bold',
              } as any}
            >
              +
            </button>
          ) : (
            <TouchableOpacity 
              style={styles.fab} 
              onPress={handleAddTrade} 
              activeOpacity={0.85}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  console.log('[CustomTabBar] rendering, state.index:', state.index);
  const insets = useSafeAreaInsets();
  const handleAddTrade = () => { 
    console.log('[CustomTabBar] handleAddTrade called');
    navigation.getParent()?.navigate('CreateEditTrade', {}); 
  };
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
            onPress={() => { 
              console.log('[CustomTabBar] Tab pressed:', tab.name);
              if (!isFocused) navigation.navigate(tab.name); 
            }}
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

// For native, use the bottom tab navigator
const NativeTabNavigator = () => {
  console.log('[NativeTabNavigator] rendering');
  return (
    <Tab.Navigator
      tabBar={(props) => {
        console.log('[NativeTabNavigator.tabBar] rendering custom tab bar');
        return <CustomTabBar {...props} />;
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trades" component={TradeListScreen} />
    </Tab.Navigator>
  );
};

// Platform-aware tab navigator selector
const TabNavigator = () => {
  console.log('[TabNavigator] Selecting navigator for platform:', Platform.OS);
  
  if (Platform.OS === 'web') {
    console.log('[TabNavigator] Using WebTabNavigator');
    return <WebTabNavigator />;
  }
  
  console.log('[TabNavigator] Using NativeTabNavigator');
  return <NativeTabNavigator />;
};

export const RootNavigator = () => {
  console.log('[RootNavigator] rendering');
  console.log('[RootNavigator] Stack.Navigator:', typeof Stack.Navigator);
  console.log('[RootNavigator] TabNavigator:', typeof TabNavigator);
  
  const handleNavigationReady = () => {
    console.log('[RootNavigator] Navigation ready!');
  };
  
  const handleNavigationStateChange = (state: any) => {
    console.log('[RootNavigator] Navigation state changed:', state?.routeNames, 'current index:', state?.index);
  };
  
  return (
    <NavigationContainer 
      onReady={handleNavigationReady}
      onStateChange={handleNavigationStateChange}
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>[NAV] Loading navigation...</Text>
        </View>
      }
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen 
          name="Tabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateEditTrade"
          component={CreateEditTradeScreen}
          options={({ route }: { route: any }) => ({
            title: route.params?.tradeId ? 'Edit Trade' : 'New Trade',
            presentation: 'modal',
          })}
        />
        <Stack.Screen 
          name="TradeDetail" 
          component={TradeDetailScreen}
          options={{ title: 'Trade Details', presentation: 'card' }}
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
