import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { ApiAppointment } from '@/src/api/types';
import { getApiErrorMessage } from '@/src/api/client';
import {
  AdminOverview,
  AdminUser,
  Catalogs,
  dashboardApi,
  DoctorOverview,
  DoctorSchedule,
  PatientDetails,
} from '@/src/api/dashboard';
import { colors } from '@/src/theme/colors';

type TabKey = 'overview' | 'appointments' | 'patients' | 'schedule' | 'admin';

const statusLabels: Record<string, string> = {
  pending: 'بانتظار الموافقة',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغى',
  no_show: 'لم يحضر',
};

const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function formatDate(value?: string | null) {
  if (!value) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ComponentProps<typeof Feather>['name'] }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.iconBubble}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={24} color={colors.outline} />
      <Text style={styles.emptyText}>{title}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGood = status === 'confirmed' || status === 'completed';
  const isBad = status === 'cancelled' || status === 'no_show';
  return (
    <View style={[styles.badge, isGood && styles.badgeGood, isBad && styles.badgeBad]}>
      <Text style={[styles.badgeText, isGood && styles.badgeGoodText, isBad && styles.badgeBadText]}>
        {statusLabels[status] ?? status}
      </Text>
    </View>
  );
}

function AppointmentRow({
  appointment,
  mode,
  onStatus,
  onPatient,
  onReschedule,
}: {
  appointment: ApiAppointment;
  mode: 'doctor' | 'admin';
  onStatus?: (appointment: ApiAppointment, status: 'confirmed' | 'completed' | 'cancelled' | 'no_show') => void;
  onPatient?: (appointment: ApiAppointment) => void;
  onReschedule?: (appointment: ApiAppointment) => void;
}) {
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableMainCell}>
        <Text style={styles.rowTitle}>{appointment.patient?.name ?? appointment.doctor?.name ?? 'مستخدم غير محدد'}</Text>
        <Text style={styles.rowMeta}>
          {mode === 'admin' ? appointment.doctor?.name ?? 'بدون مدرب' : appointment.patient?.patient_number ?? 'بدون ملف'} · {formatDate(appointment.starts_at)}
        </Text>
      </View>
      <StatusBadge status={appointment.status} />
      <View style={styles.rowActions}>
        {mode === 'doctor' && appointment.patient && (
          <Pressable style={styles.iconButton} onPress={() => onPatient?.(appointment)}>
            <Feather name="folder" size={17} color={colors.primary} />
          </Pressable>
        )}
        {mode === 'doctor' && appointment.status === 'pending' && (
          <Pressable style={styles.actionButton} onPress={() => onStatus?.(appointment, 'confirmed')}>
            <Text style={styles.actionText}>قبول</Text>
          </Pressable>
        )}
        {mode === 'doctor' && ['pending', 'confirmed'].includes(appointment.status) && (
          <Pressable style={styles.actionButtonSecondary} onPress={() => onReschedule?.(appointment)}>
            <Text style={styles.actionTextSecondary}>إعادة جدولة</Text>
          </Pressable>
        )}
        {mode === 'doctor' && appointment.status === 'confirmed' && (
          <Pressable style={styles.actionButton} onPress={() => onStatus?.(appointment, 'completed')}>
            <Text style={styles.actionText}>إنهاء</Text>
          </Pressable>
        )}
        {mode === 'doctor' && !['completed', 'cancelled', 'no_show'].includes(appointment.status) && (
          <Pressable style={styles.dangerButton} onPress={() => onStatus?.(appointment, 'cancelled')}>
            <Text style={styles.dangerText}>إلغاء</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { isAuthenticated, isLoading, user, loginDashboard, logout } = useAuth();
  const [login, setLogin] = useState('admin@akdar.test');
  const [password, setPassword] = useState('Password123!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorOverview, setDoctorOverview] = useState<DoctorOverview | null>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<ApiAppointment[]>([]);
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<ApiAppointment[]>([]);
  const [adminDoctors, setAdminDoctors] = useState<(DoctorOverview['doctor'] & { user?: unknown })[]>([]);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [supportHint, setSupportHint] = useState<string>('');

  const isDashboardUser = user?.role === 'doctor' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const tabs = useMemo(() => {
    const base: { key: TabKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
      { key: 'overview', label: 'نظرة عامة', icon: 'grid' },
      { key: 'appointments', label: 'المواعيد', icon: 'calendar' },
    ];

    if (isDoctor) {
      base.push({ key: 'patients', label: 'ملفات المتدربين', icon: 'users' });
      base.push({ key: 'schedule', label: 'الدوام', icon: 'clock' });
    }

    if (isAdmin) {
      base.push({ key: 'admin', label: 'الإدارة', icon: 'settings' });
    }

    return base;
  }, [isAdmin, isDoctor]);

  const loadDashboard = useCallback(async () => {
    if (!isDashboardUser) return;

    setLoading(true);
    setError(null);

    try {
      if (isDoctor) {
        const [overview, appointments, nextSchedule] = await Promise.all([
          dashboardApi.getDoctorOverview(),
          dashboardApi.getDoctorAppointments('all'),
          dashboardApi.getDoctorSchedule(),
        ]);
        setDoctorOverview(overview);
        setDoctorAppointments(appointments.data);
        setSchedule(nextSchedule);
      }

      if (isAdmin) {
        const [overview, users, appointments, doctors, nextCatalogs, support] = await Promise.all([
          dashboardApi.getAdminOverview(),
          dashboardApi.getAdminUsers(),
          dashboardApi.getAdminAppointments(),
          dashboardApi.getAdminDoctors(),
          dashboardApi.getCatalogs(),
          dashboardApi.getSupportSummary(),
        ]);
        setAdminOverview(overview);
        setAdminUsers(users.data);
        setAdminAppointments(appointments.data);
        setAdminDoctors(doctors.data);
        setCatalogs(nextCatalogs);
        setSupportHint(support.audit_log_hint);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isDashboardUser, isDoctor]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginDashboard({ login: login.trim(), password });
    } catch (e) {
      setLoginError(getApiErrorMessage(e));
    }
  };

  const updateAppointmentStatus = async (
    appointment: ApiAppointment,
    status: 'confirmed' | 'completed' | 'cancelled' | 'no_show',
  ) => {
    try {
      await dashboardApi.updateDoctorAppointmentStatus(appointment.id, {
        status,
        reason: status === 'cancelled' ? 'تم الإلغاء من لوحة المدرب' : undefined,
        session_notes: status === 'completed' ? 'تمت الجلسة وتسجيلها من لوحة المدرب.' : undefined,
        plan: status === 'completed' ? 'متابعة الالتزام بالخطة الحالية حتى الجلسة القادمة.' : undefined,
      });
      await loadDashboard();
    } catch (e) {
      Alert.alert('تعذر التحديث', getApiErrorMessage(e));
    }
  };

  const rescheduleAppointment = async (appointment: ApiAppointment) => {
    try {
      let nextSlot: string | null = null;
      const searchFrom = new Date();

      for (let offset = 1; offset <= 14; offset += 1) {
        const date = new Date(searchFrom);
        date.setDate(searchFrom.getDate() + offset);
        const availability = await dashboardApi.getDoctorAvailability(
          toDateParam(date),
          appointment.duration_minutes,
          appointment.id,
        );

        if (availability.slots.length > 0) {
          nextSlot = availability.slots[0];
          break;
        }
      }

      if (!nextSlot) {
        Alert.alert('لا يوجد وقت متاح', 'لم يتم العثور على وقت متاح خلال الأسبوعين القادمين.');
        return;
      }

      await dashboardApi.rescheduleDoctorAppointment(appointment.id, {
        starts_at: nextSlot,
        duration_minutes: appointment.duration_minutes,
        reason: 'إعادة جدولة من لوحة المدرب',
      });
      await loadDashboard();
    } catch (e) {
      Alert.alert('تعذر إعادة الجدولة', getApiErrorMessage(e));
    }
  };

  const openPatient = async (appointment: ApiAppointment) => {
    if (!appointment.patient) return;
    setTab('patients');
    setLoading(true);

    try {
      setSelectedPatient(await dashboardApi.getPatientDetails(appointment.patient.id));
    } catch (e) {
      Alert.alert('تعذر فتح الملف', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (target: AdminUser, status: 'active' | 'suspended') => {
    try {
      await dashboardApi.updateAdminUser(target.id, { status });
      await loadDashboard();
    } catch (e) {
      Alert.alert('تعذر تحديث المستخدم', getApiErrorMessage(e));
    }
  };

  const toggleDoctor = async (doctorId: number, active: boolean) => {
    try {
      await dashboardApi.updateAdminDoctor(doctorId, { is_active: !active });
      await loadDashboard();
    } catch (e) {
      Alert.alert('تعذر تحديث الطبيب', getApiErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !isDashboardUser) {
    return (
      <View style={styles.loginShell}>
        <View style={styles.loginPanel}>
          <Text style={styles.brand}>أخضر</Text>
          <Text style={styles.loginTitle}>لوحة المدرب والإدارة</Text>
          <TextInput
            value={login}
            onChangeText={setLogin}
            placeholder="البريد أو رقم الهاتف"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="كلمة المرور"
            style={styles.input}
            secureTextEntry
          />
          {loginError && <Text style={styles.errorText}>{loginError}</Text>}
          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>دخول الداشبورد</Text>
          </Pressable>
          <Text style={styles.helperText}>حسابات التجربة: admin@akdar.test أو sara@akdar.test، كلمة المرور Password123!</Text>
        </View>
      </View>
    );
  }

  const overviewStats = isAdmin ? adminOverview?.stats : doctorOverview?.stats;
  const appointments = isAdmin ? adminAppointments : doctorAppointments;

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <Text style={styles.brandSmall}>أخضر</Text>
        <Text style={styles.roleLabel}>{isAdmin ? 'لوحة الإدارة' : 'لوحة المدرب'}</Text>
        <View style={styles.navList}>
          {tabs.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.navItem, tab === item.key && styles.navItemActive]}
              onPress={() => setTab(item.key)}
            >
              <Feather name={item.icon} size={18} color={tab === item.key ? colors.onPrimary : colors.primary} />
              <Text style={[styles.navText, tab === item.key && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.logout} onPress={() => void logout()}>
          <Feather name="log-out" size={18} color={colors.error} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.pageTitle}>{tab === 'overview' ? 'نظرة تشغيلية' : tabs.find((item) => item.key === tab)?.label}</Text>
            <Text style={styles.pageSubtitle}>{user.name} · {user.email}</Text>
          </View>
          <Pressable style={styles.refreshButton} onPress={() => void loadDashboard()}>
            <Feather name="refresh-cw" size={17} color={colors.primary} />
            <Text style={styles.refreshText}>تحديث</Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingStrip}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل بيانات الداشبورد...</Text>
          </View>
        )}
        {error && <Text style={styles.errorBanner}>{error}</Text>}

        {tab === 'overview' && (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="مواعيد اليوم" value={overviewStats?.today ?? overviewStats?.appointments ?? 0} icon="calendar" />
              <StatCard label="بانتظار الموافقة" value={overviewStats?.pending ?? overviewStats?.pending_appointments ?? 0} icon="clock" />
              <StatCard label="مكتملة" value={overviewStats?.completed ?? overviewStats?.completed_appointments ?? 0} icon="check-circle" />
              <StatCard label={isAdmin ? 'مستخدمين' : 'متدربين نشطين'} value={overviewStats?.users ?? overviewStats?.active_patients ?? 0} icon="users" />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isAdmin ? 'آخر المواعيد' : 'المواعيد القادمة'}</Text>
              {(isAdmin ? adminOverview?.recent_appointments : doctorOverview?.next_appointments)?.length ? (
                (isAdmin ? adminOverview?.recent_appointments : doctorOverview?.next_appointments)?.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    mode={isAdmin ? 'admin' : 'doctor'}
                    onStatus={updateAppointmentStatus}
                    onPatient={openPatient}
                    onReschedule={rescheduleAppointment}
                  />
                ))
              ) : (
                <EmptyState title="لا توجد مواعيد حالياً" />
              )}
            </View>
          </>
        )}

        {tab === 'appointments' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isAdmin ? 'كل المواعيد' : 'مواعيدي'}</Text>
            {appointments.length ? (
              appointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  mode={isAdmin ? 'admin' : 'doctor'}
                  onStatus={updateAppointmentStatus}
                  onPatient={openPatient}
                  onReschedule={rescheduleAppointment}
                />
              ))
            ) : (
              <EmptyState title="لا توجد مواعيد مطابقة" />
            )}
          </View>
        )}

        {tab === 'patients' && isDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملف المتدرّب/المريض</Text>
            {!selectedPatient ? (
              <EmptyState title="افتح ملفاً من زر المجلد بجانب أي موعد" />
            ) : (
              <>
                <View style={styles.profileHeader}>
                  <View>
                    <Text style={styles.rowTitle}>{selectedPatient.patient.name}</Text>
                    <Text style={styles.rowMeta}>{selectedPatient.patient.patient_number} · {selectedPatient.patient.phone}</Text>
                  </View>
                  <StatusBadge status={`${selectedPatient.appointments.length} مواعيد`} />
                </View>
                <View style={styles.miniGrid}>
                  <StatCard label="فصيلة الدم" value={selectedPatient.patient.blood_type ?? 'غير محدد'} icon="droplet" />
                  <StatCard label="الطول" value={selectedPatient.patient.height_cm ? `${selectedPatient.patient.height_cm} سم` : 'غير محدد'} icon="bar-chart-2" />
                  <StatCard label="الوزن" value={selectedPatient.patient.weight_kg ? `${selectedPatient.patient.weight_kg} كغ` : 'غير محدد'} icon="activity" />
                </View>
                <Text style={styles.subsectionTitle}>السجل الطبي</Text>
                {selectedPatient.records.length ? selectedPatient.records.map((record) => (
                  <View style={styles.noteRow} key={record.id}>
                    <Text style={styles.rowTitle}>{record.title}</Text>
                    <Text style={styles.rowMeta}>{record.diagnosis ?? record.notes ?? 'بدون ملاحظات'}</Text>
                  </View>
                )) : <EmptyState title="لا توجد سجلات لهذا المدرب بعد" />}
              </>
            )}
          </View>
        )}

        {tab === 'schedule' && isDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الدوام والإجازات</Text>
            {schedule?.rules.length ? schedule.rules.map((rule) => (
              <View style={styles.tableRow} key={rule.id}>
                <View>
                  <Text style={styles.rowTitle}>{weekdays[rule.weekday]}</Text>
                  <Text style={styles.rowMeta}>{rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)} · كل {rule.slot_duration_minutes} دقيقة</Text>
                </View>
              </View>
            )) : <EmptyState title="لم يتم إعداد الدوام بعد" />}
            <Text style={styles.subsectionTitle}>الإجازات القادمة</Text>
            {schedule?.time_offs.length ? schedule.time_offs.map((timeOff) => (
              <View style={styles.noteRow} key={timeOff.id}>
                <Text style={styles.rowTitle}>{formatDate(timeOff.starts_at)} - {formatDate(timeOff.ends_at)}</Text>
                <Text style={styles.rowMeta}>{timeOff.reason ?? 'بدون سبب'}</Text>
              </View>
            )) : <EmptyState title="لا توجد إجازات قادمة" />}
          </View>
        )}

        {tab === 'admin' && isAdmin && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>إدارة المستخدمين</Text>
              {adminUsers.map((target) => (
                <View style={styles.tableRow} key={target.id}>
                  <View style={styles.tableMainCell}>
                    <Text style={styles.rowTitle}>{target.name}</Text>
                    <Text style={styles.rowMeta}>{target.email} · {target.role} · {target.status}</Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable style={styles.actionButtonSecondary} onPress={() => void updateUserStatus(target, 'active')}>
                      <Text style={styles.actionTextSecondary}>تفعيل</Text>
                    </Pressable>
                    <Pressable style={styles.dangerButton} onPress={() => void updateUserStatus(target, 'suspended')}>
                      <Text style={styles.dangerText}>إيقاف</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>المدربون/الأطباء</Text>
              {adminDoctors.map((doctor) => (
                <View style={styles.tableRow} key={doctor.id}>
                  <View style={styles.tableMainCell}>
                    <Text style={styles.rowTitle}>{doctor.name}</Text>
                    <Text style={styles.rowMeta}>{doctor.specialty?.name_ar ?? 'بدون اختصاص'} · {doctor.is_active ? 'فعّال' : 'متوقف'}</Text>
                  </View>
                  <Pressable style={styles.actionButtonSecondary} onPress={() => void toggleDoctor(doctor.id, doctor.is_active)}>
                    <Text style={styles.actionTextSecondary}>{doctor.is_active ? 'إيقاف' : 'تفعيل'}</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الاختصاصات والدعم</Text>
              <Text style={styles.rowMeta}>
                الاختصاصات: {catalogs?.specialties.map((item) => item.name_ar).join('، ') || 'غير متاح'}
              </Text>
              <Text style={styles.rowMeta}>Audit Log: {supportHint}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loginShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loginPanel: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 14,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  loginTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceContainerLow,
    textAlign: 'right',
    color: colors.text,
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  helperText: {
    color: colors.outline,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  shell: {
    flex: 1,
    flexDirection: 'row-reverse',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 260,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: 20,
    gap: 18,
  },
  brandSmall: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  roleLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  navList: {
    gap: 8,
    flex: 1,
  },
  navItem: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navText: {
    color: colors.primary,
    fontWeight: '700',
  },
  navTextActive: {
    color: colors.onPrimary,
  },
  logout: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 24,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  pageSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
  },
  refreshButton: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
  },
  refreshText: {
    color: colors.primary,
    fontWeight: '700',
  },
  loadingStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  errorBanner: {
    color: colors.error,
    backgroundColor: colors.errorContainer,
    padding: 12,
    borderRadius: 8,
    textAlign: 'right',
  },
  errorText: {
    color: colors.error,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    minWidth: 180,
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'right',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
    marginTop: 8,
  },
  tableRow: {
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  tableMainCell: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
  },
  rowMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badge: {
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeGood: {
    backgroundColor: colors.secondaryContainer,
  },
  badgeGoodText: {
    color: colors.primary,
  },
  badgeBad: {
    backgroundColor: colors.errorContainer,
  },
  badgeBadText: {
    color: colors.error,
  },
  actionButton: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  actionText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  actionButtonSecondary: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  actionTextSecondary: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  dangerButton: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
  },
  dangerText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
  },
  emptyState: {
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  profileHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
  },
  miniGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  noteRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 4,
  },
});
