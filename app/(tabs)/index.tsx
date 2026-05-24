import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Pressable, I18nManager } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { colors } from '@/src/theme/colors';
import { shadows } from '@/src/theme/shadows';
import Feather from '@expo/vector-icons/Feather';
import { mockData } from '@/src/data/mockData';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const isRTL = I18nManager.isRTL;
  const router = useRouter();

  // We are forcing text alignment based on language direction
  const textAlignment = isRTL ? 'right' : 'left';

  return (
    <Screen safeArea>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: mockData.user.avatar }} 
              style={styles.avatar} 
            />
          </View>
        </View>
        
        <Text style={styles.headerTitle}>أخضر</Text>
        
        <Pressable style={styles.settingsButton}>
          <Feather name="settings" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={[styles.welcomeText, { textAlign: textAlignment }]}>أهلاً بك، {mockData.user.name}</Text>
          <Text style={[styles.welcomeSubText, { textAlign: textAlignment }]}>نتمنى لك يوماً صحياً مليئاً بالنشاط</Text>
        </View>

        {/* Upcoming Appointment Card */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <View style={styles.appointmentBadge}>
              <Text style={styles.appointmentBadgeText}>موعد قادم</Text>
            </View>
          </View>
          
          <View style={styles.appointmentDetails}>
            <View>
              <Text style={[styles.doctorName, { textAlign: textAlignment }]}>{mockData.upcomingAppointment.doctor}</Text>
              <Text style={[styles.specialty, { textAlign: textAlignment }]}>{mockData.upcomingAppointment.specialty}</Text>
              
              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeItem}>
                  <Feather name="calendar" size={16} color={colors.surface} />
                  <Text style={styles.dateTimeText}>{mockData.upcomingAppointment.date}</Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Feather name="clock" size={16} color={colors.surface} />
                  <Text style={styles.dateTimeText}>{mockData.upcomingAppointment.time}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.appointmentIconContainer}>
              <Feather name="file-text" size={32} color={colors.primaryLight} />
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>الوصول السريع</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction icon="calendar" label="حجز موعد" />
            <QuickAction icon="folder" label="السجل الصحي" />
            <QuickAction icon="file-text" label="الوصفات" />
            <QuickAction icon="activity" label="القياسات" />
            <QuickAction icon="bell" label="التنبيهات" />
            <QuickAction icon="plus-square" label="الأدوية" />
          </View>
        </View>

        {/* Health Summary (Bento Style) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>ملخص النشاط</Text>
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoItem, styles.bentoSteps]}>
              <Feather name="activity" size={24} color={colors.secondary} />
              <View>
                <Text style={[styles.bentoValue, { color: colors.primary, textAlign: textAlignment }]}>{mockData.activitySummary.steps}</Text>
                <Text style={[styles.bentoLabel, { textAlign: textAlignment }]}>خطوة اليوم</Text>
              </View>
            </View>
            
            <View style={[styles.bentoItem, styles.bentoHeart]}>
              <Feather name="heart" size={24} color={colors.error} />
              <View>
                <Text style={[styles.bentoValue, { color: colors.error, textAlign: textAlignment }]}>{mockData.activitySummary.heartRate}</Text>
                <Text style={[styles.bentoLabel, { textAlign: textAlignment }]}>نبض القلب</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر التنبيهات</Text>
            <Pressable>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </Pressable>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.notificationsList}
          >
            {mockData.recentAlerts.map((alert) => (
              <View key={alert.id} style={styles.notificationCard}>
                <View style={[
                  styles.notificationIcon, 
                  alert.type === 'primary' ? styles.notificationIconPrimary : styles.notificationIconSecondary
                ]}>
                  <Feather 
                    name={alert.icon as any} 
                    size={16} 
                    color={alert.type === 'primary' ? colors.primary : colors.secondary} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { textAlign: textAlignment }]}>{alert.title}</Text>
                  <Text style={[styles.notificationMessage, { textAlign: textAlignment }]} numberOfLines={2}>{alert.message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Extra padding for bottom nav & FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/BookAppointment')}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 28, borderless: true }}
      >
        <Feather name="plus" size={28} color={colors.surface} />
      </Pressable>
    </Screen>
  );
}

// Helper component for Quick Actions
const QuickAction = ({ icon, label }: { icon: any, label: string }) => {
  const isRTL = I18nManager.isRTL;
  const handlePress = () => {
    switch (icon) {
      case 'calendar':
        router.push('/(tabs)/appointments');
        break;
      case 'folder':
        router.push('/(tabs)/healthRecord');
        break;
      case 'file-text':
        // Assuming prescriptions screen not present, fallback to healthRecord
        router.push('/(tabs)/healthRecord');
        break;
      case 'activity':
        router.push('/(tabs)/healthRecord');
        break;
      case 'bell':
        router.push('/(tabs)/notifications');
        break;
      case 'plus-square':
        // No dedicated screen, could open a modal; for now navigate to profile
        router.push('/(tabs)/profile');
        break;
      default:
        // No action
        break;
    }
  };
  return (
    <Pressable style={styles.quickActionCard} onPress={handlePress}>
      <Feather name={icon} size={24} color={colors.secondary} style={styles.quickActionIcon} />
      <Text style={[styles.quickActionLabel, { textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    height: 64,
    backgroundColor: 'rgba(247, 250, 247, 0.8)', // Surface color with transparency for web
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...shadows.soft,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
    ...shadows.glow,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    ...typography.displayLgMobile,
    color: colors.primary,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  welcomeText: {
    ...typography.headlineMd,
    color: colors.text,
  },
  welcomeSubText: {
    ...typography.bodySm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  appointmentCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 24, // increased radius
    padding: 24, // reduced padding from 32
    ...shadows.soft,
    overflow: 'hidden',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  appointmentBadge: {
    backgroundColor: 'rgba(169, 241, 217, 0.2)', // primaryLight with opacity
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  appointmentBadgeText: {
    ...typography.labelCaps,
    color: colors.primaryLight,
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorName: {
    ...typography.titleSm,
    color: colors.surface,
  },
  specialty: {
    ...typography.bodySm,
    color: 'rgba(139, 210, 187, 0.8)', // on-primary-container
    marginBottom: spacing.md,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  dateTimeText: {
    ...typography.bodySm,
    color: colors.surface,
    marginLeft: 4,
    marginRight: 4,
  },
  appointmentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(139, 210, 187, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.titleSm,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionCard: {
    width: '31%', // roughly 3 items per row
    backgroundColor: colors.surface,
    borderRadius: 20, // increased radius
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 67, 53, 0.05)', // softer border
    ...shadows.soft,
    marginBottom: spacing.sm,
  },
  quickActionIcon: {
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.labelCaps,
    fontSize: 11,
    color: colors.textLight,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bentoItem: {
    flex: 1,
    height: 120,
    borderRadius: 24, // increased radius
    padding: 20, // reduced padding from 24
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  bentoSteps: {
    backgroundColor: 'rgba(107, 254, 156, 0.1)', // secondary-container
    borderColor: 'rgba(0, 109, 55, 0.1)',
  },
  bentoHeart: {
    backgroundColor: 'rgba(255, 218, 212, 0.3)', // tertiary-fixed
    borderColor: 'rgba(97, 41, 32, 0.1)',
  },
  bentoValue: {
    ...typography.headlineMd,
    fontWeight: 'bold',
  },
  bentoLabel: {
    ...typography.labelCaps,
    color: colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.labelCaps,
    color: colors.primary,
  },
  notificationsList: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  notificationCard: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: 20, // increased radius
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.15)', // outline-variant softer
    ...shadows.soft,
    marginRight: spacing.md,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconPrimary: {
    backgroundColor: 'rgba(169, 241, 217, 0.3)', // primary-fixed
  },
  notificationIconSecondary: {
    backgroundColor: 'rgba(107, 254, 156, 0.3)', // secondary-container
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.bodySm,
    color: colors.text,
    fontWeight: '600',
  },
  notificationMessage: {
    ...typography.labelCaps,
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Above bottom tab bar
    left: spacing.xl, // On the left for RTL
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
});
