import React, { useRef } from 'react';
import { Pressable, Text, Animated, ActivityIndicator, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  icon,
  variant = 'primary',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !isLoading) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceVariant;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondaryContainer;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.onSurfaceVariant;
    switch (variant) {
      case 'primary': return colors.onPrimary;
      case 'secondary': return colors.onSecondaryContainer;
      case 'outline': return colors.primary;
      case 'text': return colors.primary;
      default: return colors.onPrimary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && { borderWidth: 1, borderColor: colors.primary },
          variant === 'primary' && styles.shadow,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <View style={styles.contentContainer}>
            <Text style={[typography.titleSm, { color: getTextColor() }]}>
              {title}
            </Text>
            {icon && (
              <MaterialIcons name={icon} size={24} color={getTextColor()} />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 9999, // full
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  shadow: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
