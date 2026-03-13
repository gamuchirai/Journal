import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../constants/Colors';

/**
 * Full-screen centered loading spinner, used in every screen's initial
 * loading state before data is available.
 */
const ScreenLoadingState = () => (
  <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
    <View style={styles.center}>
      <ActivityIndicator size="large" color={C.teal} />
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScreenLoadingState;
