import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { C } from '../constants/Colors';

interface Props {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];   // combined recentMarkets + FOREX_PAIRS, de-duped
  hasError?: boolean;
}

const MarketSearchInput = ({ value, onChange, suggestions, hasError }: Props) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const trimmed = query.trim().toUpperCase();

  const filtered = trimmed
    ? suggestions.filter((s) => s.toUpperCase().includes(trimmed))
    : suggestions;

  // Only offer "Add" if the trimmed input is non-empty and doesn't already
  // exist exactly in suggestions (case-insensitive).
  const exactMatch = suggestions.some(
    (s) => s.toUpperCase() === trimmed
  );
  const showAddOption = trimmed.length > 0 && !exactMatch;

  const commit = (val: string) => {
    const normalised = val.trim().toUpperCase();
    setQuery(normalised);
    onChange(normalised);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleChangeText = (text: string) => {
    setQuery(text.toUpperCase());
    onChange(text.trim().toUpperCase());
    setOpen(true);
  };

  const handleFocus = () => setOpen(true);

  const handleBlur = () => {
    // small delay so a tap on a suggestion registers before blur
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <View>
      <View style={[styles.inputBox, hasError && styles.inputBoxError]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="e.g. EUR/USD"
          placeholderTextColor={C.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => query.trim() && commit(query)}
        />
      </View>

      {open && (filtered.length > 0 || showAddOption) && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            style={styles.list}
            nestedScrollEnabled
          >
            {showAddOption && (
              <TouchableOpacity
                style={styles.addRow}
                onPress={() => commit(trimmed)}
              >
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>Add "{trimmed}"</Text>
              </TouchableOpacity>
            )}
            {filtered.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.row}
                onPress={() => commit(item)}
              >
                <Text style={styles.rowText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputBoxError: {
    borderColor: C.loss,
    borderWidth: 1.5,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
    padding: 0,
    margin: 0,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: C.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: 220,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  list: {
    maxHeight: 220,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  addIcon: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: C.teal,
  },
  addText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: C.teal,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight ?? C.border,
  },
  rowText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
  },
});

export default MarketSearchInput;
