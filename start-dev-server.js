#!/usr/bin/env node

/**
 * Expo Dev Server Network Configuration Helper
 * 
 * This script helps ensure the Expo dev server is accessible from your phone
 * by providing the correct IP address and port configuration.
 * 
 * Usage: node start-dev-server.js
 */

const { execSync } = require('child_process');
const os = require('os');
const dns = require('dns');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  EXPO DEV SERVER - NETWORK CONFIGURATION HELPER           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Get machine IP address
function getMachineIP() {
  const interfaces = os.networkInterfaces();
  
  // Try to find WiFi adapter first (usually eth0, wlan0, Wi-Fi on Windows)
  const wifiPatterns = ['WiFi', 'eth', 'wlan', 'en0', 'en1'];
  
  for (const name of Object.keys(interfaces)) {
    const adapter = interfaces[name];
    
    for (const addr of adapter) {
      // Skip internal and non-IPv4 addresses
      if (addr.family === 'IPv4' && !addr.address.startsWith('127')) {
        return { address: addr.address, adapter: name };
      }
    }
  }
  
  return null;
}

// Display network info
const ipInfo = getMachineIP();

if (!ipInfo) {
  console.error('❌ ERROR: Could not find active network interface');
  console.error('   Make sure you have a network connection (WiFi or Ethernet)');
  process.exit(1);
}

console.log('📱 NETWORK CONFIGURATION');
console.log(`   Machine IP:    ${ipInfo.address}`);
console.log(`   Adapter:       ${ipInfo.adapter}`);

// Check ports
console.log('\n🔌 PORT AVAILABILITY');
try {
  const netstatOutput = execSync('netstat -ano 2>/dev/null || netstat -tln 2>/dev/null', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  const port8081 = netstatOutput.includes(':8081') || netstatOutput.includes('8081');
  const port8082 = netstatOutput.includes(':8082') || netstatOutput.includes('8082');
  
  console.log(`   Port 8081:     ${port8081 ? '█ In use' : '✓ Available'}`);
  console.log(`   Port 8082:     ${port8082 ? '█ In use' : '✓ Available'}`);
  
  if (port8081) {
    console.log('   ⚠️  Port 8081 is already in use!');
    console.log('      Run: Get-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess | Stop-Process -Force');
  }
} catch (e) {
  console.log('   Port check skipped (netstat not available)');
}

// Display connection URLs
console.log('\n🌐 CONNECTION URLS');
console.log(`   Native (Expo):      exp://${ipInfo.address}:8081`);
console.log(`   Web (Browser):      http://${ipInfo.address}:8082`);

// Display instructions
console.log('\n📋 SETUP INSTRUCTIONS');
console.log('   1. Make sure your PHONE is on the SAME WiFi network');
console.log(`   2. For Expo Go app, use: exp://${ipInfo.address}:8081`);
console.log(`   3. For web browser, try: http://${ipInfo.address}:8082`);
console.log('   4. If using manual URL in Expo Go:');
console.log('      - Tap "Enter URL Manually"');
console.log(`      - Enter: exp://${ipInfo.address}:8081`);

// Create environment variable
const envVars = {
  'EXPO_BUNDLER_IP': ipInfo.address,
  'EXPO_DEV_SERVER_ENDPOINT': `${ipInfo.address}:8081`,
};

console.log('\n⚙️  ENVIRONMENT VARIABLES');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`   ${key}=${value}`);
});

// Start dev server advice
console.log('\n▶️  STARTING DEV SERVER');
console.log('   Run:    npm start');
console.log('   Watch for "[INDEX] APPLICATION ENTRY POINT STARTING" in terminal');
console.log('   Expected platform should show: "android" or "ios"');

console.log('\n🧪 QUICK TEST');
console.log(`   Try in browser: http://${ipInfo.address}:8082/`);
console.log('   If it works, your network is properly configured');

console.log('\n💡 COMMON ISSUES');
console.log('   ❌ "This site cant be reached"  → Check WiFi connection');
console.log('   ❌ "Cannot GET /"                → Dev server not running');
console.log('   ❌ "Connection refused"          → Different network or firewall');
console.log('   ❌ Expo GA scans but closes      → Network connectivity issue');

console.log('\n');

// Optional: Start dev server automatically
const args = process.argv.slice(2);
if (args.includes('--start')) {
  console.log('🚀 Starting Expo dev server...\n');
  
  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  // Run npm start
  try {
    execSync('npm start', { stdio: 'inherit' });
  } catch (e) {
    process.exit(1);
  }
}
