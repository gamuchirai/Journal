# Native Expo Go Debugging Guide

## Issue: App doesn't load when scanning QR code or entering URL manually

### Common Causes

1. **Phone not on same network as dev machine**
   - Solution: Connect both devices to the same WiFi network
   - Check: Look at your WiFi SSID on both devices

2. **WiFi has client isolation enabled**
   - Solution: Disable client isolation in router settings, OR use a different network
   - Check: If other devices on the network also can't communicate with each other

3. **Firewall blocking port 8081**
   - Solution: Allow port 8081 in Windows Firewall
   - Check: Run `netstat -ano | Select-String ":8081"` to verify port is listening

4. **QR code using localhost instead of Machine IP**
   - Solution: See "Getting the Correct URL" section below
   - Check: The URL shown in Expo should show your machine's IP, not localhost

5. **Wrong IP address or port**
   - Solution: See "Getting the Correct URL" section below
   - Check: Verify the URL is showing your actual machine IP

### Getting the Correct URL

#### Find Your Machine's IP Address:
```powershell
# Windows PowerShell
ipconfig | Select-String "IPv4 Address"
# Look for your WiFi adapter's IPv4 address (usually starts with 192.168 or 10.x)
```

#### Find the Dev Server Port:
```powershell
# Windows PowerShell
netstat -ano | Select-String ":8081"
# Should show LISTENING on 0.0.0.0:8081
```

#### Correct URL Format:
- Web: `http://<YOUR_IP>:8082` or `http://localhost:8082`
- Native: `exp://192.168.x.x:8081` (for QR code)

### Testing Network Connectivity

1. **From your phone, can you ping the dev machine?**
   ```
   On same WiFi network, try:
   - Open a web browser on your phone
   - Try accessing: http://<YOUR_IP>:8082
   - You should see the web app load
   ```

2. **Check if Expo is actually running:**
   ```powershell
   # Windows
   netstat -ano | Select-String ":8081|:8082"
   # Should show both ports in LISTENING state
   ```

3. **Restart Expo dev server:**
   ```bash
   # Kill any running dev servers
   # Then run:
   npm start
   # Or for specific platform:
   npm run android
   ```

### Console Logs Added for Debugging

The app now includes enhanced console logging at multiple levels:

#### `index.ts` - Entry Point Logs
- Platform detection
- Application startup
- Error handlers initialization
- Component registration

#### `App.tsx` - Initialization Logs
- App mounting
- Database initialization with timing
- Error boundary catching render errors
- Diagnostics info (platform, __DEV__, timestamp)

#### Database Logs
- SQLite initialization for native
- localStorage initialization for web
- Table creation
- Data seeding

### Reading Console Logs

#### On Physical Device (Expo Go):
1. Open Expo Go app
2. Scan QR code or enter development URL
3. Once app is running (if it loads), shake device to open dev menu
4. Look for "View logs" or check terminal output

#### On Development Machine:
1. Terminal where `npm start` is running shows all console.log output
2. Look for logs prefixed with `[INDEX]`, `[APP]`, `[DB INIT]`, etc.

### Step-by-Step Debugging

1. **Verify dev server is running:**
   ```powershell
   Get-Process | Where-Object { $_.ProcessName -like "*node*" }
   ```

2. **Check both ports are listening:**
   ```powershell
   netstat -ano | Select-String ":8081|:8082"
   ```

3. **Take note of your machine IP:**
   ```powershell
   ipconfig | Select-String "IPv4 Address"
   ```

4. **On your phone, ensure you're on the same WiFi**

5. **Try manual URL entry first (easier to debug than QR code):**
   - Expo Go app → "Enter URL manually"
   - Format: `exp://192.168.x.x:8081`
   - (Replace 192.168.x.x with your actual IP from step 3)

6. **Watch the console output on your machine for logs**

7. **If you see initial errors, the console logs will help identify:**
   - Platform detection issues
   - Database initialization errors
   - Runtime errors in components

### Expected Console Output (Native App)

If everythingworks, you should see:
```
[INDEX] ════════════════════════════════════════════════════════
[INDEX] APPLICATION ENTRY POINT STARTING
[INDEX] Platform: android (or ios)
[INDEX] Process env NODE_ENV: development
[INDEX] Timestamp: 2026-03-11T...
[INDEX] ════════════════════════════════════════════════════════
[INDEX] About to import App component...
[INDEX] App component imported successfully
[INDEX] About to call registerRootComponent
[INDEX] ✅ registerRootComponent called successfully
[INDEX] ════════════════════════════════════════════════════════

[APP] ════════════════════════════════════════════════════════
[APP] App component mounted/rendering
[APP] Platform.OS: android (or ios)
[APP] __DEV__: true
[DB INIT] initializeDatabase called
[DB INIT] Platform is NATIVE, initializing SQLite
[DB INIT] Starting SQLite initialization...
[DB INIT] About to import expo-sqlite...
[DB INIT] expo-sqlite imported successfully
[DB INIT] Calling openDatabaseAsync("tradeflow.db")...
[DB INIT] Database connection returned: object
[DB INIT] ✅ Database initialized successfully
[APP] ✅ initializeDatabase completed successfully
[APP] ✅ render - app is ready, rendering SafeAreaProvider + RootNavigator
```

### Advanced Network Diagnostics

If the basic checks don't work, try:

```powershell
# Check if firewall is blocking
Get-NetFirewallRule -DisplayGroup "Windows Defender Firewall" | Where-Object { $_.Action -eq "Block" }

# Allow port 8081 through firewall
New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081

# Disable Windows Firewall temporarily (not recommended for production)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled $false
```

### If All Else Fails

1. **Try EAS Update/Tunnel:**
   ```bash
   npm start -- --tunnel
   # This uses Expo's tunnel service instead of local network
   ```

2. **Use Physical Cable/USB:**
   ```bash
   # For Android with ADB
   adb reverse tcp:8081 tcp:8081
   # Then use: exp://localhost:8081
   ```

3. **Create an APK/IPA build:**
   ```bash
   # Build native app
   eas build --platform android
   # This creates a standalone app without dev server dependency
   ```

### Reporting Issues

When reporting connection issues, include:
1. Your machine's IP address
2. Phone's model and OS version
3. WiFi network type (2.4GHz vs 5GHz)
4. Console logs from both machine and phone
5. Firewall/antivirus software you have running
