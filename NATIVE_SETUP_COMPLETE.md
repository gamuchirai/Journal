# 🎯 NATIVE EXPO GO - COMPLETE SETUP & DEBUG GUIDE

## Quick Start (After Issues Fixed)

```bash
# Check network configuration
npm run start:check

# Start dev server with network info
npm run start:network

# Or manual start
npm start
```

---

## Your Setup Information

- **Machine IP:** `192.168.1.118`
- **Native Port:** `8081`
- **Web Port:** `8082`
- **Platform:** Windows

---

## 4-Step Connection Fix

### Step 1: Verify Network Connection

**On your computer:**
```powershell
# Check your IP
ipconfig | Select-String "IPv4 Address"
# Should show: 192.168.1.118
```

**On your phone:**
- WiFi Settings
- Look for network name (SSID) 
- **MUST BE THE SAME as your computer's WiFi**

![Check Match]
- Computer WiFi network: `YourWiFiName`
- Phone WiFi network: `YourWiFiName` ✓

### Step 2: Kill Any Existing Dev Servers

```powershell
# Find and stop any node processes
Get-Process node | Stop-Process -Force
```

### Step 3: Start Fresh Dev Server

```bash
npm start
```

**Wait for output:**
```
[INDEX] APPLICATION ENTRY POINT STARTING
[INDEX] Platform: android (or ios)
[INDEX] Process env NODE_ENV: development

LS Metro waiting on exp://192.168.1.118:8081
```

### Step 4: Connect Phone

**Option A: Manual URL (Most Reliable)**
1. Open Expo Go app on phone
2. Tap "Enter URL Manually"  
3. Type: `exp://192.168.1.118:8081`
4. Wait for app to load

**Option B: Scan QR Code** 
1. Open Expo Go app on phone
2. Tap "Scan QR Code"
3. Scan the code shown in terminal
4. **QR code MUST show** `exp://192.168.1.118:8081` (not localhost!)

**Option C: Test Web First**
1. In phone browser, go to: `http://192.168.1.118:8082`
2. Should see TradeFlow app load
3. If web works, Expo should too

---

## What You Should See

### When App Connects Successfully

**On your phone:**
1. Expo splash screen
2. "🚀 Initializing TradeFlow..." loading screen
3. Dashboard with "0 TOTAL TRADES" card
4. Tab navigation at bottom: Dashboard | + | Trades

**In terminal on computer:**
```
[INDEX] ════════════════════════════════════════════════════════
[INDEX] APPLICATION ENTRY POINT STARTING
[INDEX] Platform: android (or ios)
[INDEX] __DEV__: true

[APP] ════════════════════════════════════════════════════════
[APP] App component mounted/rendering
[APP] useEffect - starting initialization

[DB INIT] Platform is NATIVE, initializing SQLite
[DB INIT] Calling openDatabaseAsync("tradeflow.db")...
[DB INIT] Database connection returned: object
[DB INIT] ✅ Database initialized successfully
[APP] ✅ render - app is ready, rendering SafeAreaProvider + RootNavigator

[NAV] Platform.OS: android (or ios)
[WebTabNavigator] (or [NativeTabNavigator])
[DashboardScreen] component mounted
```

---

## Console Logs Explained

### Entry Point Logs (`[INDEX]`)
```
[INDEX] APPLICATION ENTRY POINT STARTING
```
- ✅ App is starting on the phone
- 🔴 If you don't see this, phone didn't connect to server

### App Component Logs (`[APP]`)
```
[APP] App component mounted/rendering
[APP] useEffect - starting initialization
```
- ✅ App mounted and ready to initialize
- 🔴 If missing, rendering error occurred

### Database Logs (`[DB INIT]`)
```
[DB INIT] Platform is NATIVE, initializing SQLite
[DB INIT] ✅ Database initialized successfully
```
- ✅ SQLite database created and ready
- 🔴 If fails, check app error screen for details

### Navigation Logs (`[NAV]`, `[DashboardScreen]`, etc.)
```
[NAV] Platform.OS: android
[DashboardScreen] component mounted
```
- ✅ App UI is rendering
- 🔴 If missing, Redux/state management issue

---

## Troubleshooting Flowchart

```
Start: npm start
   ↓
[Does terminal show "Metro waiting on exp://192.168.1.118:8081"?]
   ├─ NO  → Problem: Dev server not accessible
   │        Solution: Restart, check IP address, check firewall
   │        
   └─ YES → Continue
      ↓
   [Did you successfully connect to exp URL?]
      ├─ NO  → Problem: Phone can't reach computer
      │        Solution: 
      │        1. Check both on same WiFi
      │        2. Try web version: http://192.168.1.118:8082
      │        3. Check Windows Firewall allows port 8081
      │        4. Restart Expo Go app
      │        
      └─ YES → Continue
         ↓
      [Did you see "[INDEX] APPLICATION ENTRY POINT STARTING"?]
         ├─ NO  → Problem: App bundle not loaded
         │        Solution: Wait longer, check terminal for errors
         │        
         └─ YES → Continue
            ↓
         [Did you see error message on phone screen?]
            ├─ YES → Problem: App initialization failed
            │        Solution: See error details below
            │        
            └─ NO  → ✅ APP IS WORKING!
```

---

## If You See Error Messages

### Error: "This site can't be reached" (Web Browser)

**On phone browser trying:** `http://192.168.1.118:8082`

**Causes:**
1. Dev server not running
2. Phone not on same WiFi
3. Wrong IP address
4. Firewall blocking

**Fix:**
```powershell
# 1. Check dev server is running
netstat -ano | Select-String ":8082"
# Should show: TCP 0.0.0.0:8082 LISTENING

# 2. Verify IP is correct
ipconfig | Select-String "IPv4 Address"
# Should show: 192.168.1.118

# 3. Check firewall
New-NetFirewallRule -DisplayName "Expo Ports" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081,8082
```

### Error: Expo Scans QR but Returns to Home

**Causes:**
1. QR code pointing to localhost (not IP)
2. Phone can't reach the URL
3. Network isolated or firewalled

**Fix:**
1. **Don't use QR code**, use Manual URL instead
2. Go to Expo Go app → "Enter URL Manually"
3. Type: `exp://192.168.1.118:8081`

### Error: "Initialization Failed" on App

**On phone screen shows:**
```
❌ Initialization Failed
[Some error message]

Device Diagnostics:
Platform: android (or ios)
...
```

**What to do:**
1. Read the error message
2. Look in terminal for logs starting with `[FAILED]` or `❌`
3. Note the specific error
4. Check NATIVE_DEBUG_GUIDE.md for that error type

---

## Advanced Diagnostics

### Check Network Connectivity from App

**Try this flow:**
1. App tries to connect → [INDEX] logs should appear
2. If no [INDEX] logs → Phone couldn't reach dev server
3. Try web first: `http://192.168.1.118:8082`
4. If web works → Network is OK, native issue
5. If web doesn't work → Network/firewall issue

### Enable Verbose Logging

Add to App.tsx near top:
```javascript
// Already added: [APP], [INDEX], [DB INIT] logs
// Look for these prefixes in terminal output
```

### Check Ports in Use

```powershell
# Check specific ports
netstat -ano | Select-String ":8081|:8082"

# Kill processes on these ports if needed
$proc = Get-NetTCPConnection -LocalPort 8081 | Select-Object -First 1
Stop-Process -Id $proc.OwningProcess -Force
```

---

## File Guide

| File | Purpose |
|------|---------|
| `App.tsx` | Main app component, initialization, error handling |
| `index.ts` | Entry point, startup diagnostics, error handlers |
| `src/navigation/RootNavigator.tsx` | Navigation setup (web vs native) |
| `src/database/index.ts` | Database initialization, SQLite setup |
| `EXPO_CONNECTION_URL.md` | Your IP address and connection URLs |
| `NATIVE_DEBUG_GUIDE.md` | Comprehensive debugging guide |
| `start-dev-server.js` | Network helper script |
| `package.json` | Scripts including `npm run start:check` |

---

## Common Commands

```bash
# Check network configuration
npm run start:check

# Start dev server (auto restarts on file change)
npm start

# Start dev server with networks info
npm run start:network

# Kill all Node processes (if stuck)
Get-Process node | Stop-Process -Force

# Check if ports are listening
netstat -ano | Select-String ":8081|:8082"

# Run web version
npm run web

# Run Android version
npm run android
```

---

## Checklist Before Connecting

- [ ] WiFi on computer: Check `ipconfig` shows `192.168.1.118`
- [ ] WiFi on phone: Same network as computer
- [ ] Dev server running: See "Metro waiting on..." in terminal
- [ ] Terminal shows platform: `[INDEX] Platform: android` (or ios)
- [ ] Port 8081 accessible: Can browse `http://192.168.1.118:8082` from phone
- [ ] Firewall not blocking: Can access port 8082 from phone browser

---

## Next Steps After Connection Works

1. **Test UI Navigation** - Switch between Dashboard and Trades tabs
2. **Test Add Trade** - Click FAB button to create a trade
3. **Test Persistence** - Reload app and verify data persists
4. **Test Full Feature** - Complete trade entry with all fields
5. **View Console Logs** - Shake device in Expo Go, tap "View logs"

---

## Questions?

1. **Check terminal output** - All errors are logged with `[TAG]` prefixes
2. **Check app error screen** - Shows device diagnostics
3. **Read NATIVE_DEBUG_GUIDE.md** - Comprehensive reference
4. **Try web version first** - Helps isolate network vs app issues

---

**Last Updated:** 2026-03-11
**Your IP:** 192.168.1.118
**Connection URL:** exp://192.168.1.118:8081 (native) or http://192.168.1.118:8082 (web)
