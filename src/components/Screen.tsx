import React from 'react';
import { StyleSheet, View, ViewProps, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
}

export const Screen = ({
  children,
  style,
  noPadding = false,
  safeArea = true,
  backgroundColor = colors.background,
  ...rest
}: ScreenProps) => {
  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor },
        !noPadding && styles.padding,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      {safeArea ? (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          {content}
        </SafeAreaView>
      ) : (
        content
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.containerPadding,
  },
});
