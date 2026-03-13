import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../constants/Colors';

interface SectionTitleProps {
  Icon: React.ComponentType<any>;
  label: string;
}

/**
 * Renders an icon + uppercase teal label row, used as a section heading
 * inside form cards (e.g. Bias, Narrative, Entry).
 */
const SectionTitle = ({ Icon, label }: SectionTitleProps) => (
  <View style={styles.row}>
    <Icon size={14} strokeWidth={2.2} style={{ color: C.teal }} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.teal,
  },
});

export default SectionTitle;
