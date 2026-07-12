declare module 'react-native-reanimated' {
  import * as React from 'react';
  import { ScrollView as RNScrollView, Text as RNText, View as RNView } from 'react-native';

  const Animated: {
    ScrollView: typeof RNScrollView;
    Text: typeof RNText;
    View: typeof RNView;
    [key: string]: unknown;
  };

  namespace Animated {
    export type ScrollView = React.ElementRef<typeof RNScrollView>;
  }

  export default Animated;

  export function interpolate(...args: unknown[]): number;
  export function useAnimatedRef<T = unknown>(): React.RefObject<T>;
  export function useAnimatedStyle<T extends Record<string, unknown>>(updater: () => T): T;
  export function useScrollOffset(ref: React.RefObject<unknown>): { value: number };
}
