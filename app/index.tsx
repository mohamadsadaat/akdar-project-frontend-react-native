import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout } from '../src/components/AuthLayout';
import { useAuth } from '../src/context/AuthContext';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Simulate splash duration then navigate based on auth state.
    const timer = setTimeout(() => {
      if (!isLoading) {
        router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
      }
    }, 2000); // 2 seconds splash
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  return (
    <AuthLayout>
      <View style={{ alignItems: 'center' }}>
        <Text style={[typography.displayLg, { color: colors.onPrimary, marginBottom: 24 }]}>أخضر</Text>
        <ActivityIndicator size="large" color={colors.onPrimary} />
      </View>
    </AuthLayout>
  );
}
