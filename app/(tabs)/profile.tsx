import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, I18nManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { mockData } from '@/src/data/mockData';

const SettingItem = ({ icon, title, isRTL }: any) => (
  <TouchableOpacity style={[styles.settingItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
    <View style={[styles.settingContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Feather name={icon} size={24} color={colors.textLight} />
      <Text style={[styles.settingText, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
    </View>
    <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={24} color={colors.outline} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.headerTitle}>أخضر</Text>
        <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.settingsButton}>
            <Feather name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.mainAvatarContainer}>
              <Image source={{ uri: mockData.user.avatar }} style={styles.mainAvatar} />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Feather name="edit-2" size={14} color={colors.onSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>سارة أحمد الهاشمي</Text>
          <Text style={styles.patientId}>معرف المريض: #AK-882910</Text>
        </View>

        {/* Bento Grid Medical Summary */}
        <View style={[styles.bentoGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.bentoCard}>
            <Feather name="droplet" size={24} color={colors.secondary} style={styles.bentoIcon} />
            <Text style={styles.bentoLabel}>فصيلة الدم</Text>
            <Text style={styles.bentoValue}>O+</Text>
          </View>
          <View style={styles.bentoCard}>
            <Feather name="bar-chart-2" size={24} color={colors.secondary} style={styles.bentoIcon} />
            <Text style={styles.bentoLabel}>الطول</Text>
            <Text style={styles.bentoValue}>165 سم</Text>
          </View>
          <View style={styles.bentoCard}>
            <Feather name="activity" size={24} color={colors.secondary} style={styles.bentoIcon} />
            <Text style={styles.bentoLabel}>الوزن</Text>
            <Text style={styles.bentoValue}>62 كجم</Text>
          </View>
          <View style={styles.bentoCard}>
            <Feather name="calendar" size={24} color={colors.secondary} style={styles.bentoIcon} />
            <Text style={styles.bentoLabel}>العمر</Text>
            <Text style={styles.bentoValue}>29 سنة</Text>
          </View>
        </View>

        {/* Account Settings List */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>إعدادات الحساب</Text>
          </View>
          <View style={styles.sectionBody}>
            <SettingItem icon="user" title="المعلومات الشخصية" isRTL={isRTL} />
            <SettingItem icon="credit-card" title="طرق الدفع" isRTL={isRTL} />
            <SettingItem icon="shield" title="الخصوصية والأمان" isRTL={isRTL} />
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>الدعم والمساعدة</Text>
          </View>
          <View style={styles.sectionBody}>
            <SettingItem icon="help-circle" title="الأسئلة الشائعة" isRTL={isRTL} />
            <SettingItem icon="headphones" title="تواصل معنا" isRTL={isRTL} />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Feather name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 120, // Space for BottomNavBar
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  mainAvatarContainer: {
    width: 112, // w-28
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#ffffff',
    overflow: 'hidden',
    ...shadows.soft,
  },
  mainAvatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...shadows.soft,
  },
  profileName: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: 4,
  },
  patientId: {
    ...typography.bodySm,
    color: colors.outline,
  },
  bentoGrid: {
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: spacing.xl,
  },
  bentoCard: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 67, 53, 0.1)',
    ...shadows.soft,
    alignItems: 'center',
  },
  bentoIcon: {
    marginBottom: spacing.xs,
  },
  bentoLabel: {
    ...typography.labelCaps,
    color: colors.outline,
    marginBottom: 2,
  },
  bentoValue: {
    ...typography.titleSm,
    color: colors.primary,
  },
  sectionContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 67, 53, 0.1)',
    ...shadows.soft,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 201, 195, 0.2)', // outline-variant/20
  },
  sectionTitle: {
    ...typography.titleSm,
    color: colors.primary,
  },
  sectionBody: {
    // padding for children is handled by settingItem
  },
  settingItem: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 201, 195, 0.1)',
  },
  settingContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  settingText: {
    ...typography.bodyLg,
    color: colors.text,
  },
  logoutButton: {
    width: '100%',
    padding: 16,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutText: {
    ...typography.titleSm,
    color: colors.error,
  },
});
