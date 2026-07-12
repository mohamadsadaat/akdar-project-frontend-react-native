import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Platform } from 'react-native';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme/colors';

// Force RTL layout for Arabic support
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
}

function RootNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDashboard = (segments as string[])[0] === 'dashboard';
    const isSplash = (segments as string[]).length === 0;

    if (inDashboard) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !isSplash) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (isAuthenticated && user?.role !== 'patient') {
      router.replace('/dashboard' as never);
    } else if (isAuthenticated && (inAuthGroup || isSplash)) {
      // Redirect away from the login page.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router, user?.role]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" options={{ animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
