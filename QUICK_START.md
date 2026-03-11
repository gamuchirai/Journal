# ⚡ QUICK START CARD - EXPO GO CONNECTION

## Your Connection Info

```
Machine IP:      192.168.1.118
Native Port:     8081
Web Port:        8082
Native URL:      exp://192.168.1.118:8081
Web URL:         http://192.168.1.118:8082
```

---

## 3-Step Connection

### Step 1: WiFi Check ✓
```
Computer WiFi: [Your Network Name]
Phone WiFi:    [Must be SAME]
```

### Step 2: Terminal Commands
```powershell
npm run start:check    # Check network setup
npm start              # Start dev server
```

### Step 3: Connect Phone
**Expo Go App:**
- Tap "Enter URL Manually"
- Enter: `exp://192.168.1.118:8081`
- Wait...

**OR try web first:**
- Phone browser: `http://192.168.1.118:8082`

---

## What You Should See

**Terminal:**
```
[INDEX] APPLICATION ENTRY POINT STARTING
[INDEX] Platform: android
```

**Phone:**
- Loading screen: "🚀 Initializing TradeFlow..."
- Dashboard with stats
- Tab navigation

---

## If It Doesn't Work

### "This site can't be reached" in browser
```powershell
# Command 1: Kill all node processes
Get-Process node | Stop-Process -Force

# Command 2: Restart dev server
npm start

# Check if both WiFi networks match
```

### Expo scans QR but closes
1. Use **Manual URL** instead: `exp://192.168.1.118:8081`
2. Check both devices on **SAME WiFi**
3. Verify web works first: `http://192.168.1.118:8082`

### App shows error message
- 📖 Read the error text on phone
- 🖥️ Check terminal for `[ERROR]` or `[APP]` logs
- 📄 Read `NATIVE_DEBUG_GUIDE.md` for that error

---

## Terminal Log Prefixes

Look for these in terminal:
```
[INDEX]   → App starting up
[APP]     → App component loading
[DB]      → Database operations  
[ERROR]   → Something failed ⚠️
```

---

## Emergency Fix

```powershell
# If everything is stuck:
Get-Process node | Stop-Process -Force
npm start

# If still stuck:
# Restart computer (nuclear option)
```

---

## Detailed Guides

- 📖 `NATIVE_SETUP_COMPLETE.md` - Full setup & troubleshooting
- 📖 `NATIVE_DEBUG_GUIDE.md` - Common issues & fixes
- 📖 `DEBUG_CHANGES_SUMMARY.md` - What was added & why

---

**Your IP: `192.168.1.118`**
**Connection: `exp://192.168.1.118:8081`**
