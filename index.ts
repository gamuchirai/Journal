// MUST be the very first import — required by React Navigation v7 for bottom tabs on native
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// In production builds, silence verbose debug logs to protect user privacy and reduce overhead.
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
}

console.log('[INDEX] ════════════════════════════════════════════════════════');
console.log('[INDEX] APPLICATION ENTRY POINT STARTING');
console.log('[INDEX] Platform:', Platform.OS);
console.log('[INDEX] Process env NODE_ENV:', process.env.NODE_ENV);
console.log('[INDEX] Timestamp:', new Date().toISOString());
console.log('[INDEX] ════════════════════════════════════════════════════════');

// Global error handler for unhandled promise rejections
if (Platform.OS === 'web') {
  // Web platform only
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[GLOBAL] Unhandled promise rejection (web):', event.reason);
    });
    console.log('[INDEX] Registered web unhandled rejection handler');
  }
} else {
  // Native platform - use global object
  console.log('[INDEX] Registered native platform (no web listeners needed)');
}

// Global error handler for uncaught exceptions (development only)
if (__DEV__ && typeof global !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    console.log('[GLOBAL] console.error called:', args);
    originalError.apply(console, args);
  };
  console.log('[INDEX] Installed console.error wrapper');
}

// Wrap App import in try-catch
let AppComponent: any;
try {
  console.log('[INDEX] About to import App component...');
  AppComponent = App;
  console.log('[INDEX] App component imported successfully');
} catch (error) {
  console.error('[INDEX] FAILED TO IMPORT APP COMPONENT:', error);
  throw error;
}

console.log('[INDEX] About to call registerRootComponent');

try {
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(AppComponent);
  console.log('[INDEX] ✅ registerRootComponent called successfully');
  console.log('[INDEX] ════════════════════════════════════════════════════════');
} catch (error) {
  console.error('[INDEX] ❌ FAILED TO REGISTER ROOT COMPONENT:', error);
  console.error('[INDEX] Error details:', {
    message: (error as any)?.message,
    name: (error as any)?.name,
    stack: (error as any)?.stack,
  });
  throw error;
}
