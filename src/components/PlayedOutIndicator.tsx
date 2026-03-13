import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { C } from '../constants/Colors';

const LCheck = Check as React.ComponentType<any>;
const LX = X as React.ComponentType<any>;

interface PlayedOutIndicatorProps {
  value: boolean | null | undefined;
}

/**
 * Shows a small "Played Out" label with a green checkmark, red X,
 * or neutral dash badge, depending on the value.
 */
const PlayedOutIndicator = ({ value }: PlayedOutIndicatorProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>Played Out</Text>
    {value == null ? (
      <View style={styles.badgeNeutral}>
        <Text style={styles.badgeText}>-</Text>
      </View>
    ) : (
      <View style={[styles.badge, { backgroundColor: value ? C.gain : C.loss }]}>
        {value ? (
          <LCheck size={12} strokeWidth={2.8} style={{ color: '#ffffff' }} />
        ) : (
          <LX size={12} strokeWidth={2.8} style={{ color: '#ffffff' }} />
        )}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: C.textDim,
    letterSpacing: 0.3,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNeutral: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    color: C.textMuted,
    fontSize: 11,
  },
});

export default PlayedOutIndicator;
