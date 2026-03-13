# TradeFlow — Design Implementation Prompt

> Paste this entire prompt into the **GitHub Copilot Chat** panel in VS Code with **Agent mode** enabled (`@workspace`).

---

## Prompt

```
@workspace Apply the following design system to the TradeFlow React Native Expo app. 
Every detail below is exact and must be followed precisely — do not substitute, 
approximate, or simplify any value. Preserve all existing functionality and logic; 
only change visual/style code.
```

---

## 1. Color Tokens

Create a central color constants file at `constants/Colors.ts` with exactly these values:

```ts
export const C = {
  bg:          '#e6f4f1',
  surface:     '#f2faf8',
  elevated:    '#ffffff',
  border:      '#cce8e2',
  borderLight: '#daf0eb',
  text:        '#0d2e38',
  textMuted:   '#4a7a86',
  textDim:     '#8ab4bc',
  teal:        '#0f6b86',
  tealDim:     'rgba(15,107,134,0.10)',
  tealLight:   'rgba(15,107,134,0.06)',
  amber:       '#f39530',
  amberDim:    'rgba(243,149,48,0.12)',
  gain:        '#1a8a6a',
  gainDim:     'rgba(26,138,106,0.10)',
  loss:        '#c0424a',
  lossDim:     'rgba(192,66,74,0.10)',
};
```

Import `C` from this file in every screen and component. Never hardcode color values inline.

---

## 2. Shared Stylesheet Architecture

Create a single shared styles file at `constants/Styles.ts`. This file is the **only** place `StyleSheet.create()` is called for shared/reusable styles. Screens and components import named style objects from here instead of defining their own. No style that is used in more than one place should be defined locally.

### File structure

```ts
// constants/Styles.ts
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
    letterSpacing: -0.5,
    color: C.teal,
  },
  modalTitle: {
    fontFamily: 'Fraunces_300Light',
    fontSize: 20,
    letterSpacing: -0.5,
    color: C.teal,
  },
  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: C.textDim,
  },
  fieldSectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.teal,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.teal,
  },
  statLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.textMuted,
  },
  statValue: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 28,
    letterSpacing: -0.8,
    color: C.text,
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
    fontSize: 12,
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
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: C.textDim,
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
    alignItems: 'center',
    gap: 12,
  },

  // ── Cards ──
  card: {
    backgroundColor: C.elevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  cardSm: {
    backgroundColor: C.elevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    ...cardShadow,
  },
  cardAccent: {
    backgroundColor: C.teal,
    borderRadius: 18,
    padding: 16,
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
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
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
    borderWidth: 1.5,
    borderColor: 'rgba(192,66,74,0.22)',
    borderRadius: 14,
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
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
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
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: C.text,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
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
    backgroundColor: C.border,
    borderRadius: 5,
  },
  badgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: C.amberDim,
    borderRadius: 5,
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
    backgroundColor: C.tealLight,
    borderWidth: 1,
    borderColor: C.tealDim,
    borderRadius: 4,
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
    borderBottomWidth: 0,
    borderColor: C.border,
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
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  // ── Bottom nav ──
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: C.elevated,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: 82,
    paddingHorizontal: 24,
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

  // ── Back button ──
  backBtn: {
    width: 34,
    height: 34,
    backgroundColor: C.elevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Common row / layout helpers ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  px24: {
    paddingHorizontal: 24,
  },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
});
```

### Import pattern in screens and components

```ts
import { C } from '@/constants/Colors';
import { S, T, cardShadow, amberShadow } from '@/constants/Styles';

// Usage
<View style={S.card}>
  <Text style={T.screenTitle}>TradeFlow</Text>
</View>
```

### Rules for screen-local styles

Each screen/component may define a local `StyleSheet.create({})` **only** for styles that are genuinely unique to that file and not reusable. The local stylesheet must still import and use `C` for all color values. Any style that appears in two or more files must be moved into `constants/Styles.ts`.

---

## 3. Typography

Use **three fonts only**, loaded via `expo-font` or `@expo-google-fonts`:

| Role | Font | Weights |
|---|---|---|
| Display / Headers | `Fraunces` | 300 (Light) |
| Body / UI | `DM Sans` | 300, 400, 500, 600 |
| Numbers / Monospace | `DM Mono` | 400, 500 |

### Rules
- Screen titles (`TradeFlow`, `My Trades`, `Trade Detail`, `New Trade`) → `Fraunces`, weight 300, size 26–28, `letterSpacing: -0.5`
- Section labels (OVERVIEW, BUILDING BLOCKS, etc.) → `DM Sans`, weight 600, size 10, `letterSpacing: 1.4`, uppercase
- All R-values, percentages, P&L figures, timestamps → `DM Mono`
- Body text, labels, descriptions → `DM Sans`
- Never use system fonts, Inter, Roboto, or SF Pro for anything visible

---

## 4. Global Layout

- Every screen root: `flex: 1`, background `C.bg`
- Use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top', 'bottom']}` on every screen
- Screen outer background (behind the app): `linear-gradient(135deg, #b8ddd8, #cce8e2)` — apply via the root container if on web preview
- All horizontal content padding: `24px`
- Card border radius: `16px` (standard) / `18px` (stat cards) / `20px` (detail hero)
- All cards use `elevation: 1` (Android) / `shadowColor: C.teal, shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: {width:0, height:1}` (iOS)

---

## 5. Header

Applied to every screen:

```
background: C.bg
borderBottomWidth: 1
borderBottomColor: C.border
paddingHorizontal: 24
paddingTop: 18
paddingBottom: 14
position: sticky (scrolls away only on non-fixed screens)
```

- Title: `Fraunces`, 300 weight, color `C.teal`
- Subtitle (date / count): `DM Sans`, 500 weight, size 11, color `C.textDim`, uppercase, `letterSpacing: 0.7`

---

## 6. Bottom Navigation

```
background: C.elevated
borderTopWidth: 1
borderTopColor: C.border
height: 82
paddingBottom: 18 (+ bottom safe area inset)
paddingHorizontal: 24
```

Three items: **Dashboard** · **+ button** · **Trades**

### Nav icons (Dashboard / Trades)
- Default: color `C.textDim`, size 20
- Active: color `C.teal`
- Label: `DM Sans`, 600 weight, size 9, uppercase, `letterSpacing: 0.7`

### Center `+` button
```
width: 52, height: 52
background: C.amber
borderRadius: 16
marginTop: -20  (lifts above nav bar)
fontSize: 26, color: white
shadowColor: C.amber
shadowOpacity: 0.38
shadowRadius: 10
shadowOffset: { width: 0, height: 6 }
elevation: 8
```

---

## 7. Dashboard Screen

### Stat Cards (2-column grid, gap 10)

**Left card — Total Trades:**
```
background: C.elevated
border: 1px C.border
borderRadius: 18
padding: 16
```
- Label: `DM Sans` 600, size 10, uppercase, color `C.textMuted`, letterSpacing 0.8
- Value: `DM Mono` 400, size 28, color `C.text`, letterSpacing -0.8
- Delta: `DM Sans` 500, size 11, color `C.gain`

**Right card — Win Rate:**
```
background: C.teal
borderRadius: 18
padding: 16
shadowColor: C.teal, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: {0,4}
elevation: 6
```
- Label: color `rgba(255,255,255,0.6)`
- Value: color `#ffffff`
- Delta: color `rgba(255,255,255,0.65)`

### Building Block Bars

- Bar track: height 5, background `C.border`, borderRadius 5
- Bar fill: `linear-gradient(→, C.teal, #2ab8a0)`, animated from 0 width on mount (duration 900ms, easing `cubic-bezier(0.4,0,0.2,1)`, staggered by 80ms per row)
- Label: `DM Sans` 500, size 12, color `C.textMuted`, fixed width 70
- Percentage: `DM Mono`, size 11, color `C.textMuted`, right-aligned, fixed width 32

### Insight Cards
```
background: C.elevated
border: 1px C.border
borderRadius: 13
padding: 12 14
shadowColor: C.teal, shadowOpacity: 0.05, shadowRadius: 3
```
- Positive icon color: `C.teal`
- Neutral icon color: `C.amber`
- Text: `DM Sans` 400, size 12, color `C.textMuted`, lineHeight 1.5

---

## 8. Trades List Screen

### Filter Chips
```
borderRadius: 100 (pill)
border: 1.5px C.border
paddingHorizontal: 16, paddingVertical: 6
font: DM Sans 600, size 12
```
- Default: background transparent, color `C.textMuted`
- Active: background `C.teal`, border `C.teal`, color `white`

### Trade Cards
```
background: C.elevated
border: 1px C.border
borderRadius: 16
padding: 14 16
shadowColor: C.teal, shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: {0,1}
```
- Hover / press state: `borderColor: C.teal`, shadow increases to `shadowOpacity: 0.10, shadowRadius: 12`
- Active trade variant: `borderColor: rgba(243,149,48,0.4)`, background `#fffdf9`

**Pair name:** `DM Mono` 500, size 15, color `C.text`, letterSpacing 0.6  
**Date:** `DM Sans` 400, size 11, color `C.textDim`  
**Timeframe badge:**
```
color: C.teal
background: C.tealLight
border: 1px C.tealDim
paddingHorizontal: 7, paddingVertical: 2
borderRadius: 4
font: DM Mono 500, size 10
```

**P&L value:** `DM Mono` 500, size 16, letterSpacing -0.3
- Gain: `C.gain`
- Loss: `C.loss`
- Neutral (active): `C.textMuted`

**Status badge:**
- Closed: color `C.textDim`, background `C.border`, `DM Sans` 700, size 9, uppercase, letterSpacing 1.0, borderRadius 5
- Active: color `C.amber`, background `C.amberDim`, same font

---

## 9. Create / Edit Trade Modal

Presented as a **bottom sheet** sliding up from the bottom edge.

```
background: C.elevated
borderRadius: 28 28 0 0
border: 1px C.border (top + sides only)
shadowColor: C.teal, shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: {0,-8}
maxHeight: 88% of screen
```

**Drag handle:** width 36, height 4, background `C.border`, borderRadius 2, centered, marginTop 12

**Modal header:**
- Title: `Fraunces` 300, size 20, color `C.teal`
- Close button: 28×28 circle, background `C.bg`, border `C.border`, color `C.textMuted`, `✕` at size 13

**Section titles inside modal** (Bias, Narrative, Entry, Risk, Market):
```
DM Sans 700, size 10, uppercase, letterSpacing 1.2
color: C.teal
paddingBottom: 6
borderBottom: 1.5px C.border
```

**Select buttons:**
```
background: C.bg
border: 1px C.border
borderRadius: 12
padding: 11 14
```
- Text: `DM Sans` 400, size 13, color `C.textMuted`
- Arrow: size 10, color `C.textDim`

**Direction buttons (Long / Short / Neutral):**
```
flex: 1, padding: 9 10
borderRadius: 10
border: 1.5px C.border
background: C.bg
font: DM Sans 600, size 12, color C.textMuted
```
Selected states:
- Long → background `C.gainDim`, border `rgba(26,138,106,0.35)`, color `C.gain`
- Short → background `C.lossDim`, border `rgba(192,66,74,0.35)`, color `C.loss`

**Played out buttons (✓ / ✕):** 32×28, borderRadius 8
- Default: border `C.border`, background `C.bg`, color `C.textDim`
- Yes active: background `C.gainDim`, border `rgba(26,138,106,0.3)`, color `C.gain`
- No active: background `C.lossDim`, border `rgba(192,66,74,0.3)`, color `C.loss`

**Risk inputs (Stop / Target / R:R):** 3-column grid, gap 8
```
background: C.bg
border: 1px C.border → focused: C.teal
borderRadius: 10, padding: 9 10
font: DM Mono, size 13, color C.text
textAlign: center
```

**Notes textarea:**
```
background: C.bg, border: 1px C.border
borderRadius: 12, padding: 11 14
font: DM Sans, size 13, color C.text
height: 72, resize: none
```

**Footer buttons:**
- Save Trade: background `C.amber`, color white, `DM Sans` 700, size 14, borderRadius 14, flex 1, `shadowColor: C.amber, shadowOpacity: 0.32, shadowRadius: 8, shadowOffset: {0,4}`
- Cancel: background `C.bg`, border `1.5px C.border`, color `C.textMuted`, `DM Sans` 500, size 14, borderRadius 14, padding `14 20`

---

## 10. Trade Detail Screen

**Back button:** 34×34, background `C.elevated`, border `C.border`, borderRadius 10, color `C.textMuted`, chevron `‹` at size 18

**Hero card:**
```
background: C.teal
borderRadius: 20
margin: 16 24
padding: 20
shadowColor: C.teal, shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: {0,6}
elevation: 8
```
- Pair: `DM Mono` 500, size 22, color `#fff`, letterSpacing 1.0
- Meta (date / tf / status): `DM Sans` 400, size 12, color `rgba(255,255,255,0.6)`, lineHeight 1.8
- Active status in meta: color `C.amber`
- P&L: `DM Mono` 400, size 28, letterSpacing -0.8
  - Gain: `#a8f0d8`
  - Loss: `#ffbfc2`
  - Neutral: `rgba(255,255,255,0.55)`

**Screenshot placeholder:**
```
margin: 0 24 16
background: C.elevated
border: 1.5px dashed C.border
borderRadius: 16, height: 130
```
- Icon: size 24, color `C.textDim`
- Text: `DM Sans` 400, size 12, color `C.textDim`

**Summary cards (Bias / Entry / Risk):**
```
background: C.elevated
border: 1px C.border
borderRadius: 14, padding: 14 16
shadowColor: C.teal, shadowOpacity: 0.05, shadowRadius: 4
```
- Card title: `DM Sans` 700, size 10, uppercase, letterSpacing 1.0, color `C.teal`
- Row key: `DM Sans` 400, size 12, color `C.textMuted`, lineHeight 1.9
- Row value: `DM Sans` 600, size 12, color `C.text`

**Footer:**
- Edit Trade: same style as Save Trade (amber, full flex)
- Delete: background `C.lossDim`, color `C.loss`, border `1.5px rgba(192,66,74,0.22)`, `DM Sans` 700, size 13, borderRadius 14, padding `14 18`

---

## 11. Animations & Motion

- Screen entry: `opacity 0→1` + `translateY 6→0`, duration 200ms, easing `ease`
- Building block bars: width `0→{pct}%`, duration 900ms, `cubic-bezier(0.4,0,0.2,1)`, stagger 80ms per row, trigger on screen mount
- Modal sheet: slide up from bottom, duration 280ms, spring physics if using `react-native-reanimated`
- `+` button press: `scale(1.06)`, shadow intensity increases

---

## 12. Do Not Change

- All navigation logic, routing, and screen flow
- Data models, state management, and store structure  
- Form field names, validation, and save/delete handlers
- The app's file and folder structure
- Safe area handling (`SafeAreaProvider` at root, `SafeAreaView` on screens)
- `GestureHandlerRootView` wrapping the root layout
- Any existing TypeScript interfaces or types