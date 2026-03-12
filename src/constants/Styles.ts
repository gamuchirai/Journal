import { StyleSheet } from 'react-native';
import { C } from './Colors';

/** Reusable card shadow (iOS + Android) */
export const cardShadow = {
  shadowColor: C.teal,
  shadowOpacity: 0.06,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export const accentShadow = {
  shadowColor: C.teal,
  shadowOpacity: 0.28,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

export const amberShadow = {
  shadowColor: C.amber,
  shadowOpacity: 0.32,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

/** Typography presets */
export const T = StyleSheet.create({
  screenTitle: {
    fontFamily: 'Fraunces_300Light',
    fontSize: 26,
    fontWeight: '300',
    color: C.teal,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  modalTitle: {
    fontFamily: 'Fraunces_300Light',
    fontSize: 20,
    fontWeight: '300',
    color: C.teal,
    letterSpacing: -0.4,
  },
  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    color: C.textDim,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  fieldSectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: C.teal,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: C.teal,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  statLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.8,
    lineHeight: 28,
  },
  mono: {
    fontFamily: 'DMMono_400Regular',
    color: C.text,
  },
  monoMedium: {
    fontFamily: 'DMMono_500Medium',
    color: C.text,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
  },
  bodyMuted: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.textMuted,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: C.textMuted,
  },
  headerSub: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: C.textDim,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  navLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});

/** Shared layout / component styles */
export const S = StyleSheet.create({

  // ── Screen ──
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ──
  header: {
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  // ── Cards ──
  card: {
    backgroundColor: C.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...cardShadow,
  },
  cardSm: {
    backgroundColor: C.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    ...cardShadow,
  },
  cardAccent: {
    backgroundColor: C.teal,
    borderRadius: 20,
    padding: 20,
    ...accentShadow,
  },

  // ── Section spacing ──
  sectionLabel: {
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 10,
  },

  // ── Buttons ──
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: C.amber,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...amberShadow,
  },
  btnPrimaryText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 0.1,
  },
  btnGhost: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: C.textMuted,
  },
  btnDanger: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: C.lossDim,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(192,66,74,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDangerText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: C.loss,
  },

  // ── Select / input fields ──
  selectBtn: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.textMuted,
  },
  inputField: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: C.text,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
    height: 72,
    textAlignVertical: 'top',
  },

  // ── Played-out buttons ──
  playedBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playedBtnYes: {
    borderColor: 'rgba(26,138,106,0.3)',
    backgroundColor: C.gainDim,
  },
  playedBtnNo: {
    borderColor: 'rgba(192,66,74,0.3)',
    backgroundColor: C.lossDim,
  },

  // ── Status / badges ──
  badgeClosed: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: C.border,
  },
  badgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: C.amberDim,
  },
  badgeClosedText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  badgeActiveText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 9,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.amber,
  },

  // ── Timeframe chip ──
  tfChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: C.tealLight,
    borderWidth: 1,
    borderColor: C.tealDim,
  },
  tfChipText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 10,
    color: C.teal,
  },

  // ── Modal sheet ──
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,46,56,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.elevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomWidth: 0,
    maxHeight: '88%',
    shadowColor: C.teal,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  // ── Bottom nav ──
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.elevated,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
    paddingHorizontal: 24,
    height: 82,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navPlusBtn: {
    width: 52,
    height: 52,
    backgroundColor: C.amber,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: C.amber,
    shadowOpacity: 0.38,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 24,
  },

  // ── Screenshot placeholder ──
  screenshotPlaceholder: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: C.elevated,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.border,
    borderRadius: 16,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  // ── Gap helpers ──
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
});
