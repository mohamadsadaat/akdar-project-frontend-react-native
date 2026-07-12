import { AppointmentCard, AppointmentProps } from '@/src/components/AppointmentCard';
import { CustomModal } from '@/src/components/CustomModal';
import { colors } from '@/src/theme/colors';
import { shadows } from '@/src/theme/shadows';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, I18nManager, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { patientApi } from '@/src/api/patient';
import { getApiErrorMessage } from '@/src/api/client';
import { appointmentToCard } from '@/src/utils/apiMappers';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/DataState';
import { avatarSource } from '@/src/utils/images';
import { useAuth } from '@/src/context/AuthContext';

export default function AppointmentsScreen() {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentProps | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await patientApi.getAppointments(activeTab);
      setAppointments(response.data.map(appointmentToCard));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleCancelClick = (appointment: AppointmentProps) => {
    setSelectedAppointment(appointment);
    setCancelModalVisible(true);
  };

  const handleRescheduleClick = (appointment: AppointmentProps) => {
    if (!appointment.doctorId) {
      Alert.alert('تعذر فتح إعادة الجدولة', 'لا توجد بيانات كافية عن الطبيب لهذا الموعد.');
      return;
    }

    router.push({
      pathname: '/BookAppointment',
      params: {
        mode: 'reschedule',
        appointmentId: appointment.id,
        doctorId: String(appointment.doctorId),
        startsAt: appointment.startsAt,
        duration: String(appointment.durationMinutes),
        reason: appointment.reason ?? '',
      },
    });
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;

    setIsCancelling(true);

    try {
      await patientApi.cancelAppointment(selectedAppointment.id);
      setCancelModalVisible(false);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={avatarSource(user?.avatar_url)} style={styles.avatar} />
        </View>
        <Text style={styles.headerTitle}>أخضر</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Feather name="settings" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={[styles.title, { textAlign: textAlignment }]}>مواعيدي</Text>
          <Text style={[styles.subtitle, { textAlign: textAlignment }]}>إدارة وتتبع استشاراتك الطبية</Text>
        </View>

        {/* Segmented Tabs */}
        <View style={[styles.tabsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>القادمة</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>السابقة</Text>
          </Pressable>
        </View>

        {/* Appointments List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadAppointments} />
          ) : appointments.length === 0 ? (
            <EmptyState
              title={activeTab === 'upcoming' ? 'لا توجد مواعيد قادمة' : 'لا توجد مواعيد سابقة'}
              message={activeTab === 'upcoming' ? 'احجز موعدك الأول من زر الإضافة.' : undefined}
            />
          ) : (
            appointments.map((appointment) => (
              <View key={appointment.id}>
                <AppointmentCard appointment={appointment} />

                {/* Actions for upcoming appointments */}
                {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                  <View style={[styles.actionButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelClick(appointment)}
                    >
                      <Text style={styles.cancelButtonText}>إلغاء</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rescheduleButton}
                      onPress={() => handleRescheduleClick(appointment)}
                    >
                      <Text style={styles.rescheduleButtonText}>إعادة جدولة</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB for new booking */}
      <TouchableOpacity
        style={[styles.fab, isRTL ? { left: spacing.containerPadding } : { right: spacing.containerPadding }]}
        onPress={() => router.push('/BookAppointment')}
      >
        <Feather name="plus" size={32} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Cancellation Modal */}
      <CustomModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        title="إلغاء الموعد"
      >
        <Text style={[styles.modalText, { textAlign: textAlignment }]}>
          هل أنت متأكد من رغبتك في إلغاء موعدك مع {selectedAppointment?.doctor}؟
        </Text>
        <View style={styles.warningBox}>
          <Feather name="alert-triangle" size={20} color={colors.tertiary} />
          <Text style={[styles.warningText, { textAlign: textAlignment }]}>
            يرجى العلم أن الإلغاء خلال 48 ساعة من الموعد قد يترتب عليه رسوم إدارية حسب سياسة العيادة.
          </Text>
        </View>
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.modalCancelBtn}
            onPress={() => setCancelModalVisible(false)}
          >
            <Text style={styles.modalCancelBtnText}>تراجع</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalConfirmBtn}
            onPress={confirmCancel}
            disabled={isCancelling}
          >
            <Text style={styles.modalConfirmBtnText}>{isCancelling ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 64, // Status bar + spacing
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(247, 250, 247, 0.8)',
    zIndex: 50,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryFixed,
    overflow: 'hidden',
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
  },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.lg,
    paddingBottom: 120, // Extra space for FAB and BottomNavBar
  },
  headlineContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineMd,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textLight,
  },
  tabsContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 9999,
    padding: 4,
    marginBottom: spacing.xl,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9999,
  },
  activeTab: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.soft,
  },
  tabText: {
    ...typography.titleSm,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  listContainer: {
    gap: spacing.cardGap,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.errorContainer,
  },
  cancelButtonText: {
    ...typography.titleSm,
    color: colors.error,
  },
  rescheduleButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
  },
  rescheduleButtonText: {
    ...typography.titleSm,
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 112, // Above the bottom tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
    zIndex: 40,
  },
  modalText: {
    ...typography.bodyLg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.tertiaryFixed,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  warningText: {
    ...typography.bodySm,
    color: colors.tertiary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
  },
  modalCancelBtnText: {
    ...typography.titleSm,
    color: colors.text,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.error,
  },
  modalConfirmBtnText: {
    ...typography.titleSm,
    color: colors.onError,
  },
});
