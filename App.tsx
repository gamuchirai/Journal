import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Platform, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from './src/database';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants';
import { C } from './src/constants/Colors';
import {
  useFonts,
  Fraunces_300Light,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';

// Error boundary component for better error visualization
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string; errorStack: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '', errorStack: '' };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ErrorBoundary] getDerivedStateFromError:', error);
    return {
      hasError: true,
      errorMessage: error.message,
      errorStack: error.stack || 'No stack trace',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] componentDidCatch:', error);
    console.error('[ErrorBoundary] componentStack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 40, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
            🔴 Render Error Caught
          </Text>
          <Text style={{ fontSize: 14, color: '#333', textAlign: 'left', marginBottom: 10 }}>
            {this.state.errorMessage}
          </Text>
          <Text style={{ fontSize: 9, color: '#999', textAlign: 'left', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: 8 }}>
            {this.state.errorStack.slice(0, 800)}
          </Text>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_300Light,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  console.log('[APP] ════════════════════════════════════════════════════════');
  console.log('[APP] App component mounted/rendering');
  console.log('[APP] Platform.OS:', Platform.OS);
  console.log('[APP] __DEV__:', __DEV__);
  console.log('[APP] State - isReady:', isReady, 'hasError:', !!hasError);

  useEffect(() => {
    console.log('[APP] ════════════════════════════════════════════════════════');
    console.log('[APP] useEffect - starting initialization');
    console.log('[APP] Platform:', Platform.OS);
    
    // Collect diagnostics
    const diagnosticsInfo = {
      platform: Platform.OS,
      isDev: __DEV__,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
    };
    
    console.log('[APP] Environment:', diagnosticsInfo);
    setDiagnostics(diagnosticsInfo);

    const prepare = async () => {
      try {
        console.log('[APP] prepare() - starting');
        console.log('[APP] About to call initializeDatabase...');
        
        const dbStartTime = Date.now();
        await initializeDatabase();
        const dbEndTime = Date.now();
        
        console.log('[APP] ✅ initializeDatabase completed successfully');
        console.log('[APP] Database initialization took:', dbEndTime - dbStartTime, 'ms');
        console.log('[APP] Setting isReady = true');
      } catch (error) {
        console.error('[APP] ❌ Error initializing database:', error);
        
        const errorObj = {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error,
          stringified: JSON.stringify(error, null, 2),
          timestamp: new Date().toISOString(),
        };
        
        console.error('[APP] Error details:', errorObj);
        setErrorDetails(errorObj);
        setHasError(errorObj.message);
      } finally {
        console.log('[APP] finally block - setting isReady to true');
        setIsReady(true);
        console.log('[APP] ════════════════════════════════════════════════════════');
      }
    };

    prepare();
  }, []);

  console.log('[APP] render - isReady:', isReady, 'hasError:', hasError);

  if (hasError) {
    return (
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 40, backgroundColor: '#ffe6e6' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#cc0000', textAlign: 'center', marginBottom: 15 }}>
          ❌ Initialization Failed
        </Text>
        <Text style={{ fontSize: 13, color: '#333', textAlign: 'center', marginBottom: 15, fontWeight: '500' }}>
          {hasError}
        </Text>
        
        {errorDetails && (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
              Error Details:
            </Text>
            <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: 10, marginBottom: 8 }}>
              {errorDetails.name}: {errorDetails.message}
            </Text>
            {errorDetails.stack && (
              <Text style={{ fontSize: 9, color: '#888', fontFamily: 'monospace', backgroundColor: '#f9f9f9', padding: 8 }}>
                {errorDetails.stack.slice(0, 1000)}
              </Text>
            )}
          </View>
        )}
        
        {diagnostics && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
              Device Diagnostics:
            </Text>
            <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: 10 }}>
              Platform: {diagnostics.platform}{'\n'}
              Dev Mode: {diagnostics.isDev ? 'Yes' : 'No'}{'\n'}
              Timestamp: {diagnostics.timestamp}{'\n\n'}
              💡 Tip: Check the console for detailed logs to debug this issue.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 20 }}>
        <ActivityIndicator size="large" color={C.teal} />
        <Text style={{ marginTop: 16, fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
          Loading TradeFlow...
        </Text>
      </View>
    );
  }

  console.log('[APP] ✅ render - app is ready, rendering SafeAreaProvider + RootNavigator');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
