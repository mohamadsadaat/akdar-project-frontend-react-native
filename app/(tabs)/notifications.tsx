import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, I18nManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { patientApi } from '@/src/api/patient';
import { getApiErrorMessage } from '@/src/api/client';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/DataState';
import { NotificationCardData, notificationToCard } from '@/src/utils/apiMappers';
import { useAuth } from '@/src/context/AuthContext';
import { avatarSource } from '@/src/utils/images';

// Extracted Notification Card component
const NotificationCard = ({
  notification,
  isRTL,
  textAlignment,
  onPress,
}: {
  notification: NotificationCardData;
  isRTL: boolean;
  textAlignment: 'right' | 'left';
  onPress: () => void;
}) => {
  const getIconStyle = () => {
    switch (notification.type) {
      case 'primary': return { bg: 'rgba(169, 241, 217, 0.3)', color: colors.primary }; // primary-fixed/30
      case 'secondary': return { bg: 'rgba(107, 254, 156, 0.4)', color: colors.secondary }; // secondary-container/40
      case 'tertiary': return { bg: 'rgba(255, 218, 212, 0.4)', color: colors.tertiary }; // tertiary-fixed/40
      default: return { bg: 'rgba(169, 241, 217, 0.3)', color: colors.primary };
    }
  };

  const iconStyle = getIconStyle();

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.notificationCard, 
        notification.isUnread ? styles.unreadCard : styles.readCard,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}
    >
      {notification.isUnread && (
        <View style={[styles.unreadDot, isRTL ? { right: 16 } : { left: 16 }]} />
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: iconStyle.bg }]}>
        <Feather name={notification.icon as any} size={24} color={iconStyle.color} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.cardTitle, { textAlign: textAlignment }]}>{notification.title}</Text>
          <Text style={styles.cardTime}>{notification.time}</Text>
        </View>
        <Text style={[styles.cardMessage, { textAlign: textAlignment }]}>{notification.message}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patientApi.getNotifications();
      setNotifications(response.data.map(notificationToCard));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = async () => {
    setIsMarkingAll(true);

    try {
      await patientApi.markAllNotificationsRead();
      setNotifications((items) => items.map((item) => ({ ...item, isUnread: false })));
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markOneAsRead = async (id: string) => {
    const current = notifications.find((notification) => notification.id === id);
    if (!current?.isUnread) return;

    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isUnread: false } : item));

    try {
      await patientApi.markNotificationRead(id);
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e));
      void loadNotifications();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.headerTitle}>أخضر</Text>
        <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.settingsButton}>
            <Feather name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Image source={avatarSource(user?.avatar_url)} style={styles.avatar} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.title}>التنبيهات</Text>
          <TouchableOpacity
            style={[styles.markReadButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={markAllAsRead}
            disabled={isMarkingAll || notifications.length === 0}
          >
            <Text style={styles.markReadText}>{isMarkingAll ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}</Text>
            <Feather name="check-circle" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadNotifications} />
          ) : notifications.length === 0 ? (
            <EmptyState title="لا توجد تنبيهات" />
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isRTL={isRTL}
                textAlignment={textAlignment}
                onPress={() => markOneAsRead(notification.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 64,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(247, 250, 247, 0.8)',
    zIndex: 50,
  },
  headerTitle: {
    ...typography.displayLgMobile,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerActions: {
    alignItems: 'center',
    gap: spacing.md,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 67, 53, 0.2)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.lg,
    paddingBottom: 120, // Space for BottomNavBar
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  markReadButton: {
    backgroundColor: 'rgba(107, 254, 156, 0.2)', // secondary-container/20
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    ...typography.labelCaps,
    color: colors.secondary,
  },
  listContainer: {
    gap: spacing.cardGap,
  },
  notificationCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 92, 74, 0.1)',
    gap: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.soft,
  },
  readCard: {
    backgroundColor: 'rgba(242, 244, 241, 0.5)', // surface-container-low/50
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
    opacity: 0.8,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    ...shadows.glow,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.titleSm,
    color: colors.primary,
    flex: 1,
  },
  cardTime: {
    ...typography.labelCaps,
    color: colors.outline,
    marginLeft: spacing.xs,
  },
  cardMessage: {
    ...typography.bodySm,
    color: colors.textLight,
    lineHeight: 22,
  },
});
