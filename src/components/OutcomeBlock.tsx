import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../constants/Colors';

interface OutcomeBlockProps {
  label: string;
  value: boolean | null;
}

/**
 * A single row in the outcome evaluation grid — shows a label and a
 * Yes / No badge, or a dash when the value is null.
 */
const OutcomeBlock = ({ label, value }: OutcomeBlockProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    {value === null ? (
      <Text style={styles.unanswered}>-</Text>
    ) : (
      <View style={[styles.badge, { backgroundColor: value ? C.gain : C.loss }]}>
        <Text style={styles.badgeText}>{value ? 'Yes' : 'No'}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: C.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  unanswered: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 16,
    color: C.textDim,
  },
});

export default OutcomeBlock;
