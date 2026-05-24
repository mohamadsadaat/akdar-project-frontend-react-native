import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, I18nManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';

export default function BookAppointmentScreen() {
  const router = useRouter();
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';

  const [selectedDate, setSelectedDate] = useState(16);
  const [duration, setDuration] = useState(30);
  const [selectedTime, setSelectedTime] = useState('11:15');

  const dates = [
    { day: 'السبت', date: 14 },
    { day: 'الأحد', date: 15 },
    { day: 'الاثنين', date: 16 },
    { day: 'الثلاثاء', date: 17 },
    { day: 'الأربعاء', date: 18 },
  ];

  const timeSlots = [
    { time: '09:00', status: 'available' },
    { time: '10:30', status: 'available' },
    { time: '11:15', status: 'available' },
    { time: '12:00', status: 'disabled' },
    { time: '02:30', status: 'available' },
    { time: '04:00', status: 'available' },
  ];

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حجز موعد جديد</Text>
        <View style={{ width: 28 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.outline} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, { textAlign: textAlignment }]} 
            placeholder="ابحث عن طبيب أو تخصص..."
            placeholderTextColor={colors.outlineVariant}
          />
        </View>

        {/* Doctor Info Card */}
        <View style={[styles.doctorCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.doctorImageContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtpr2lXZ1BqkcrDhl9T21EqWDOKRohbuzRblmAfNJ8O5XX8aCtW_nQdXy1PLwJKfL5zvX0cYyGiyEMQydl4iKTFAt_MhNAvxJ3u927Ekh6cEYRceAvAtM1hMufSCAf-TorI2eL17J0wWmJwO2HCC9_1gRIlLRxCcGKW8fRGYwpbb0KvztpoRN2LtnVoJ3_1EPREVqLO1oLljLGtDnvSznEidOnSmpyX_KriqS_5enY2KTC8Ebv-4aPg_vGKtYmnWxm4WBwOBLUfFg-' }} 
              style={styles.doctorImage} 
            />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={[styles.doctorName, { textAlign: textAlignment }]}>د. سارة الأحمد</Text>
            <Text style={[styles.doctorSpecialty, { textAlign: textAlignment }]}>استشاري أمراض القلب والأوعية الدموية</Text>
            <View style={[styles.ratingContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.ratingBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Feather name="star" size={14} color={colors.secondary} />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
              <Text style={styles.reviewsText}>120+ تقييم</Text>
            </View>
          </View>
        </View>

        {/* Modern Calendar Picker */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.sectionTitle}>اختر التاريخ</Text>
            <Text style={styles.monthText}>أكتوبر 2023</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.datesContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {dates.map((item) => {
              const isSelected = selectedDate === item.date;
              return (
                <TouchableOpacity
                  key={item.date}
                  style={[styles.dateBox, isSelected && styles.selectedDateBox]}
                  onPress={() => setSelectedDate(item.date)}
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
              <Text style={styles.busyText}>مكتظ تقريباً</Text>
            </View>
          </View>
          <View style={[styles.timeGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isDisabled = slot.status === 'disabled';
              return (
                <TouchableOpacity
                  key={slot.time}
                  disabled={isDisabled}
                  style={[
                    styles.timeBox,
                    isSelected && styles.selectedTimeBox,
                    isDisabled && styles.disabledTimeBox
                  ]}
                  onPress={() => setSelectedTime(slot.time)}
                >
                  <Text style={[
                    styles.timeText,
                    isSelected && styles.selectedTimeText,
                    isDisabled && styles.disabledTimeText
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Booking Button */}
        <TouchableOpacity style={[styles.bookButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Feather name="check-circle" size={20} color={colors.onPrimary} />
          <Text style={styles.bookButtonText}>تأكيد الحجز</Text>
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
  disabledTimeBox: {
    opacity: 0.4,
  },
  timeText: {
    ...typography.bodyLg,
    color: colors.textLight,
  },
  selectedTimeText: {
    color: colors.onPrimary,
  },
  disabledTimeText: {
    color: colors.outline,
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
});
