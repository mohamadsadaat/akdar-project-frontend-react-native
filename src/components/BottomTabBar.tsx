import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { radius } from '../theme/spacing';

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { index, routes } = state;
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {routes.map((route: { key: string; name: string; params?: any }, idx: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = index === idx;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const renderIcon = (color: string) => {
          const size = 24;
          switch (route.name) {
            case 'index':
              return <Feather name="home" color={color} size={size} />;
            case 'appointments':
              return <Feather name="calendar" color={color} size={size} />;
            case 'healthRecord':
              return <Feather name="activity" color={color} size={size} />;
            case 'notifications':
              return <Feather name="bell" color={color} size={size} />;
            case 'profile':
              return <Feather name="user" color={color} size={size} />;
            default:
              return <Feather name="home" color={color} size={size} />;
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tab,
              isFocused && styles.activeTab,
              isFocused && { backgroundColor: colors.primaryFixed + '20' },
            ]}
          >
            {renderIcon(isFocused ? colors.primary : colors.outline)}
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.primary : colors.outline, fontWeight: isFocused ? 'bold' : 'normal' },
                ]}
              >
                {label as string}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: 12,
    ...shadows.soft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    height: 48,
  },
  activeTab: {},
  label: {
    ...typography.labelCaps,
    fontSize: 10,
    marginTop: 4,
    textTransform: 'none',
  },
});

// Named export alias for backward compatibility
export { BottomTabBar };
