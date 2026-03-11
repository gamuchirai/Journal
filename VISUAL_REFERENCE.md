# 📱 NATIVE EXPO GO - VISUAL QUICK REFERENCE

## Your Connection Details

```
┌──────────────────────────────────────────┐
│ MACHINE IP:        192.168.1.118         │
│ NATIVE PROTOCOL:   exp://                │
│ NATIVE PORT:       8081                  │
│ FULL URL:          exp://192.168.1.118:8081 │
│                                          │
│ WEB TEST URL:      http://192.168.1.118:8082  │
└──────────────────────────────────────────┘
```

---

## Connection Flow

```
START
  │
  ├─→ Both devices on same WiFi ✓
  │    (Computer: 192.168.x.x, Phone: 192.168.x.x)
  │
  ├─→ npm start
  │    (Shows: [INDEX] APPLICATION ENTRY POINT STARTING)
  │
  ├─→ Phone: Expo Go → Enter URL Manually
  │    Type: exp://192.168.1.118:8081
  │
  ├─→ Wait for connection...
  │    Terminal shows: [APP] App component mounted
  │
  ├─→ Phone shows loading screen
  │
  └─→ ✅ Dashboard appears!
```

---

## Terminal Logs You Should See

```
✅ GOOD - App Connecting
┌─────────────────────────────────┐
│ [INDEX] APPLICATION ENTRY POINT │
│ [INDEX] Platform: android       │
│ [APP] App component mounted     │
│ [DB INIT] Database ready ✅     │
└─────────────────────────────────┘

⚠️  WARNING - Connection Issue
┌─────────────────────────────────┐
│ (No [INDEX] logs appearing)     │
│ Check: Manual URL on phone      │
│ Check: Both on same WiFi        │
└─────────────────────────────────┘

❌ ERROR - App Failed
┌─────────────────────────────────┐
│ [ERROR] Something failed        │
│ (Red text with error details)   │
│ Check: Read full error message  │
│ Check: NATIVE_DEBUG_GUIDE.md    │
└─────────────────────────────────┘
```

---

## What You Should See on Phone

```
STEP 1: Loading
┌─────────────────────────────┐
│                             │
│  🚀 Initializing TradeFlow  │
│                             │
│  [Loading spinner]          │
│                             │
│  Platform: android          │
└─────────────────────────────┘

STEP 2: Dashboard (Success!)
┌─────────────────────────────┐
│ ⊞📊☐ Dashboard Analytics   │
├─────────────────────────────┤
│ 0 TOTAL TRADES   0% WIN RATE│
├─────────────────────────────┤
│ No trades yet               │
│                             │
│  ⊞          +          ☰   │
│ Dashboard   FAB       Trades│
└─────────────────────────────┘

STEP 3: Error (If Something Failed)
┌─────────────────────────────┐
│ ❌ Initialization Failed    │
│                             │
│ [Error message here]        │
│                             │
│ Device Diagnostics:         │
│ Platform: android           │
│ Dev Mode: Yes               │
│ Timestamp: [time]           │
└─────────────────────────────┘
```

---

## Troubleshooting Tree

```
App doesn't connect?
  │
  ├─ Check: Is dev server running?
  │  └─ FIX: npm start
  │
  ├─ Check: Phone on same WiFi?
  │  └─ FIX: Settings → WiFi → Join same network
  │
  ├─ Check: Using correct URL?
  │  └─ FIX: exp://192.168.1.118:8081 (NOT localhost)
  │
  ├─ Check: Firewall blocking?
  │  └─ FIX: Allow port 8081 in Windows Firewall
  │
  └─ Check: Can you access web?
     └─ Try: http://192.168.1.118:8082 in phone browser
```

---

## Commands Cheatsheet

```powershell
# Check network setup
npm run start:check

# Start dev server
npm start

# Start with network info
npm run start:network

# Kill all node processes (if stuck)
Get-Process node | Stop-Process -Force

# Check ports in use
netstat -ano | Select-String ":8081|:8082"

# Allow firewall
New-NetFirewallRule -DisplayName "Expo Ports" `
  -Direction Inbound -Action Allow `
  -Protocol TCP -LocalPort 8081,8082

# Restart completely
Get-Process node | Stop-Process -Force
npm start
```

---

## Reading List by Situation

```
⚡ QUICK (5 minutes)
├─ QUICK_START.md .............. 3-step setup
└─ EXPO_CONNECTION_URL.md ....... Your URLs

📚 COMPLETE (15 minutes)
├─ NATIVE_SETUP_COMPLETE.md .... Full guide
├─ NATIVE_DEBUG_GUIDE.md ....... Troubleshooting
└─ DEBUG_CHANGES_SUMMARY.md .... Technical

🔧 TECHNICAL (20 minutes)
├─ DEBUGGING_SETUP_COMPLETE.md . What was done
├─ README.md (new section) ...... Quick links
└─ Modified files:
   ├─ index.ts ................. Entry point
   ├─ App.tsx .................. Main component
   └─ package.json ............. New scripts
```

---

## Decision Tree

```
Have 5 minutes?
├─ YES → Read QUICK_START.md
└─ NO  → Run "npm run start:check" directly

App doesn't connect?
├─ See error on phone → Read error message
├─ Blank screen → Check terminal for logs
└─ "Can't reach" → Check WiFi + firewall

Terminal shows error?
├─ [ERROR] message → Copy error text
└─ Search NATIVE_DEBUG_GUIDE.md for that error

Still stuck?
└─ Read NATIVE_SETUP_COMPLETE.md troubleshooting
```

---

## Red/Yellow/Green Indicators

```
🟢 GREEN (All Good)
├─ Dev server running (npm start)
├─ Phone on same WiFi
├─ Terminal shows [INDEX] logs
└─ Dashboard appears on phone

🟡 YELLOW (Check Required)
├─ Dev server running but no [INDEX] logs
├─ Can access web (8082) but not native (8081)
├─ Phone and computer on different networks
└─ Firewall question marks

🔴 RED (Problem)
├─ Dev server not running
├─ Phone can't reach computer
├─ [ERROR] in terminal logs
└─ Error screen on phone
```

---

## One-Minute Verification

```
✓ Step 1 (10 sec): ipconfig | Select-String "IPv4"
         Shows:    192.168.1.118

✓ Step 2 (10 sec): npm start
         Shows:    [INDEX] APPLICATION ENTRY POINT STARTING

✓ Step 3 (10 sec): Phone settings check
         Shows:    WiFi SSID matches

✓ Step 4 (20 sec): Manual URL on phone
         Type:     exp://192.168.1.118:8081
         Wait:     Connection...

Result:  ✅ Dashboard loads
         OR
         ⚠️  See what error/behavior

Total:   ~1 minute to verify setup
```

---

**Machine IP: `192.168.1.118`**
**Connection: `exp://192.168.1.118:8081`**
**Test Web: `http://192.168.1.118:8082`**

Ready to connect! 🚀
