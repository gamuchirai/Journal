import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { C } from '../constants/Colors';

interface SelectPickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SelectPickerModal = ({ visible, title, options, onSelect, onClose }: SelectPickerModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title || 'Select Option'}</Text>
        <ScrollView style={styles.list}>
          {options.map((option) => (
            <TouchableOpacity key={option} style={styles.option} onPress={() => onSelect(option)}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,46,56,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: C.elevated,
    borderRadius: 20,
    maxHeight: '70%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontFamily: 'Fraunces_300Light',
    fontSize: 18,
    fontWeight: '300',
    color: C.teal,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  optionText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: C.text,
  },
  closeBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  closeBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
    color: C.textMuted,
  },
});

export default SelectPickerModal;
