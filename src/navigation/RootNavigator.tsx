import React from 'react';
import { Grid2x2, LayoutDashboard, List, ClipboardList, Plus, X } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, TabParamList } from '../types';
import { C } from '../constants/Colors';
import { amberShadow } from '../constants/Styles';

import DashboardScreen from '../screens/DashboardScreen';
import TradeListScreen from '../screens/TradeListScreen';
import CreateEditTradeScreen from '../screens/CreateEditTradeScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';

console.log('[NAV] Platform.OS:', Platform.OS);
console.log('[NAV] Screens:', {
  DashboardScreen: typeof DashboardScreen,
  TradeListScreen: typeof TradeListScreen,
  CreateEditTradeScreen: typeof CreateEditTradeScreen,
  TradeDetailScreen: typeof TradeDetailScreen,
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type TabName = 'Dashboard' | 'Trades';

const LGrid2x2 = Grid2x2 as React.ComponentType<any>;
const LLayoutDashboard = LayoutDashboard as React.ComponentType<any>;
const LList = List as React.ComponentType<any>;
const LClipboardList = ClipboardList as React.ComponentType<any>;
const LPlus = Plus as React.ComponentType<any>;
const LX = X as React.ComponentType<any>;

const tabMeta: Array<{
  name: TabName;
  label: string;
  icon: React.ComponentType<any>;
  focusedIcon: React.ComponentType<any>;
}> = [
  { name: 'Dashboard', label: 'Dashboard', icon: LGrid2x2, focusedIcon: LLayoutDashboard },
  { name: 'Trades', label: 'Trades', icon: LList, focusedIcon: LClipboardList },
];

const TabIcon = ({
  Icon,
  FocusedIcon,
  focused,
}: {
  Icon: React.ComponentType<any>;
  FocusedIcon: React.ComponentType<any>;
  focused: boolean;
}) => {
  const ActiveIcon = focused ? FocusedIcon : Icon;
  return (
    <View style={styles.tabIconWrap}>
      <ActiveIcon
        size={18}
        stroke={focused ? C.teal : C.textDim}
        fill={focused ? C.teal : 'none'}
        strokeWidth={2.2}
        style={styles.tabIcon}
      />
    </View>
  );
};

console.log('[NAV] Tab.Navigator type (real):', typeof Tab.Navigator);
console.log('[NAV] Tab.Screen type (real):', typeof Tab.Screen);

// For web, use a simple state-based tab navigation
const WebTabNavigator = () => {
  const [activeTab, setActiveTab] = React.useState<TabName>('Dashboard');
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
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Content */}
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
            backgroundColor: C.bg, 
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
              borderBottomColor: C.border,
            }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: C.text }}>
                New Trade
              </Text>
              <TouchableOpacity
                onPress={() => setModals(m => ({ ...m, CreateEditTrade: false }))}
                style={{ padding: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close new trade modal"
              >
                <LX size={22} strokeWidth={2.6} style={{ color: C.textMuted }} />
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
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 18) }]} testID="web-tab-bar">
        {tabMeta.map((tab) => {
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
                aria-label={tab.label}
                style={{
                  flex: 1,
                  paddingTop: 10,
                  paddingBottom: 18,
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
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                  <TabIcon Icon={tab.icon} FocusedIcon={tab.focusedIcon} focused={isFocused} />
                </div>
                <div style={{ 
                  fontSize: 12,
                  fontFamily: 'DMSans_600SemiBold, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isFocused ? C.teal : C.textDim
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
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <TabIcon Icon={tab.icon} FocusedIcon={tab.focusedIcon} focused={isFocused} />
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
              aria-label="Add trade"
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: C.amber,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(243,149,48,0.32)',
              } as any}
            >
              <LPlus size={28} strokeWidth={2.6} style={{ color: '#ffffff' }} />
            </button>
          ) : (
            <TouchableOpacity 
              style={styles.fab} 
              onPress={handleAddTrade} 
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Add trade"
            >
              <LPlus size={28} strokeWidth={2.6} style={{ color: '#ffffff' }} />
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
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
      {tabMeta.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity key={tab.name} style={styles.tab}
            onPress={() => { 
              console.log('[CustomTabBar] Tab pressed:', tab.name);
              if (!isFocused) navigation.navigate(tab.name); 
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
              <TabIcon Icon={tab.icon} FocusedIcon={tab.focusedIcon} focused={isFocused} />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddTrade}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add trade"
        >
          <LPlus size={28} strokeWidth={2.6} style={{ color: '#ffffff' }} />
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
          headerStyle: { backgroundColor: C.teal },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontFamily: 'DMSans_600SemiBold', fontSize: 16 },
          contentStyle: { backgroundColor: C.bg },
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.elevated,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    height: 96,
    paddingBottom: 18,
    position: 'relative',
  },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  tabIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {},
  tabLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, letterSpacing: 0.7, textTransform: 'uppercase', color: C.textDim },
  tabLabelActive: { color: C.teal },
  fabWrapper: { position: 'absolute', top: -20, left: '50%', transform: [{ translateX: -26 }], zIndex: 10 },
  fab: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.amber, justifyContent: 'center', alignItems: 'center', ...amberShadow },
});
