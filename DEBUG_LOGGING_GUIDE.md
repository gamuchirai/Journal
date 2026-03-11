# Debugging Console Logs Guide

## Overview
Comprehensive console logging has been added throughout the app to help identify where failures occur. This enables systematic elimination testing to find the root cause.

## How to View Logs

### On Web (Chrome)
1. Open DevTools: `F12` or `Ctrl+Shift+I`
2. Go to the **Console** tab
3. Look for logs with `[...]` prefixes

### On Expo Go (Phone)
1. Shake the phone to open Expo Go menu
2. Select "View logs"
3. Look at console output with `[...]` prefixes

### On Native Build
1. Use Xcode (iOS) or Android Studio (Android) console
2. Filter for the app's process logs
3. Look for `[...]` prefixed messages

## Log Categories

### [APP] - Application Lifecycle
```
[APP] App component mounted
[APP] useEffect - starting initialization
[APP] initializeDatabase completed successfully
[APP] render - isReady: true hasError: null
[APP] render - app is ready, rendering SafeAreaProvider + RootNavigator
```
- Tracks App.tsx initialization
- Database initialization flow
- Component state transitions
- Error messages with details

### [DB INIT] - Database Initialization  
```
[DB INIT] initializeDatabase called
[DB INIT] isWeb: true
[DB INIT] Platform is WEB, initializing web store
[DB INIT] Database initialized successfully
```
- Platform detection (web vs native)
- SQLite connection and setup
- Table creation
- Data seeding

### [DB] - Database Operations
```
[DB] getAllTrades called with status: undefined
[DB] getAllTrades using web store
[DB] getAllTrades web found: 0 trades
[DB] getTrade called with id: xxx
[DB] getWinRate called
```
- Query execution
- Row count results
- Data transformations
- Success/failure of DB operations

### [NAV] - Navigation Setup
```
[NAV] createBottomTabNavigator type: function
[NAV] Tab.Navigator type: function
[NAV] Tab.Screen type: function
```
- Navigator instantiation
- Component type verification
- Architecture validation

### [RootNavigator] - Root Navigation
```
[RootNavigator] rendering
[RootNavigator] Stack.Navigator: function
[RootNavigator] Navigation ready!
[RootNavigator] Navigation state changed
```
- Stack navigator rendering
- Navigation ready status
- Route changes

### [TabNavigator]  - Tab Navigation
```
[TabNavigator] rendering
[TabNavigator.tabBar] rendering custom tab bar
```
- Tab navigator initialization
- Custom tab bar rendering

### [STORE] - Zustand Store 
```
[STORE] Initializing useTradeStore
[STORE] loadTrades called with status: undefined
[STORE] Calling db.getAllTrades
[STORE] loadTrades error: [error details]
```
- Store initialization
- Action calls and results
- State updates
- Error handling

### [DashboardScreen] / [TradeListScreen] - Screen Lifecycle
```
[DashboardScreen] component mounted
[DashboardScreen] useEffect 1 - initial load
[DashboardScreen] loadData called
[DashboardScreen] loadTrades completed, trades count: 0
```
- Component mounting
- Hook execution
- Data loading
- Navigation interactions

### [INDEX] - Entry Point
```
[INDEX] Application starting...
[INDEX] About to call registerRootComponent
[INDEX] registerRootComponent called
```
- Module loading start
- Expo registration

### [GLOBAL] - Global Error Handlers
```
[GLOBAL] Uncaught promise rejection: [error]
[GLOBAL] console.error called: [args]
```
- Unhandled promise rejections
- Global uncaught exceptions

## Elimination Testing Strategy

### Step 1: Check Initialization Chain
Follow this order in the console:
1. `[INDEX]` - Does the entry point load?
2. `[APP]` - Does App component mount?
3. `[DB INIT]` - Does database init succeed?
4. `[APP] render - app is ready` - Does initialization complete?

### Step 2: Check Navigation Setup
1. `[NAV]` - Are navigators created?
2. `[RootNavigator]` - Does root navigator render?
3. `[TabNavigator]` - Does tab navigator initialize?

### Step 3: Check Store & Data
1. `[STORE] Initializing useTradeStore` - Store created?
2. `[STORE] loadTrades called` - Are actions being called?
3. `[DB] getAllTrades` - Are DB queries executing?

### Step 4: Check Screen Rendering
1. `[DashboardScreen] component mounted` - Screen mounts?
2. `[DashboardScreen] useEffect 1/2` - Hooks firing?
3. `[DashboardScreen] loadData called` - Data methods callable?

## Common Failure Points & Solutions

### Issue: App shows loading spinner but never progresses
**Check for:**
- `[DB INIT]` not appearing → Database init never completes
- `[DB INIT]` appears but then no `[APP] Setting isReady = true` → Error in database init

**Solution:**
- Check `[DB INIT]` logs for specific error messages
- Verify Platform.OS is correctly detected
- Ensure SQLite module loaded successfully

### Issue: Blank screen after loading
**Check for:**
- `[APP] render - app is ready` appears but no `[RootNavigator]` → Navigation not rendering
- Error logs appear before `[RootNavigator]` → Component render error
- `[TabNavigator]` appears but screen doesn't → Tab navigator issue

**Solution:**
- Check for error messages between ready and RootNavigator
- Look for undefined components or import issues
- Check screen component exports

### Issue: Data not loading
**Check for:**
- `[STORE] loadTrades called` appears but no `[DB] getAllTrades`  → Store action not executing
- `[DB] getAllTrades` appears but returns 0 items → Database query issue  
- `[DashboardScreen] loadData called` but no update → Data binding issue

**Solution:**
- Verify store action is async and awaiting correctly
- Check database platform detection (web vs native)
- Ensure screen useEffect is firing correctly

### Issue: Navigation not working
**Check for:**
- `[TabNavigator.tabBar]` not appearing → Custom tab bar not rendering
- `[RootNavigator] Navigation ready!` but no state changes → Navigation not responsive
- Screen components mounting but UI not reflecting navigation state

**Solution:**
- Check navigation hook usage in screens
- Verify Tab.Navigator is compatible with platform
- Ensure screen listeners/hooks have proper dependencies

## Error Messages to Look For

- `Failed to initialize database:` → Database connection issue
- `Error initializing database: expo-sqlite does not expose openDatabaseAsync` → Module loading issue
- `navigation.addListener is not a function` → Navigation props not passed correctly
- `Element type is invalid: ... undefined` → Component not exported or imported correctly
- `Cannot read property 'getFirstAsync'` → Database not initialized before use
- `Maximum call stack size exceeded` → Infinite loop or circular dependency

## Export this Session

To save the current debug session:
1. Right-click in console
2. Select "Save as..." to export all messages
3. Share with development team

## Next Steps

After reviewing the debug logs:

1. **Identify where the chain breaks** - Look for missing log messages
2. **Find the specific error** - Look for error messages with `[ERROR]` prefix
3. **Check stack trace** - Error messages now include complete trace information  
4. **Correlate with platform** - Logs show `[DB INIT] isWeb: true/false` to verify platform
5. **Test elimination** - Comment out suspicious areas and watch logs to isolate
