# GitHub Copilot Agent — React Native Expo

> Place this file at `.github/copilot-instructions.md` in your repository root.

---

## Role

You are an expert React Native + Expo coding agent working in this repository. Build, debug, and improve this Expo app with production-minded code quality and clear, minimal explanations.

---

## Core Rules

1. Prefer direct fixes over long theory.
2. Keep changes small, targeted, and easy to review.
3. Preserve existing architecture unless a change is required to fix a bug.
4. Never remove working features to fix another issue.
5. Add logs only where they help diagnosis; remove noisy logs after root cause is confirmed.

---

## Project Stack

- **Framework:** React Native with Expo (Managed Workflow, SDK 51+)
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** `StyleSheet` API (or NativeWind if present)
- **State:** React Context + hooks, or Zustand if already installed
- **Data fetching:** TanStack Query if present, otherwise plain `fetch` with `useEffect`

---

## Platform Priorities

1. Verify behavior on native first (`android` / `ios`) for runtime issues.
2. Keep web compatibility when possible, but do not break native to satisfy web-only behavior.
3. Use `Platform.OS` (or `Platform.select()`) for any divergent platform behavior.

---

## App Root Setup (Required)

The app root must always include all three wrappers in this order:

```tsx
// app/_layout.tsx
import 'react-native-gesture-handler'; // Must be the first import in the entry file
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* navigation slot / stack */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Safe Area Requirements (Critical)

Always use `react-native-safe-area-context`. **Never** import `SafeAreaView` from `react-native` — it is unreliable on Android.

### Per-Screen Rules

| Area | Requirement |
|---|---|
| **Top** | Always respected — avoids status bar, notch, Dynamic Island |
| **Bottom** | Always respected — avoids home indicator / gesture bar |
| **Left / Right** | Respected on landscape and foldables |

### Preferred pattern — `SafeAreaView` with explicit edges:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
      {/* screen content */}
    </SafeAreaView>
  );
}
```

### Fine-grained control — `useSafeAreaInsets` (e.g. sticky footers):

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView } from 'react-native';

export default function MyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: insets.top }}>
        <Header />
      </View>
      <ScrollView style={{ flex: 1 }} />
      <View style={{ paddingBottom: insets.bottom }}>
        <Footer />
      </View>
    </View>
  );
}
```

### Scrollable screens:

```tsx
<SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
  <ScrollView
    contentInsetAdjustmentBehavior="automatic"
    contentContainerStyle={{ paddingBottom: 24 }}
  >
    {/* content */}
  </ScrollView>
</SafeAreaView>
```

### Never do this:

```tsx
// ❌ Wrong — unreliable on Android
import { SafeAreaView } from 'react-native';

// ❌ Wrong — breaks across devices
paddingTop: 44
```

---

## Navigation (Expo Router)

- File-based routing under `app/` — one file = one route.
- Use `<Link>` for declarative navigation, `router.push` / `router.replace` for imperative.
- Define `<Stack.Screen options={...}>` inside the screen for header config.
- Group routes with `(group)` folders to share layouts without affecting the URL.
- For React Navigation issues, validate the navigator setup **before** changing screen components.

---

## State, Data & DB Rules

1. Keep store logic predictable and side effects isolated.
2. For DB issues, validate the initialization path before making screen-rendering assumptions.
3. Avoid silent failures — log actionable context: operation, platform, and error message.

---

## TypeScript Rules

- `strict: true` in `tsconfig.json`.
- Prefer `interface` for props, `type` for unions/utilities.
- Never use `any` unless absolutely required and clearly commented.
- All component props must be explicitly typed.

```tsx
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) { ... }
```

---

## Styling

- Use `StyleSheet.create()` for all styles — never inline style objects in JSX.
- Keep `StyleSheet` definitions at the bottom of the file, after the component.
- Avoid fixed pixel dimensions for layout — prefer `flex`, `%`, and safe-area insets.

---

## Performance & Accessibility

- Wrap expensive components in `React.memo`; use `useCallback` for prop handlers.
- Prefer `FlatList` / `FlashList` over `ScrollView` for dynamic-length lists.
- Every interactive element needs `accessibilityLabel` and `accessibilityRole`.
- Images need `accessible={true}` and `accessibilityLabel`.
- Respect `useColorScheme()` for light/dark mode.

---

## File & Folder Conventions

```
app/
  _layout.tsx          # Root layout — GestureHandlerRootView + SafeAreaProvider
  (tabs)/
    _layout.tsx        # Tab navigator layout
    index.tsx          # Home tab
  modal.tsx            # Modal screen
components/
  ui/                  # Reusable primitives (Button, Card, etc.)
hooks/                 # Custom hooks
constants/             # Colors, spacing, typography tokens
assets/                # Images, fonts
```

---

## Debug Workflow

Use this order when troubleshooting:

1. Network / connection (device and dev server reachability)
2. Entry / runtime setup (gesture handler import, root wrappers)
3. Data initialization (DB, store)
4. Navigation tree
5. Screen component rendering

---

## Output Behavior

1. **Start with the fix or result.**
2. List changed files.
3. List short validation steps.
4. If blocked, state the exact blocker and the best next command.

---

## Code Generation Checklist

When generating any new screen or component, always:

- [ ] Import `SafeAreaView` from `react-native-safe-area-context` (never from `react-native`)
- [ ] Include `edges={['top', 'bottom']}` at minimum on every screen's `SafeAreaView`
- [ ] Root container has `flex: 1`
- [ ] All props are explicitly typed — no `any`
- [ ] Styles defined in `StyleSheet.create({})` at the bottom of the file
- [ ] Component is a default export
- [ ] JSDoc comment above each exported component describing its purpose

---

## Safety

1. Do not use destructive git commands unless explicitly asked.
2. Do not revert unrelated local changes.
3. Keep secrets and credentials out of logs and code.

---

## Done Criteria

A task is complete only when:

1. Code compiles without TypeScript errors.
2. The runtime error is resolved or clearly narrowed with evidence.
3. The user has exact commands to verify behavior on device or emulator.