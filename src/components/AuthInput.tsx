import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  isPassword,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={colors.outline} 
            style={styles.rightIcon} 
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            icon && styles.inputWithIcon,
            isPassword && styles.inputWithLeftIcon,
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={colors.outlineVariant}
          textAlign="right"
          {...props}
        />

        {isPassword && (
          <Pressable onPress={togglePasswordVisibility} style={styles.leftIcon}>
            <MaterialIcons 
              name={isPasswordVisible ? 'visibility-off' : 'visibility'} 
              size={20} 
              color={colors.outline} 
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    ...typography.labelCaps,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputFocused: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: `${colors.primary}33`, // primary/20
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  rightIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: 4,
    textAlign: 'right',
  },
});
