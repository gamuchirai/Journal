import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

import TradeListScreen from '../screens/TradeListScreen';
import CreateEditTradeScreen from '../screens/CreateEditTradeScreen';
import TradeDetailScreen from '../screens/TradeDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen
          name="TradeList"
          component={TradeListScreen}
          options={{
            title: 'TradeFlow Journal',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="CreateEditTrade"
          component={CreateEditTradeScreen}
          options={({ route }) => ({
            title: route.params?.tradeId ? 'Edit Trade' : 'New Trade',
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="TradeDetail"
          component={TradeDetailScreen}
          options={{
            title: 'Trade Details',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
