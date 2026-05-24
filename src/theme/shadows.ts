import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows = {
  // Soft ambient shadow (e.g., 0px 10px 30px rgba(0, 92, 74, 0.05))
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#005C4A', // Using hex for shadowColor
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.03, // softened
      shadowRadius: 30,
    },
    android: {
      elevation: 2, // softened
      shadowColor: '#005C4A', // Android 28+ supports colored shadows
    },
    default: {
      // Web
      boxShadow: '0px 10px 30px rgba(0, 92, 74, 0.03)', // softened
    } as any, // Cast to any to bypass strict type check for web extension
  }) as ViewStyle,

  // Pronounced green glow for profile icon
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15, // softened
      shadowRadius: 20,
    },
    android: {
      elevation: 4, // softened
      shadowColor: colors.secondary,
    },
    default: {
      boxShadow: '0px 8px 20px rgba(46, 204, 113, 0.15)', // softened
    } as any,
  }) as ViewStyle,
};
