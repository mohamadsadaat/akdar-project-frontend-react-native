import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any; // To allow setting margin on the container easily
}

export const Input = ({ label, error, style, containerStyle, ...rest }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          style={[styles.input, { textAlign: 'right' }]} // Defaulting to right for RTL if not handled automatically
          placeholderTextColor={colors.outline}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.gutter,
  },
  label: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'left', // Will be mirrored in RTL
  },
  inputContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.full, // Or radius.md depending on preference, "Rounded inputs" was specified
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.gutter,
    height: 48,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    // Add a subtle glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    ...typography.bodyLg,
    color: colors.text,
    flex: 1,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginTop: spacing.xs,
    textAlign: 'left',
  },
});
