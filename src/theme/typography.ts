import { Platform } from 'react-native';

// In Expo, you usually need to load the fonts and reference them by name.
// Assuming we will load "IBM Plex Sans" with specific weights.
// If using Expo Google Fonts, the names usually look like 'IBMPlexSans_400Regular', etc.
// For now, we define the logical weights. We'll map them appropriately if a custom font is loaded.

export const fonts = {
  regular: Platform.select({ ios: 'IBM Plex Sans', android: 'IBMPlexSans-Regular', default: 'System' }),
  medium: Platform.select({ ios: 'IBM Plex Sans', android: 'IBMPlexSans-Medium', default: 'System' }),
  semiBold: Platform.select({ ios: 'IBM Plex Sans', android: 'IBMPlexSans-SemiBold', default: 'System' }),
  bold: Platform.select({ ios: 'IBM Plex Sans', android: 'IBMPlexSans-Bold', default: 'System' }),
};

export const typography = {
  displayLg: {
    fontFamily: fonts.bold,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 42,
    letterSpacing: -0.68, // -0.02em of 34px
  },
  displayLgMobile: {
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.28, // -0.01em of 28px
  },
  headlineMd: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  titleSm: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  bodySm: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 0.6, // 0.05em of 12px
    textTransform: 'uppercase' as const,
  },
};
