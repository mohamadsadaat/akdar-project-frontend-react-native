import { Card } from '@/src/components/Card';
import { mockData } from '@/src/data/mockData';
import { colors } from '@/src/theme/colors';
import { shadows } from '@/src/theme/shadows';
import { radius, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { I18nManager, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Extracted TimelineItem component
const TimelineItem = ({ record, isLast, isRTL, textAlignment }: any) => {
  const [expanded, setExpanded] = useState(false);

  const getTagStyle = () => {
    switch (record.type) {
      case 'recent': return { bg: 'rgba(107, 254, 156, 0.3)', text: colors.secondary }; // secondary-container/30
      case 'checkup': return { bg: colors.surfaceContainerHigh, text: colors.outline };
      case 'vaccine': return { bg: colors.surfaceContainerHigh, text: colors.outline };
      default: return { bg: colors.surfaceContainerHigh, text: colors.outline };
    }
  };

  const tagStyle = getTagStyle();
  const IconComponent = ({ name }: { name: any }) => <Feather name={name} size={18} color={colors.onSurfaceVariant} />;

  return (
    <View style={[styles.timelineItem, { paddingRight: isRTL ? 48 : 0, paddingLeft: isRTL ? 0 : 48 }]}>
      {/* Marker */}
      <View style={[
        styles.timelineMarker, 
        isRTL ? { right: 21 } : { left: 21 },
        record.type === 'recent' ? styles.markerRecent : styles.markerNormal
      ]} />
      
      {/* Card */}
      <Card style={[styles.timelineCard, record.type !== 'recent' && { opacity: 0.9 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
              <Text style={[styles.tagText, { color: tagStyle.text }]}>{record.tag}</Text>
            </View>
            <Text style={[styles.recordTitle, { textAlign: textAlignment }]}>{record.title}</Text>
          </View>
          <Text style={styles.recordDate}>{record.date}</Text>
        </View>

        <View style={styles.recordDetails}>
          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <IconComponent name="user" />
            <Text style={[styles.detailText, { textAlign: textAlignment }]}>{record.doctor}</Text>
          </View>
          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <IconComponent name={record.type === 'vaccine' ? "shield" : "map-pin"} />
            <Text style={[styles.detailText, { textAlign: textAlignment }]}>{record.location}</Text>
          </View>
        </View>

        {/* Footer Actions */}
        {(record.hasPrescription || record.hasAttachment) && (
          <View style={[styles.cardFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {record.hasPrescription && (
              <TouchableOpacity style={[styles.actionButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Feather name="file-text" size={20} color={colors.primary} />
                <Text style={styles.actionText}>الوصفة الطبية</Text>
              </TouchableOpacity>
            )}
            
            {record.hasAttachment && (
              <TouchableOpacity style={[styles.attachmentButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Feather name="paperclip" size={14} color={colors.primary} />
                <Text style={styles.attachmentText}>{record.attachmentName}</Text>
              </TouchableOpacity>
            )}

            {record.hasPrescription && (
              <TouchableOpacity 
                style={styles.expandButton}
                onPress={() => setExpanded(!expanded)}
              >
                <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Expanded Content (mock) */}
        {expanded && record.hasPrescription && (
          <View style={styles.expandedContent}>
            <Text style={[styles.detailText, { textAlign: textAlignment, color: colors.text }]}>
              - بانادول أدفانس (500 ملغ) 3 مرات يومياً{'\n'}
              - قطرة أنف محلول ملحي
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
};

export default function HealthRecordScreen() {
  const isRTL = I18nManager.isRTL;
  const textAlignment = isRTL ? 'right' : 'left';
  const router = useRouter();

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
            <Image source={{ uri: mockData.user.avatar }} style={styles.avatar} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.title, { textAlign: textAlignment }]}>السجل الصحي الرقمي</Text>
          <Text style={[styles.subtitle, { textAlign: textAlignment }]}>
            نظرة شاملة على تاريخك الطبي والتشخيصات السابقة بشكل آمن.
          </Text>
        </View>

        {/* Summary Statistics (Bento Style) */}
        <View style={[styles.statsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.statCard}>
            <Feather name="heart" size={24} color={colors.secondary} />
            <Text style={[styles.statLabel, { textAlign: textAlignment }]}>فصيلة الدم</Text>
            <Text style={[styles.statValue, { textAlign: textAlignment }]}>O+ إيجابي</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="alert-triangle" size={24} color={colors.error} />
            <Text style={[styles.statLabel, { textAlign: textAlignment }]}>الحساسية</Text>
            <Text style={[styles.statValue, { textAlign: textAlignment }]}>البنسلين</Text>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          {/* Timeline Line */}
          <View style={[styles.timelineLine, isRTL ? { right: 28 } : { left: 28 }]} />
          
          {mockData.healthRecords.map((record, index) => (
            <TimelineItem 
              key={record.id} 
              record={record} 
              isLast={index === mockData.healthRecords.length - 1}
              isRTL={isRTL}
              textAlignment={textAlignment}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, isRTL ? { left: spacing.containerPadding } : { right: spacing.containerPadding }]}
        onPress={() => router.push('/BookAppointment')}
      >
        <Feather name="plus" size={32} color={colors.onPrimary} />
      </TouchableOpacity>
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
    paddingBottom: 120, // Space for BottomNavBar and FAB
  },
  sectionMargin: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textLight,
  },
  statsContainer: {
    gap: spacing.cardGap,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 92, 74, 0.1)',
    ...shadows.soft,
    gap: spacing.sm,
  },
  statLabel: {
    ...typography.labelCaps,
    color: colors.outline,
  },
  statValue: {
    ...typography.titleSm,
    color: colors.primary,
  },
  timelineSection: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.primary,
    opacity: 0.2, // Simulate gradient simply with opacity for now
  },
  timelineItem: {
    position: 'relative',
    marginBottom: spacing.cardGap,
  },
  timelineMarker: {
    position: 'absolute',
    top: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 10,
  },
  markerRecent: {
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primaryFixed,
    ...shadows.soft,
  },
  markerNormal: {
    backgroundColor: colors.outline,
    borderWidth: 4,
    borderColor: colors.surfaceContainerHighest,
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(10, 92, 74, 0.1)',
    ...shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.DEFAULT,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.labelCaps,
  },
  recordTitle: {
    ...typography.titleSm,
    color: colors.primary,
  },
  recordDate: {
    ...typography.labelCaps,
    color: colors.outline,
  },
  recordDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.bodySm,
    color: colors.textLight,
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 201, 195, 0.2)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: 'bold',
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButton: {
    backgroundColor: 'rgba(169, 241, 217, 0.2)', // primary-fixed/20
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(169, 241, 217, 0.3)',
    alignItems: 'center',
    gap: spacing.xs,
  },
  attachmentText: {
    ...typography.labelCaps,
    color: colors.primary,
  },
  expandedContent: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 201, 195, 0.1)',
  },
  fab: {
    position: 'absolute',
    bottom: 112,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
    zIndex: 50,
  },
});
