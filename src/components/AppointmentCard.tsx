import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, I18nManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { Card } from './Card';

export interface AppointmentProps {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  image: string;
}

interface AppointmentCardProps {
  appointment: AppointmentProps;
  style?: ViewStyle;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, style }) => {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'confirmed':
        return { text: 'مؤكد', bgColor: 'rgba(0, 109, 55, 0.1)', textColor: colors.secondary };
      case 'pending':
        return { text: 'قيد الانتظار', bgColor: colors.tertiaryFixed, textColor: colors.tertiary };
      case 'completed':
        return { text: 'مكتمل', bgColor: 'rgba(0, 67, 53, 0.1)', textColor: colors.primary };
      case 'cancelled':
        return { text: 'ملغى', bgColor: colors.errorContainer, textColor: colors.error };
      default:
        return { text: '', bgColor: 'transparent', textColor: colors.text };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: appointment.image }} style={styles.image} />
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.doctorName, { textAlign: textAlignment }]}>{appointment.doctor}</Text>
            <View style={[styles.badge, { backgroundColor: statusBadge.bgColor }]}>
              <Text style={[styles.badgeText, { color: statusBadge.textColor }]}>{statusBadge.text}</Text>
            </View>
          </View>
          <Text style={[styles.specialty, { textAlign: textAlignment }]}>{appointment.specialty}</Text>
          
          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <Text style={styles.footerText}>{appointment.date}</Text>
            </View>
            <View style={styles.footerItem}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={styles.footerText}>{appointment.time}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20, // 20px padding
    borderWidth: 1,
    borderColor: 'rgba(0, 67, 53, 0.1)',
    ...shadows.soft,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md, // 16px gap
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  doctorName: {
    ...typography.titleSm,
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginLeft: spacing.sm, // Adds spacing from name in LTR, but we use flex space-between
  },
  badgeText: {
    ...typography.labelCaps,
  },
  specialty: {
    ...typography.bodySm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 201, 195, 0.2)', // outline-variant/20
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.primary,
  },
});
