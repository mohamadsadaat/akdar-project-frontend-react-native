import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, PressableProps, ViewStyle, TextStyle, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  variant = 'primary',
  style,
  textStyle,
  fullWidth = true,
  ...rest
}: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.timing(scaleValue, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: false,
    }).start();
    rest.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    rest.onPressOut?.(e);
  };

  const getBackgroundColor = () => {
    if (isPrimary) return colors.primary;
    if (isSecondary) return colors.secondaryLight;
    return 'transparent';
  };

  const getTextColor = () => {
    if (isPrimary) return colors.surface;
    if (isSecondary) return colors.primaryDark;
    return colors.primary;
  };

  const getBorderColor = () => {
    if (isOutline) return colors.secondary;
    return 'transparent';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], width: fullWidth ? '100%' : 'auto' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: isOutline ? 1 : 0,
            opacity: pressed ? 0.9 : 1,
          },
          style,
        ]}
        {...rest}
      >
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  text: {
    ...typography.titleSm,
  },
});
