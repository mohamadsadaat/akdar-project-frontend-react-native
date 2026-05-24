import React from 'react';
import { StyleSheet, View, Text, Pressable, I18nManager } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header = ({ title, showBack = true, onBack, rightComponent }: HeaderProps) => {
  const navigation = useNavigation();
  const isRTL = I18nManager.isRTL;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack && (
          <Pressable onPress={handleBack} style={styles.backButton}>
            {isRTL ? (
              <Feather name="chevron-right" color={colors.text} size={24} />
            ) : (
              <Feather name="chevron-left" color={colors.text} size={24} />
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.centerContainer}>
        {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
      </View>

      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.background, // Or surface if sticky
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 3,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.headlineMd,
    color: colors.text,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs, // Offset padding for alignment
  },
});
