# Chat Issue Log

Date range: 2026-03-11
Project: TradeFlow Journal

1. Date: 2026-03-11
Issue: Web app opened with a blank screen.
Solution: Added startup logs in `index.ts` and `App.tsx`, then traced the failure to navigation behavior on web.
What we learned: Platform-specific navigation behavior can break rendering even when code compiles.

2. Date: 2026-03-11
Issue: Missing import caused render/runtime problems (`Text` not imported in `App.tsx`).
Solution: Added the missing `Text` import.
What we learned: Small missing imports can look like bigger app-level failures.

3. Date: 2026-03-11
Issue: Bottom tab navigator behavior was incompatible on web path.
Solution: Implemented platform-aware navigation: `WebTabNavigator` for web and `NativeTabNavigator` for native.
What we learned: Keep separate navigation implementations when web and native expectations differ.

4. Date: 2026-03-11
Issue: Add-trade flow failed on web because `handleAddTrade` logic was missing in the trade list flow.
Solution: Added/connected `handleAddTrade` and modal open-close wiring.
What we learned: UI actions must be fully wired end-to-end (button, handler, and modal state).

5. Date: 2026-03-11
Issue: Expo Go QR/manual URL failed to open app reliably on phone.
Solution: Added network and startup diagnostics (`[INDEX]`, `[APP]`, `[DB INIT]` logs), plus helper scripts (`start:check`, `start:network`) and IP verification steps.
What we learned: For native connection issues, first verify network path and server reachability before app logic.

6. Date: 2026-03-11
Issue: Runtime error on phone: `window.addEventListener is not a function`.
Solution: Replaced window-based detection with `Platform.OS` checks and only used `window.addEventListener` on web.
What we learned: React Native may expose partial `window`; do not use browser assumptions for platform detection.

7. Date: 2026-03-11
Issue: Syntax errors in `RootNavigator.tsx` after trying JSX tags like `<(Tab as any).Navigator>`.
Solution: Replaced invalid JSX expression tags with valid component usage and simplified navigator code.
What we learned: JSX tag names cannot be inline expressions.

8. Date: 2026-03-11
Issue: Native runtime error: `Element type is invalid ... Check the render method of Screen`.
Solution: Added `import 'react-native-gesture-handler'` as first import in `index.ts`, wrapped app with `GestureHandlerRootView`, and simplified tab navigator setup.
What we learned: React Navigation native setup order matters; gesture handler initialization must happen first.

9. Date: 2026-03-11
Issue: Debugging became noisy and hard to follow due to many moving parts.
Solution: Standardized log tags and traced startup in strict order: entry -> app init -> DB init -> navigator render.
What we learned: Structured logging shortens time-to-root-cause in cross-platform apps.

## Final takeaway
Always debug in this order:
1) Connection/network
2) Entry-point/runtime setup
3) Data initialization
4) Navigation/render tree
