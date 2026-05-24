import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { shadows } from '../theme/shadows';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card = ({ children, style, noPadding = false, ...rest }: CardProps) => {
  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padding,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  padding: {
    padding: spacing.containerPadding,
  },
});
