import React, { useMemo, useState } from 'react';
import { Alert, I18nManager, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { useAuth } from '@/src/context/AuthContext';
import { LoadingState } from '@/src/components/DataState';
import { calculateAge, formatNumber } from '@/src/utils/format';
import { avatarSource } from '@/src/utils/images';
import { CustomModal } from '@/src/components/CustomModal';

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type ProfileModalKey = 'personal' | 'payment' | 'privacy' | 'faq' | 'contact';

type ModalRow = {
  label: string;
  value: string;
};

type ModalContent = {
  title: string;
  icon: FeatherName;
  description?: string;
  rows?: ModalRow[];
  bullets?: string[];
  actions?: 'contact';
};

type SettingItemProps = {
  icon: FeatherName;
  title: string;
  isRTL: boolean;
  onPress: () => void;
};

const emptyValue = 'غير محدد';

const SettingItem = ({ icon, title, isRTL, onPress }: SettingItemProps) => (
  <TouchableOpacity
    style={[styles.settingItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.settingContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Feather name={icon} size={24} color={colors.textLight} />
      <Text style={[styles.settingText, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
    </View>
    <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={24} color={colors.outline} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';
  const { user, profile, logout, isLoading } = useAuth();
  const age = calculateAge(profile?.birth_date);
  const [activeModal, setActiveModal] = useState<ProfileModalKey | null>(null);

  const modalContent = useMemo<Record<ProfileModalKey, ModalContent>>(() => ({
    personal: {
      title: 'المعلومات الشخصية',
      icon: 'user',
      description: 'هذه البيانات قادمة من حسابك الطبي في Laravel.',
      rows: [
        { label: 'الاسم', value: user?.name ?? emptyValue },
        { label: 'البريد الإلكتروني', value: user?.email ?? emptyValue },
        { label: 'رقم الهاتف', value: user?.phone ?? emptyValue },
        { label: 'معرف المريض', value: profile?.patient_number ?? emptyValue },
        { label: 'تاريخ الميلاد', value: profile?.birth_date ?? emptyValue },
        { label: 'الجنس', value: profile?.gender ?? emptyValue },
      ],
    },
    payment: {
      title: 'طرق الدفع',
      icon: 'credit-card',
      description: 'لا توجد طرق دفع محفوظة حالياً.',
      bullets: [
        'الدفع الإلكتروني غير مربوط ببوابة دفع حالياً.',
        'تقدر تتابع الحجز والدفع لاحقاً من المركز الطبي.',
      ],
    },
    privacy: {
      title: 'الخصوصية والأمان',
      icon: 'shield',
      description: 'حسابك يعمل بتوكن Sanctum محفوظ محلياً بشكل آمن.',
      bullets: [
        'عند انتهاء الجلسة يتم إخراجك تلقائياً لشاشة تسجيل الدخول.',
        'لتغيير كلمة المرور استخدم خيار نسيت كلمة المرور من شاشة الدخول.',
        'تسجيل الخروج يحذف التوكن الحالي من الجهاز والسيرفر.',
      ],
    },
    faq: {
      title: 'الأسئلة الشائعة',
      icon: 'help-circle',
      bullets: [
        'كيف أحجز موعد؟ من زر الإضافة في تبويب المواعيد.',
        'كيف ألغي موعد؟ من بطاقة الموعد القادم اضغط إلغاء.',
        'كيف أعيد الجدولة؟ من بطاقة الموعد القادم اضغط إعادة جدولة واختر وقتاً جديداً.',
      ],
    },
    contact: {
      title: 'تواصل معنا',
      icon: 'headphones',
      description: 'فريق الدعم جاهز لمساعدتك بخصوص الحساب أو المواعيد.',
      rows: [
        { label: 'الهاتف', value: '+963110000000' },
        { label: 'البريد', value: 'support@akdar.test' },
        { label: 'العنوان', value: 'دمشق، شارع الثورة' },
      ],
      actions: 'contact',
    },
  }), [profile?.birth_date, profile?.gender, profile?.patient_number, user?.email, user?.name, user?.phone]);

  const currentModal = activeModal ? modalContent[activeModal] : null;

  const openExternalUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('تعذر الفتح', 'لم نتمكن من فتح التطبيق المناسب على هذا الجهاز.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={styles.headerTitle}>أخضر</Text>
        <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setActiveModal('privacy')}>
            <Feather name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Profile Header Section */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <View style={styles.mainAvatarContainer}>
                  <Image source={avatarSource(profile?.avatar_url ?? user?.avatar_url)} style={styles.mainAvatar} />
                </View>
                <TouchableOpacity style={styles.editButton} onPress={() => setActiveModal('personal')}>
                  <Feather name="edit-2" size={14} color={colors.onSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>{user?.name ?? 'المستخدم'}</Text>
              <Text style={styles.patientId}>معرف المريض: {profile?.patient_number ?? emptyValue}</Text>
            </View>

            {/* Bento Grid Medical Summary */}
            <View style={[styles.bentoGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.bentoCard}>
                <Feather name="droplet" size={24} color={colors.secondary} style={styles.bentoIcon} />
                <Text style={styles.bentoLabel}>فصيلة الدم</Text>
                <Text style={styles.bentoValue}>{profile?.blood_type ?? emptyValue}</Text>
              </View>
              <View style={styles.bentoCard}>
                <Feather name="bar-chart-2" size={24} color={colors.secondary} style={styles.bentoIcon} />
                <Text style={styles.bentoLabel}>الطول</Text>
                <Text style={styles.bentoValue}>{profile?.height_cm ? `${formatNumber(profile.height_cm)} سم` : emptyValue}</Text>
              </View>
              <View style={styles.bentoCard}>
                <Feather name="activity" size={24} color={colors.secondary} style={styles.bentoIcon} />
                <Text style={styles.bentoLabel}>الوزن</Text>
                <Text style={styles.bentoValue}>{profile?.weight_kg ? `${formatNumber(profile.weight_kg)} كغ` : emptyValue}</Text>
              </View>
              <View style={styles.bentoCard}>
                <Feather name="calendar" size={24} color={colors.secondary} style={styles.bentoIcon} />
                <Text style={styles.bentoLabel}>العمر</Text>
                <Text style={styles.bentoValue}>{age ? `${formatNumber(age)} سنة` : emptyValue}</Text>
              </View>
            </View>

            {/* Account Settings List */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>إعدادات الحساب</Text>
              </View>
              <View style={styles.sectionBody}>
                <SettingItem icon="user" title="المعلومات الشخصية" isRTL={isRTL} onPress={() => setActiveModal('personal')} />
                <SettingItem icon="credit-card" title="طرق الدفع" isRTL={isRTL} onPress={() => setActiveModal('payment')} />
                <SettingItem icon="shield" title="الخصوصية والأمان" isRTL={isRTL} onPress={() => setActiveModal('privacy')} />
              </View>
            </View>

            {/* Help & Support */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.sectionTitle, { textAlign: textAlignment }]}>الدعم والمساعدة</Text>
              </View>
              <View style={styles.sectionBody}>
                <SettingItem icon="help-circle" title="الأسئلة الشائعة" isRTL={isRTL} onPress={() => setActiveModal('faq')} />
                <SettingItem icon="headphones" title="تواصل معنا" isRTL={isRTL} onPress={() => setActiveModal('contact')} />
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.logoutButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => void logout()}
            >
              <Feather name="log-out" size={20} color={colors.error} />
              <Text style={styles.logoutText}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <CustomModal
        visible={Boolean(currentModal)}
        onClose={() => setActiveModal(null)}
        title={currentModal?.title ?? ''}
      >
        {currentModal && (
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalIconWrap}>
              <Feather name={currentModal.icon} size={28} color={colors.primary} />
            </View>

            {currentModal.description && (
              <Text style={[styles.modalDescription, { textAlign: textAlignment }]}>{currentModal.description}</Text>
            )}

            {currentModal.rows?.map((row) => (
              <View key={row.label} style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.infoLabel, { textAlign: textAlignment }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { textAlign: textAlignment }]}>{row.value}</Text>
              </View>
            ))}

            {currentModal.bullets?.map((item) => (
              <View key={item} style={[styles.bulletRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.bulletDot} />
                <Text style={[styles.bulletText, { textAlign: textAlignment }]}>{item}</Text>
              </View>
            ))}

            {currentModal.actions === 'contact' && (
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.contactActionButton} onPress={() => void openExternalUrl('tel:+963110000000')}>
                  <Feather name="phone" size={18} color={colors.onPrimary} />
                  <Text style={styles.contactActionText}>اتصال</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryActionButton} onPress={() => void openExternalUrl('mailto:support@akdar.test')}>
                  <Feather name="mail" size={18} color={colors.primary} />
                  <Text style={styles.secondaryActionText}>إرسال بريد</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </CustomModal>
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
    paddingBottom: 120,
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
    width: 112,
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
    borderBottomColor: 'rgba(191, 201, 195, 0.2)',
  },
  sectionTitle: {
    ...typography.titleSm,
    color: colors.primary,
  },
  sectionBody: {},
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
  modalScroll: {
    maxHeight: 420,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(169, 241, 217, 0.3)',
    marginBottom: spacing.md,
  },
  modalDescription: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 201, 195, 0.2)',
  },
  infoLabel: {
    ...typography.bodySm,
    color: colors.outline,
    flex: 1,
  },
  infoValue: {
    ...typography.titleSm,
    color: colors.text,
    flex: 2,
  },
  bulletRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  bulletText: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  contactActions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  contactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
  },
  contactActionText: {
    ...typography.titleSm,
    color: colors.onPrimary,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingVertical: 14,
  },
  secondaryActionText: {
    ...typography.titleSm,
    color: colors.primary,
  },
});
