# 🚀 EXPO GO CONNECTION - EXACT SETUP INSTRUCTIONS

## Your Machine Information

**Machine IP Address:** `192.168.1.118`
**Generated at:** 2026-03-11T**:****.***Z

---

## How to Connect Expo Go App

### Option 1: Scan QR Code (Recommended)
1. Start dev server: `npm start`
2. Expo will display a QR code in the terminal
3. **IMPORTANT:** QR code must show `exp://192.168.1.118:8081` (NOT localhost)
4. Open Expo Go app on your phone
5. Tap "Scan QR Code" and scan the code shown in terminal

### Option 2: Manual URL Entry
1. Start dev server: `npm start`
2. Open Expo Go app on your phone
3. Tap "Enter URL Manually"
4. Enter: `exp://192.168.1.118:8081`
5. Press Connect

### Option 3: Test Web Version First
1. Start dev server: `npm start`
2. In a browser on your phone: `http://192.168.1.118:8082`
3. You should see TradeFlow app load
4. If this works, native should work too

---

## ⚠️ NETWORK REQUIREMENTS

✅ **Both phone and computer must be on the SAME WiFi network**

**Check on your phone:**
- WiFi Settings → Look for network name (SSID)
- Make sure it matches your computer's WiFi network

---

## 🔧 TROUBLESHOOTING

### "This site can't be reached" in Chrome
- ❌ Network connectivity issue
- ✅ Try: `http://192.168.1.118:8082` in browser first
- ✅ If browser works, Expo should too

### QR Code Scanner Doesn't Work
- ❌ URL in QR code might be using localhost
- ✅ Try Manual URL entry instead: `exp://192.168.1.118:8081`

### Expo Go Scans but Returns to Home Screen
- ❌ Phone can't reach dev server on port 8081
- ✅ Check: Try web version first (`http://192.168.1.118:8082`)
- ✅ Check: Both devices on same WiFi
- ✅ Check: Windows Firewall not blocking port 8081

---

## 📋 STEP-BY-STEP STARTUP

1. **Make sure phone is on WiFi:** `192.168.1.x` (same as computer)

2. **Start dev server:**
   ```bash
   npm start
   ```

3. **Watch terminal for output:**
   ```
   [INDEX] APPLICATION ENTRY POINT STARTING
   [INDEX] Platform: android (or ios)
   
   Expo dev server started on 192.168.1.118:8081
   ```

4. **Try web version first in phone's browser:**
   - Open: `http://192.168.1.118:8082`
   - Should see TradeFlow app

5. **If web works, try native:**
   - Expo Go app → Enter URL Manually
   - Enter: `exp://192.168.1.118:8081`

---

## 🔍 VERIFICATION CHECKLIST

- [ ] Phone is on WiFi (same network as computer)
- [ ] Computer IP is: `192.168.1.118`
- [ ] Dev server is running (`npm start`)
- [ ] Port 8081 shows in netstat: `netstat -ano | Select-String ":8081"`
- [ ] Web version loads: `http://192.168.1.118:8082` on phone browser
- [ ] Windows Firewall not blocking the connection

---

## 🛠️ ADVANCED OPTIONS

### If manual URL doesn't work:

**Check Firewall:**
```powershell
# Allow port 8081 through Windows Firewall
New-NetFirewallRule -DisplayName "Expo Dev 8081" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081
```

**Restart Dev Server:**
```bash
# Kill existing process
Get-Process node | Stop-Process -Force

# Start fresh
npm start
```

**Use Tunnel Mode (if local network doesn't work):**
```bash
npm start -- --tunnel
# This uses Expo's cloud tunnel, slower but works anywhere
```

---

## 📱 PHONE SETUP

Once connected, you'll see:

1. **Red development banner** (shows connection status)
2. **Loading screen** with "Initializing TradeFlow..."
3. **Detailed error messages** if anything goes wrong
4. **Dashboard screen** showing 0 trades (first time)

---

## 🐛 IF APP SHOWS ERROR

The app now includes detailed error messages. You should see:

```
❌ Initialization Failed
[Error message here]

Device Diagnostics:
Platform: android (or ios)
Dev Mode: Yes
Timestamp: [time shown]

💡 Tip: Check the console for detailed logs to debug this issue.
```

**Check terminal on computer** for logs prefixed with:
- `[INDEX]` - App startup
- `[APP]` - App component
- `[DB INIT]` - Database initialization
- `[TAG]` - Other components

---

## 📞 SUPPORT

When reporting issues, collect:
1. Screenshot of error message on phone
2. Last 50 lines of terminal output from `npm start`
3. Phone model and OS version
4. WiFi network type (2.4GHz vs 5GHz)

**Terminal Output Example (Good):**
```
[INDEX] ════════════════════════════════════════════════════════
[INDEX] APPLICATION ENTRY POINT STARTING
[INDEX] Platform: android
[INDEX] Process env NODE_ENV: development

[APP] ════════════════════════════════════════════════════════
[APP] App component mounted/rendering
[APP] Platform.OS: android
[APP] __DEV__: true

[DB INIT] initializeDatabase called
[DB INIT] Platform is NATIVE, initializing SQLite
[DB INIT] ✅ Database initialized successfully
[APP] ✅ render - app is ready, rendering SafeAreaProvider + RootNavigator
```

---

Generated at: **2026-03-11**
Your IP: **192.168.1.118**
Port: **8081** (native), **8082** (web)
