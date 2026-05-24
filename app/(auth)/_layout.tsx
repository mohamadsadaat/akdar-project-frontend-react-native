import React from 'react';
import { Stack } from 'expo-router';

// This layout wraps all screens inside the (auth) segment.
// It provides a fullscreen stack without a header and uses a fade animation
// to match the premium Stitch design language.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        // Keep background transparent so the AuthLayout background shows through.
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
