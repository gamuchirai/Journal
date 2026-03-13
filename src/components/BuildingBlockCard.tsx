import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PlayedOutIndicator from './PlayedOutIndicator';
import { C } from '../constants/Colors';

interface BuildingBlockCardProps {
  title: string;
  playedOut: boolean | null;
  children: React.ReactNode;
}

/**
 * Card wrapper for a trading building block (Bias / Narrative / Entry).
 * Shows the block title, a PlayedOutIndicator, and child field rows.
 */
const BuildingBlockCard = ({ title, playedOut, children }: BuildingBlockCardProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <PlayedOutIndicator value={playedOut} />
    </View>
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.teal,
  },
  content: {
    padding: 12,
  },
});

export default BuildingBlockCard;
