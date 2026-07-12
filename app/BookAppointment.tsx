import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, I18nManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';
import { patientApi } from '@/src/api/patient';
import { getApiErrorMessage } from '@/src/api/client';
import { ApiDoctor } from '@/src/api/types';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/DataState';
import { addDays, formatDate, formatTime, toDateInputValue } from '@/src/utils/format';
import { avatarSource } from '@/src/utils/images';

const getParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const getDateInputFromParam = (value?: string) => {
  if (!value) {
    return toDateInputValue(new Date());
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? toDateInputValue(new Date()) : toDateInputValue(parsedDate);
};

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    appointmentId?: string;
    doctorId?: string;
    startsAt?: string;
    duration?: string;
    reason?: string;
  }>();
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';
  const mode = getParam(params.mode);
  const appointmentId = getParam(params.appointmentId);
  const startsAtParam = getParam(params.startsAt);
  const reasonParam = getParam(params.reason);
  const doctorIdParam = Number(getParam(params.doctorId));
  const durationParam = Number(getParam(params.duration));
  const rescheduleDoctorId = Number.isFinite(doctorIdParam) && doctorIdParam > 0 ? doctorIdParam : null;
  const initialDuration = durationParam === 60 ? 60 : 30;
  const isRescheduling = mode === 'reschedule' && Boolean(appointmentId);

  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(rescheduleDoctorId);
  const [selectedDate, setSelectedDate] = useState(getDateInputFromParam(startsAtParam));
  const [duration, setDuration] = useState(initialDuration);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState(reasonParam ?? '');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index);
      return {
        value: toDateInputValue(date),
        day: new Intl.DateTimeFormat('ar-SY', { weekday: 'long' }).format(date),
        date: new Intl.DateTimeFormat('ar-SY', { day: 'numeric' }).format(date),
      };
    });
  }, []);

  const loadDoctors = useCallback(async () => {
    setIsLoadingDoctors(true);
    setDoctorsError(null);

    try {
      const response = await patientApi.getDoctors({
        search: isRescheduling ? undefined : search.trim() || undefined,
        per_page: 20,
      });
      setDoctors(response.data);
      setSelectedDoctorId((currentId) => (
        (isRescheduling ? rescheduleDoctorId : currentId) &&
        response.data.some((doctor) => doctor.id === (isRescheduling ? rescheduleDoctorId : currentId))
          ? (isRescheduling ? rescheduleDoctorId : currentId)
          : response.data[0]?.id ?? null
      ));
    } catch (e) {
      setDoctorsError(getApiErrorMessage(e));
    } finally {
      setIsLoadingDoctors(false);
    }
  }, [isRescheduling, rescheduleDoctorId, search]);

  const loadAvailability = useCallback(async () => {
    if (!selectedDoctorId) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      const response = await patientApi.getDoctorAvailability(selectedDoctorId, selectedDate, duration);
      setSlots(response.slots);
      setSelectedSlot(response.slots[0] ?? null);
    } catch (e) {
      setSlots([]);
      setSelectedSlot(null);
      setSlotsError(getApiErrorMessage(e));
    } finally {
      setIsLoadingSlots(false);
    }
  }, [duration, selectedDate, selectedDoctorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadDoctors]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const handleBook = async () => {
    if (!selectedDoctorId || !selectedSlot) {
      Alert.alert('تنبيه', 'اختر الطبيب والوقت المناسب قبل تأكيد الحجز.');
      return;
    }

    if (isRescheduling && !appointmentId) {
      Alert.alert('تعذر إعادة الجدولة', 'لا يوجد رقم موعد صالح لإعادة جدولته.');
      return;
    }

    setIsBooking(true);

    try {
      const payload = {
        starts_at: selectedSlot,
        duration_minutes: duration,
        reason: reason.trim() || undefined,
      };

      if (isRescheduling && appointmentId) {
        await patientApi.rescheduleAppointment(appointmentId, payload);
      } else {
        await patientApi.createAppointment({
          doctor_id: selectedDoctorId,
          ...payload,
        });
      }

      Alert.alert(
        isRescheduling ? 'تمت إعادة الجدولة' : 'تم الحجز',
        isRescheduling ? 'تم تحديث موعدك بنجاح.' : 'تم إرسال طلب موعدك بنجاح.',
        [
          { text: 'حسناً', onPress: () => router.replace('/(tabs)/appointments') },
      ]);
    } catch (e) {
      Alert.alert('خطأ', getApiErrorMessage(e));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRescheduling ? 'إعادة جدولة الموعد' : 'حجز موعد جديد'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        {!isRescheduling && (
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { textAlign: textAlignment }]}
              placeholder="ابحث عن طبيب أو تخصص..."
              placeholderTextColor={colors.outlineVariant}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {/* Doctor Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: textAlignment, marginBottom: spacing.md }]}>
            {isRescheduling ? 'الطبيب الحالي' : 'اختر الطبيب'}
          </Text>
          {isRescheduling && (
            <View style={[styles.lockedDoctorNotice, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Feather name="lock" size={16} color={colors.primary} />
              <Text style={[styles.lockedDoctorNoticeText, { textAlign: textAlignment }]}>
                إعادة الجدولة تكون مع نفس الطبيب.
              </Text>
            </View>
          )}
          {isLoadingDoctors ? (
            <LoadingState label="جاري تحميل الأطباء..." />
          ) : doctorsError ? (
            <ErrorState message={doctorsError} onRetry={loadDoctors} />
          ) : doctors.length === 0 ? (
            <EmptyState title="لا يوجد أطباء مطابقون" />
          ) : (
            <View style={styles.doctorsList}>
              {doctors.map((doctor) => {
                const isSelected = doctor.id === selectedDoctorId;
                return (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[
                      styles.doctorCard,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      isSelected && styles.selectedDoctorCard,
                    ]}
                    onPress={() => {
                      if (!isRescheduling) {
                        setSelectedDoctorId(doctor.id);
                      }
                    }}
                    disabled={isRescheduling}
                  >
                    <View style={styles.doctorImageContainer}>
                      <Image source={avatarSource(doctor.avatar_url)} style={styles.doctorImage} />
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={[styles.doctorName, { textAlign: textAlignment }]}>{doctor.name}</Text>
                      <Text style={[styles.doctorSpecialty, { textAlign: textAlignment }]}>
                        {doctor.specialty?.name_ar ?? doctor.facility?.name ?? 'تخصص غير محدد'}
                      </Text>
                      <View style={[styles.ratingContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={[styles.ratingBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          <Feather name="star" size={14} color={colors.secondary} />
                          <Text style={styles.ratingText}>{doctor.rating_average.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.reviewsText}>{doctor.reviews_count}+ تقييم</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {selectedDoctor && (
          <View style={styles.selectedDoctorHint}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.selectedDoctorHintText, { textAlign: textAlignment }]}>
              {selectedDoctor.facility?.name ?? 'منشأة غير محددة'}
            </Text>
          </View>
        )}

        {/* Modern Calendar Picker */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>اختر التاريخ</Text>
            <Text style={styles.monthText}>{formatDate(selectedDate, false)}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.datesContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {dates.map((item) => {
              const isSelected = selectedDate === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.dateBox, isSelected && styles.selectedDateBox]}
                  onPress={() => setSelectedDate(item.value)}
                >
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{item.day}</Text>
                  <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>{item.date}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Duration Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: textAlignment, marginBottom: spacing.md }]}>مدة الجلسة</Text>
          <View style={[styles.durationContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity 
              style={[styles.durationButton, duration === 30 && styles.selectedDurationBtn]}
              onPress={() => setDuration(30)}
            >
              <Text style={[styles.durationText, duration === 30 && styles.selectedDurationText]}>30 دقيقة</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.durationButton, duration === 60 && styles.selectedDurationBtn]}
              onPress={() => setDuration(60)}
            >
              <Text style={[styles.durationText, duration === 60 && styles.selectedDurationText]}>60 دقيقة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Slots Grid */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>المواعيد المتاحة</Text>
            <View style={[styles.busyBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.busyDot} />
              <Text style={styles.busyText}>{slots.length > 0 ? `${slots.length} وقت متاح` : 'لا يوجد'}</Text>
            </View>
          </View>

          {isLoadingSlots ? (
            <LoadingState label="جاري تحميل الأوقات..." />
          ) : slotsError ? (
            <ErrorState message={slotsError} onRetry={loadAvailability} />
          ) : slots.length === 0 ? (
            <EmptyState title="لا توجد مواعيد متاحة لهذا اليوم" />
          ) : (
            <View style={[styles.timeGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeBox,
                      isSelected && styles.selectedTimeBox,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[
                      styles.timeText,
                      isSelected && styles.selectedTimeText,
                    ]}>
                      {formatTime(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: textAlignment, marginBottom: spacing.md }]}>سبب الزيارة</Text>
          <TextInput
            style={[styles.reasonInput, { textAlign: textAlignment }]}
            placeholder="اكتب سبب الحجز بشكل مختصر..."
            placeholderTextColor={colors.outlineVariant}
            value={reason}
            onChangeText={setReason}
            multiline
          />
        </View>

        {/* Booking Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            (!selectedSlot || isBooking) && styles.disabledBookButton,
          ]}
          disabled={!selectedSlot || isBooking}
          onPress={handleBook}
        >
          <Feather name="check-circle" size={20} color={colors.onPrimary} />
          <Text style={styles.bookButtonText}>
            {isBooking
              ? isRescheduling
                ? 'جاري إعادة الجدولة...'
                : 'جاري تأكيد الحجز...'
              : isRescheduling
                ? 'تأكيد إعادة الجدولة'
                : 'تأكيد الحجز'}
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 64,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(247, 250, 247, 0.8)',
    zIndex: 50,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 56,
    ...typography.bodyLg,
    color: colors.text,
  },
  doctorCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 67, 53, 0.1)',
    ...shadows.soft,
    marginBottom: spacing.xl,
  },
  doctorsList: {
    gap: spacing.md,
  },
  lockedDoctorNotice: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(169, 241, 217, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  lockedDoctorNoticeText: {
    ...typography.bodySm,
    color: colors.primary,
    flex: 1,
  },
  selectedDoctorCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedDoctorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(169, 241, 217, 0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  selectedDoctorHintText: {
    ...typography.bodySm,
    color: colors.primary,
    flex: 1,
  },
  doctorImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(169, 241, 217, 0.3)',
    overflow: 'hidden',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 4,
  },
  doctorSpecialty: {
    ...typography.bodySm,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  ratingBadge: {
    backgroundColor: 'rgba(0, 109, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    gap: 4,
    alignItems: 'center',
  },
  ratingText: {
    ...typography.labelCaps,
    color: colors.secondary,
  },
  reviewsText: {
    ...typography.labelCaps,
    color: colors.outline,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleSm,
    color: colors.primary,
  },
  monthText: {
    ...typography.bodySm,
    color: colors.secondary,
    fontWeight: '500',
  },
  datesContainer: {
    gap: spacing.md,
  },
  dateBox: {
    minWidth: 64,
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.soft,
  },
  dayText: {
    ...typography.labelCaps,
    color: colors.outline,
    marginBottom: spacing.xs,
  },
  selectedDayText: {
    color: colors.onPrimary,
    opacity: 0.8,
  },
  dateText: {
    ...typography.headlineMd,
    color: colors.text,
  },
  selectedDateText: {
    color: colors.onPrimary,
  },
  durationContainer: {
    gap: spacing.md,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    alignItems: 'center',
  },
  selectedDurationBtn: {
    backgroundColor: 'rgba(169, 241, 217, 0.3)', // primary-fixed/30
    borderColor: 'rgba(0, 67, 53, 0.2)',
  },
  durationText: {
    ...typography.bodySm,
    color: colors.textLight,
  },
  selectedDurationText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  busyBadge: {
    backgroundColor: 'rgba(255, 218, 214, 0.4)',
    borderColor: 'rgba(186, 26, 26, 0.1)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignItems: 'center',
    gap: 6,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  busyText: {
    ...typography.labelCaps,
    color: colors.error,
  },
  timeGrid: {
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  timeBox: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    alignItems: 'center',
  },
  selectedTimeBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.soft,
  },
  timeText: {
    ...typography.bodyLg,
    color: colors.textLight,
  },
  selectedTimeText: {
    color: colors.onPrimary,
  },
  reasonInput: {
    minHeight: 96,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.3)',
    padding: spacing.md,
    ...typography.bodyLg,
    color: colors.text,
    textAlignVertical: 'top',
  },
  bookButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.soft,
    marginTop: spacing.md,
  },
  bookButtonText: {
    ...typography.titleSm,
    color: colors.onPrimary,
  },
  disabledBookButton: {
    opacity: 0.5,
  },
});
