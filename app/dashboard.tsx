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
import { ApiAppointment, ApiPatientSummary } from '@/src/api/types';
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

type AdminDoctorForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialty_id: string;
  facility_id: string;
  bio: string;
};

type AdminSpecialtyForm = {
  name_ar: string;
  description: string;
};

type AdminFacilityForm = {
  name: string;
  type: string;
  address: string;
  phone: string;
  location: string;
};

type AppointmentForm = {
  patient_id: string;
  starts_at: string;
  duration_minutes: string;
  status: 'pending' | 'confirmed';
  reason: string;
};

type ScheduleRuleForm = {
  weekday: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: string;
};

type TimeOffForm = {
  starts_at: string;
  ends_at: string;
  reason: string;
};

type PatientRecordForm = {
  type: 'visit' | 'checkup' | 'vaccine';
  title: string;
  diagnosis: string;
  notes: string;
};

type PatientVitalForm = {
  type: string;
  value: string;
  unit: string;
};

type PatientProfileForm = {
  blood_type: string;
};

const emptyDoctorForm: AdminDoctorForm = {
  name: '',
  email: '',
  phone: '',
  password: 'Password123!',
  specialty_id: '',
  facility_id: '',
  bio: '',
};

const emptySpecialtyForm: AdminSpecialtyForm = {
  name_ar: '',
  description: '',
};

const emptyFacilityForm: AdminFacilityForm = {
  name: '',
  type: '',
  address: '',
  phone: '',
  location: '',
};

const emptyAppointmentForm: AppointmentForm = {
  patient_id: '',
  starts_at: '',
  duration_minutes: '30',
  status: 'confirmed',
  reason: '',
};

const emptyScheduleRuleForm: ScheduleRuleForm = {
  weekday: '0',
  start_time: '09:00',
  end_time: '15:00',
  slot_duration_minutes: '30',
};

const emptyTimeOffForm: TimeOffForm = {
  starts_at: '',
  ends_at: '',
  reason: '',
};

const emptyPatientRecordForm: PatientRecordForm = {
  type: 'visit',
  title: '',
  diagnosis: '',
  notes: '',
};

const emptyPatientVitalForm: PatientVitalForm = {
  type: '',
  value: '',
  unit: '',
};

const emptyPatientProfileForm: PatientProfileForm = {
  blood_type: '',
};

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const vitalTypeOptions = [
  { label: 'الطول', type: 'height', unit: 'cm' },
  { label: 'الوزن', type: 'weight', unit: 'kg' },
  { label: 'النبض', type: 'heart_rate', unit: 'bpm' },
  { label: 'ضغط الدم', type: 'blood_pressure', unit: 'mmHg' },
];

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

function toDateTimeInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizeDateTime(value: string) {
  return value.trim().replace(' ', 'T');
}

function latestVital(
  patient: PatientDetails | null,
  aliases: string[],
) {
  if (!patient) return null;

  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());

  return patient.vitals.find((vital) => normalizedAliases.includes(vital.type.toLowerCase())) ?? null;
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
  const [doctorPatients, setDoctorPatients] = useState<ApiPatientSummary[]>([]);
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<ApiAppointment[]>([]);
  const [adminDoctors, setAdminDoctors] = useState<(DoctorOverview['doctor'] & { user?: unknown })[]>([]);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [supportHint, setSupportHint] = useState<string>('');
  const [doctorForm, setDoctorForm] = useState<AdminDoctorForm>(emptyDoctorForm);
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [specialtyForm, setSpecialtyForm] = useState<AdminSpecialtyForm>(emptySpecialtyForm);
  const [facilityForm, setFacilityForm] = useState<AdminFacilityForm>(emptyFacilityForm);
  const [isCreatingSpecialty, setIsCreatingSpecialty] = useState(false);
  const [isCreatingFacility, setIsCreatingFacility] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(9, 0, 0, 0);
    return { ...emptyAppointmentForm, starts_at: toDateTimeInput(nextDate) };
  });
  const [scheduleRuleForm, setScheduleRuleForm] = useState<ScheduleRuleForm>(emptyScheduleRuleForm);
  const [timeOffForm, setTimeOffForm] = useState<TimeOffForm>(emptyTimeOffForm);
  const [patientRecordForm, setPatientRecordForm] = useState<PatientRecordForm>(emptyPatientRecordForm);
  const [patientVitalForm, setPatientVitalForm] = useState<PatientVitalForm>(emptyPatientVitalForm);
  const [patientProfileForm, setPatientProfileForm] = useState<PatientProfileForm>(emptyPatientProfileForm);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [isCreatingTimeOff, setIsCreatingTimeOff] = useState(false);
  const [isCreatingPatientRecord, setIsCreatingPatientRecord] = useState(false);
  const [isCreatingPatientVital, setIsCreatingPatientVital] = useState(false);
  const [isUpdatingPatientProfile, setIsUpdatingPatientProfile] = useState(false);

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
        const [overview, appointments, nextSchedule, patients] = await Promise.all([
          dashboardApi.getDoctorOverview(),
          dashboardApi.getDoctorAppointments('all'),
          dashboardApi.getDoctorSchedule(),
          dashboardApi.getDoctorPatients(),
        ]);
        setDoctorOverview(overview);
        setDoctorAppointments(appointments.data);
        setSchedule(nextSchedule);
        setDoctorPatients(patients);
        setAppointmentForm((current) => ({
          ...current,
          patient_id: current.patient_id || String(patients[0]?.id ?? ''),
        }));
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
        setDoctorForm((current) => ({
          ...current,
          specialty_id: current.specialty_id || String(nextCatalogs.specialties[0]?.id ?? ''),
          facility_id: current.facility_id || String(nextCatalogs.facilities[0]?.id ?? ''),
        }));
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

  const createAppointment = async () => {
    const patientId = Number(appointmentForm.patient_id);
    const duration = Number(appointmentForm.duration_minutes);

    if (!patientId || !appointmentForm.starts_at.trim() || !duration) {
      Alert.alert('بيانات ناقصة', 'اختر مريضاً وحدد وقت الموعد ومدته.');
      return;
    }

    setIsCreatingAppointment(true);

    try {
      await dashboardApi.createDoctorAppointment({
        patient_id: patientId,
        starts_at: normalizeDateTime(appointmentForm.starts_at),
        duration_minutes: duration,
        status: appointmentForm.status,
        reason: appointmentForm.reason.trim() || undefined,
      });

      setAppointmentForm((current) => ({ ...emptyAppointmentForm, patient_id: current.patient_id, starts_at: current.starts_at }));
      await loadDashboard();
      Alert.alert('تمت الإضافة', 'تم إنشاء الموعد وإضافته إلى جدولك.');
    } catch (e) {
      Alert.alert('تعذرت إضافة الموعد', getApiErrorMessage(e));
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const addScheduleRule = async () => {
    const weekday = Number(scheduleRuleForm.weekday);
    const duration = Number(scheduleRuleForm.slot_duration_minutes);

    if (!scheduleRuleForm.start_time || !scheduleRuleForm.end_time || !duration) {
      Alert.alert('بيانات ناقصة', 'حدد بداية الدوام ونهايته ومدة الجلسة.');
      return;
    }

    setIsUpdatingSchedule(true);

    try {
      const currentRules = schedule?.rules.map((rule) => ({
        weekday: rule.weekday,
        start_time: rule.start_time.slice(0, 5),
        end_time: rule.end_time.slice(0, 5),
        slot_duration_minutes: rule.slot_duration_minutes,
      })) ?? [];

      const nextSchedule = await dashboardApi.updateDoctorSchedule({
        rules: [
          ...currentRules,
          {
            weekday,
            start_time: scheduleRuleForm.start_time,
            end_time: scheduleRuleForm.end_time,
            slot_duration_minutes: duration,
          },
        ],
      });

      setSchedule(nextSchedule);
      setScheduleRuleForm(emptyScheduleRuleForm);
      await loadDashboard();
      Alert.alert('تم الحفظ', 'تمت إضافة وقت الدوام.');
    } catch (e) {
      Alert.alert('تعذر حفظ الدوام', getApiErrorMessage(e));
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const createTimeOff = async () => {
    if (!timeOffForm.starts_at.trim() || !timeOffForm.ends_at.trim()) {
      Alert.alert('بيانات ناقصة', 'حدد بداية ونهاية الإجازة.');
      return;
    }

    setIsCreatingTimeOff(true);

    try {
      const nextSchedule = await dashboardApi.createDoctorTimeOff({
        starts_at: normalizeDateTime(timeOffForm.starts_at),
        ends_at: normalizeDateTime(timeOffForm.ends_at),
        reason: timeOffForm.reason.trim() || undefined,
      });

      setSchedule(nextSchedule);
      setTimeOffForm(emptyTimeOffForm);
      await loadDashboard();
      Alert.alert('تم الحفظ', 'تمت إضافة الإجازة.');
    } catch (e) {
      Alert.alert('تعذر حفظ الإجازة', getApiErrorMessage(e));
    } finally {
      setIsCreatingTimeOff(false);
    }
  };

  const refreshSelectedPatient = async () => {
    if (!selectedPatient) return;
    const patient = await dashboardApi.getPatientDetails(selectedPatient.patient.id);
    setSelectedPatient(patient);
    setPatientProfileForm({ blood_type: patient.patient.blood_type ?? '' });
  };

  const createPatientRecord = async () => {
    if (!selectedPatient || !patientRecordForm.title.trim()) {
      Alert.alert('بيانات ناقصة', 'افتح ملف مريض واكتب عنوان السجل.');
      return;
    }

    setIsCreatingPatientRecord(true);

    try {
      await dashboardApi.createPatientRecord(selectedPatient.patient.id, {
        type: patientRecordForm.type,
        title: patientRecordForm.title.trim(),
        diagnosis: patientRecordForm.diagnosis.trim() || undefined,
        notes: patientRecordForm.notes.trim() || undefined,
      });
      setPatientRecordForm(emptyPatientRecordForm);
      await refreshSelectedPatient();
      Alert.alert('تمت الإضافة', 'تمت إضافة بيانات المريض إلى السجل الطبي.');
    } catch (e) {
      Alert.alert('تعذرت إضافة السجل', getApiErrorMessage(e));
    } finally {
      setIsCreatingPatientRecord(false);
    }
  };

  const updatePatientProfile = async () => {
    if (!selectedPatient || !patientProfileForm.blood_type.trim()) {
      Alert.alert('بيانات ناقصة', 'افتح ملف مريض واختر زمرة الدم.');
      return;
    }

    setIsUpdatingPatientProfile(true);

    try {
      await dashboardApi.updatePatientProfile(selectedPatient.patient.id, {
        blood_type: patientProfileForm.blood_type,
      });
      await refreshSelectedPatient();
      Alert.alert('تم الحفظ', 'تم تحديث زمرة الدم.');
    } catch (e) {
      Alert.alert('تعذر تحديث زمرة الدم', getApiErrorMessage(e));
    } finally {
      setIsUpdatingPatientProfile(false);
    }
  };

  const createPatientVital = async () => {
    if (!selectedPatient || !patientVitalForm.type.trim() || !patientVitalForm.value.trim() || !patientVitalForm.unit.trim()) {
      Alert.alert('بيانات ناقصة', 'افتح ملف مريض واكتب نوع القياس والقيمة والوحدة.');
      return;
    }

    setIsCreatingPatientVital(true);

    try {
      await dashboardApi.createPatientVital(selectedPatient.patient.id, {
        type: patientVitalForm.type.trim(),
        value: Number(patientVitalForm.value),
        unit: patientVitalForm.unit.trim(),
      });
      setPatientVitalForm(emptyPatientVitalForm);
      await refreshSelectedPatient();
      Alert.alert('تمت الإضافة', 'تمت إضافة القياس للمريض.');
    } catch (e) {
      Alert.alert('تعذر إضافة القياس', getApiErrorMessage(e));
    } finally {
      setIsCreatingPatientVital(false);
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
      const patient = await dashboardApi.getPatientDetails(appointment.patient.id);
      setSelectedPatient(patient);
      setPatientProfileForm({ blood_type: patient.patient.blood_type ?? '' });
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

  const createSpecialty = async () => {
    if (!specialtyForm.name_ar.trim()) {
      Alert.alert('بيانات ناقصة', 'اكتب اسم الاختصاص قبل الإضافة.');
      return;
    }

    setIsCreatingSpecialty(true);

    try {
      const specialty = await dashboardApi.createSpecialty({
        name_ar: specialtyForm.name_ar.trim(),
        description: specialtyForm.description.trim() || undefined,
      });

      setSpecialtyForm(emptySpecialtyForm);
      await loadDashboard();
      setDoctorForm((current) => ({ ...current, specialty_id: String(specialty.id) }));
      Alert.alert('تمت الإضافة', 'تمت إضافة الاختصاص وأصبح متاحاً لاختيار الطبيب.');
    } catch (e) {
      Alert.alert('تعذرت إضافة الاختصاص', getApiErrorMessage(e));
    } finally {
      setIsCreatingSpecialty(false);
    }
  };

  const createFacility = async () => {
    if (!facilityForm.name.trim() || !facilityForm.type.trim()) {
      Alert.alert('بيانات ناقصة', 'اكتب اسم المركز ونوعه قبل الإضافة.');
      return;
    }

    setIsCreatingFacility(true);

    try {
      const facility = await dashboardApi.createFacility({
        name: facilityForm.name.trim(),
        type: facilityForm.type.trim(),
        address: facilityForm.address.trim() || undefined,
        phone: facilityForm.phone.trim() || undefined,
        location: facilityForm.location.trim() || undefined,
      });

      setFacilityForm(emptyFacilityForm);
      await loadDashboard();
      setDoctorForm((current) => ({ ...current, facility_id: String(facility.id) }));
      Alert.alert('تمت الإضافة', 'تمت إضافة المركز وأصبح متاحاً لاختيار الطبيب.');
    } catch (e) {
      Alert.alert('تعذرت إضافة المركز', getApiErrorMessage(e));
    } finally {
      setIsCreatingFacility(false);
    }
  };

  const createDoctor = async () => {
    const selectedSpecialtyId = Number(doctorForm.specialty_id);
    const selectedFacilityId = Number(doctorForm.facility_id);

    if (!doctorForm.name.trim() || !doctorForm.email.trim() || !doctorForm.phone.trim()) {
      Alert.alert('بيانات ناقصة', 'اكتب الاسم والبريد ورقم الهاتف قبل إضافة الطبيب.');
      return;
    }

    if (!selectedSpecialtyId || !selectedFacilityId) {
      Alert.alert('بيانات ناقصة', 'اختر اختصاصاً ومركزاً للطبيب.');
      return;
    }

    setIsCreatingDoctor(true);

    try {
      await dashboardApi.createAdminDoctor({
        name: doctorForm.name.trim(),
        email: doctorForm.email.trim().toLowerCase(),
        phone: doctorForm.phone.trim(),
        password: doctorForm.password.trim() || undefined,
        specialty_id: selectedSpecialtyId,
        facility_id: selectedFacilityId,
        bio: doctorForm.bio.trim() || undefined,
        is_active: true,
      });

      setDoctorForm({
        ...emptyDoctorForm,
        specialty_id: String(selectedSpecialtyId),
        facility_id: String(selectedFacilityId),
      });
      await loadDashboard();
      Alert.alert('تمت الإضافة', 'تم إنشاء حساب الطبيب وإضافته إلى لوحة الإدارة.');
    } catch (e) {
      Alert.alert('تعذرت إضافة الطبيب', getApiErrorMessage(e));
    } finally {
      setIsCreatingDoctor(false);
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
            {isDoctor && (
              <View style={styles.formPanel}>
                <Text style={styles.subsectionTitle}>إضافة موعد</Text>
                <Text style={styles.formLabel}>المريض</Text>
                <View style={styles.chipRow}>
                  {doctorPatients.map((patient) => (
                    <Pressable
                      key={patient.id}
                      style={[
                        styles.selectionChip,
                        appointmentForm.patient_id === String(patient.id) && styles.selectionChipActive,
                      ]}
                      onPress={() => setAppointmentForm((current) => ({ ...current, patient_id: String(patient.id) }))}
                    >
                      <Text
                        style={[
                          styles.selectionChipText,
                          appointmentForm.patient_id === String(patient.id) && styles.selectionChipTextActive,
                        ]}
                      >
                        {patient.name ?? patient.patient_number}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.doctorFormGrid}>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>وقت الموعد</Text>
                    <TextInput
                      value={appointmentForm.starts_at}
                      onChangeText={(value) => setAppointmentForm((current) => ({ ...current, starts_at: value }))}
                      placeholder="2026-07-15T09:00"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>المدة بالدقائق</Text>
                    <TextInput
                      value={appointmentForm.duration_minutes}
                      onChangeText={(value) => setAppointmentForm((current) => ({ ...current, duration_minutes: value }))}
                      placeholder="30"
                      style={styles.input}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={styles.formLabel}>الحالة</Text>
                <View style={styles.chipRow}>
                  {(['confirmed', 'pending'] as const).map((status) => (
                    <Pressable
                      key={status}
                      style={[styles.selectionChip, appointmentForm.status === status && styles.selectionChipActive]}
                      onPress={() => setAppointmentForm((current) => ({ ...current, status }))}
                    >
                      <Text style={[styles.selectionChipText, appointmentForm.status === status && styles.selectionChipTextActive]}>
                        {status === 'confirmed' ? 'مؤكد' : 'بانتظار الموافقة'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>سبب الزيارة</Text>
                  <TextInput
                    value={appointmentForm.reason}
                    onChangeText={(value) => setAppointmentForm((current) => ({ ...current, reason: value }))}
                    placeholder="سبب مختصر للموعد"
                    style={styles.input}
                  />
                </View>
                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.actionButton, isCreatingAppointment && styles.actionButtonDisabled]}
                    onPress={() => void createAppointment()}
                    disabled={isCreatingAppointment}
                  >
                    <Text style={styles.actionText}>{isCreatingAppointment ? 'جاري الإضافة...' : 'إضافة الموعد'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
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
            ) : (() => {
              const latestHeight = latestVital(selectedPatient, ['height', 'height_cm', 'الطول']);
              const latestWeight = latestVital(selectedPatient, ['weight', 'weight_kg', 'الوزن']);

              return (
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
                  <StatCard label="الطول" value={latestHeight ? `${latestHeight.value} ${latestHeight.unit}` : 'غير محدد'} icon="bar-chart-2" />
                  <StatCard label="الوزن" value={latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : 'غير محدد'} icon="activity" />
                </View>
                <View style={styles.formPanel}>
                  <Text style={styles.subsectionTitle}>إضافة بيانات للمريض</Text>
                  <Text style={styles.formLabel}>زمرة الدم</Text>
                  <View style={styles.chipRow}>
                    {bloodTypes.map((bloodType) => (
                      <Pressable
                        key={bloodType}
                        style={[styles.selectionChip, patientProfileForm.blood_type === bloodType && styles.selectionChipActive]}
                        onPress={() => setPatientProfileForm({ blood_type: bloodType })}
                      >
                        <Text style={[styles.selectionChipText, patientProfileForm.blood_type === bloodType && styles.selectionChipTextActive]}>
                          {bloodType}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.formActions}>
                    <Pressable
                      style={[styles.actionButtonSecondary, isUpdatingPatientProfile && styles.actionButtonDisabled]}
                      onPress={() => void updatePatientProfile()}
                      disabled={isUpdatingPatientProfile}
                    >
                      <Text style={styles.actionTextSecondary}>{isUpdatingPatientProfile ? 'جاري الحفظ...' : 'حفظ زمرة الدم'}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.formLabel}>نوع السجل</Text>
                  <View style={styles.chipRow}>
                    {(['visit', 'checkup', 'vaccine'] as const).map((type) => (
                      <Pressable
                        key={type}
                        style={[styles.selectionChip, patientRecordForm.type === type && styles.selectionChipActive]}
                        onPress={() => setPatientRecordForm((current) => ({ ...current, type }))}
                      >
                        <Text style={[styles.selectionChipText, patientRecordForm.type === type && styles.selectionChipTextActive]}>
                          {type === 'visit' ? 'زيارة' : type === 'checkup' ? 'فحص' : 'لقاح'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.doctorFormGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>عنوان السجل</Text>
                      <TextInput
                        value={patientRecordForm.title}
                        onChangeText={(value) => setPatientRecordForm((current) => ({ ...current, title: value }))}
                        placeholder="مثال: متابعة جلسة"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>التشخيص</Text>
                      <TextInput
                        value={patientRecordForm.diagnosis}
                        onChangeText={(value) => setPatientRecordForm((current) => ({ ...current, diagnosis: value }))}
                        placeholder="تشخيص مختصر"
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>الملاحظات والخطة</Text>
                    <TextInput
                      value={patientRecordForm.notes}
                      onChangeText={(value) => setPatientRecordForm((current) => ({ ...current, notes: value }))}
                      placeholder="ملاحظات الطبيب أو خطة المتابعة"
                      style={[styles.input, styles.multilineInput]}
                      multiline
                    />
                  </View>
                  <View style={styles.formActions}>
                    <Pressable
                      style={[styles.actionButton, isCreatingPatientRecord && styles.actionButtonDisabled]}
                      onPress={() => void createPatientRecord()}
                      disabled={isCreatingPatientRecord}
                    >
                      <Text style={styles.actionText}>{isCreatingPatientRecord ? 'جاري الحفظ...' : 'إضافة سجل طبي'}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.subsectionTitle}>إضافة قياس حيوي</Text>
                  <Text style={styles.formLabel}>نوع القياس</Text>
                  <View style={styles.chipRow}>
                    {vitalTypeOptions.map((option) => (
                      <Pressable
                        key={option.type}
                        style={[styles.selectionChip, patientVitalForm.type === option.type && styles.selectionChipActive]}
                        onPress={() => setPatientVitalForm((current) => ({
                          ...current,
                          type: option.type,
                          unit: option.unit,
                        }))}
                      >
                        <Text style={[styles.selectionChipText, patientVitalForm.type === option.type && styles.selectionChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.doctorFormGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>القيمة</Text>
                      <TextInput
                        value={patientVitalForm.value}
                        onChangeText={(value) => setPatientVitalForm((current) => ({ ...current, value }))}
                        placeholder="72"
                        style={styles.input}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>الوحدة</Text>
                      <TextInput
                        value={patientVitalForm.unit}
                        onChangeText={(value) => setPatientVitalForm((current) => ({ ...current, unit: value }))}
                        placeholder="bpm, kg, mmHg"
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View style={styles.formActions}>
                    <Pressable
                      style={[styles.actionButton, isCreatingPatientVital && styles.actionButtonDisabled]}
                      onPress={() => void createPatientVital()}
                      disabled={isCreatingPatientVital}
                    >
                      <Text style={styles.actionText}>{isCreatingPatientVital ? 'جاري الحفظ...' : 'إضافة القياس'}</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.subsectionTitle}>السجل الطبي</Text>
                {selectedPatient.records.length ? selectedPatient.records.map((record) => (
                  <View style={styles.noteRow} key={record.id}>
                    <Text style={styles.rowTitle}>{record.title}</Text>
                    <Text style={styles.rowMeta}>{record.diagnosis ?? record.notes ?? 'بدون ملاحظات'}</Text>
                  </View>
                )) : <EmptyState title="لا توجد سجلات لهذا المدرب بعد" />}
                <Text style={styles.subsectionTitle}>القياسات الأخيرة</Text>
                {selectedPatient.vitals.length ? selectedPatient.vitals.map((vital) => (
                  <View style={styles.noteRow} key={vital.id}>
                    <Text style={styles.rowTitle}>{vital.type}</Text>
                    <Text style={styles.rowMeta}>{vital.value} {vital.unit} · {formatDate(vital.measured_at)}</Text>
                  </View>
                )) : <EmptyState title="لا توجد قياسات مسجلة لهذا المريض" />}
              </>
              );
            })()}
          </View>
        )}

        {tab === 'schedule' && isDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الدوام والإجازات</Text>
            <View style={styles.formPanel}>
              <Text style={styles.subsectionTitle}>إضافة وقت دوام</Text>
              <Text style={styles.formLabel}>اليوم</Text>
              <View style={styles.chipRow}>
                {weekdays.map((day, index) => (
                  <Pressable
                    key={day}
                    style={[styles.selectionChip, scheduleRuleForm.weekday === String(index) && styles.selectionChipActive]}
                    onPress={() => setScheduleRuleForm((current) => ({ ...current, weekday: String(index) }))}
                  >
                    <Text style={[styles.selectionChipText, scheduleRuleForm.weekday === String(index) && styles.selectionChipTextActive]}>
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.doctorFormGrid}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>من الساعة</Text>
                  <TextInput
                    value={scheduleRuleForm.start_time}
                    onChangeText={(value) => setScheduleRuleForm((current) => ({ ...current, start_time: value }))}
                    placeholder="09:00"
                    style={styles.input}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>إلى الساعة</Text>
                  <TextInput
                    value={scheduleRuleForm.end_time}
                    onChangeText={(value) => setScheduleRuleForm((current) => ({ ...current, end_time: value }))}
                    placeholder="15:00"
                    style={styles.input}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>مدة الجلسة</Text>
                  <TextInput
                    value={scheduleRuleForm.slot_duration_minutes}
                    onChangeText={(value) => setScheduleRuleForm((current) => ({ ...current, slot_duration_minutes: value }))}
                    placeholder="30"
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.formActions}>
                <Pressable
                  style={[styles.actionButton, isUpdatingSchedule && styles.actionButtonDisabled]}
                  onPress={() => void addScheduleRule()}
                  disabled={isUpdatingSchedule}
                >
                  <Text style={styles.actionText}>{isUpdatingSchedule ? 'جاري الحفظ...' : 'إضافة وقت الدوام'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.formPanel}>
              <Text style={styles.subsectionTitle}>إضافة إجازة</Text>
              <View style={styles.doctorFormGrid}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>تبدأ في</Text>
                  <TextInput
                    value={timeOffForm.starts_at}
                    onChangeText={(value) => setTimeOffForm((current) => ({ ...current, starts_at: value }))}
                    placeholder="2026-07-20T09:00"
                    style={styles.input}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>تنتهي في</Text>
                  <TextInput
                    value={timeOffForm.ends_at}
                    onChangeText={(value) => setTimeOffForm((current) => ({ ...current, ends_at: value }))}
                    placeholder="2026-07-20T15:00"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>السبب</Text>
                <TextInput
                  value={timeOffForm.reason}
                  onChangeText={(value) => setTimeOffForm((current) => ({ ...current, reason: value }))}
                  placeholder="سبب الإجازة"
                  style={styles.input}
                />
              </View>
              <View style={styles.formActions}>
                <Pressable
                  style={[styles.actionButton, isCreatingTimeOff && styles.actionButtonDisabled]}
                  onPress={() => void createTimeOff()}
                  disabled={isCreatingTimeOff}
                >
                  <Text style={styles.actionText}>{isCreatingTimeOff ? 'جاري الحفظ...' : 'إضافة الإجازة'}</Text>
                </Pressable>
              </View>
            </View>
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
              <Text style={styles.sectionTitle}>إضافة اختصاص أو مركز</Text>
              <View style={styles.catalogFormGrid}>
                <View style={styles.catalogFormColumn}>
                  <Text style={styles.subsectionTitle}>اختصاص طبي</Text>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>اسم الاختصاص</Text>
                    <TextInput
                      value={specialtyForm.name_ar}
                      onChangeText={(value) => setSpecialtyForm((current) => ({ ...current, name_ar: value }))}
                      placeholder="مثال: العظام"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>الوصف</Text>
                    <TextInput
                      value={specialtyForm.description}
                      onChangeText={(value) => setSpecialtyForm((current) => ({ ...current, description: value }))}
                      placeholder="وصف مختصر للاختصاص"
                      style={[styles.input, styles.multilineInput]}
                      multiline
                    />
                  </View>
                  <Pressable
                    style={[styles.actionButton, isCreatingSpecialty && styles.actionButtonDisabled]}
                    onPress={() => void createSpecialty()}
                    disabled={isCreatingSpecialty}
                  >
                    <Text style={styles.actionText}>{isCreatingSpecialty ? 'جاري الإضافة...' : 'إضافة الاختصاص'}</Text>
                  </Pressable>
                </View>

                <View style={styles.catalogFormColumn}>
                  <Text style={styles.subsectionTitle}>مركز/عيادة</Text>
                  <View style={styles.doctorFormGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>اسم المركز</Text>
                      <TextInput
                        value={facilityForm.name}
                        onChangeText={(value) => setFacilityForm((current) => ({ ...current, name: value }))}
                        placeholder="مثال: مركز أقدر الطبي"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>النوع</Text>
                      <TextInput
                        value={facilityForm.type}
                        onChangeText={(value) => setFacilityForm((current) => ({ ...current, type: value }))}
                        placeholder="عيادة، مستشفى، مركز"
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View style={styles.doctorFormGrid}>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>العنوان</Text>
                      <TextInput
                        value={facilityForm.address}
                        onChangeText={(value) => setFacilityForm((current) => ({ ...current, address: value }))}
                        placeholder="عنوان المركز"
                        style={styles.input}
                      />
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.formLabel}>الهاتف</Text>
                      <TextInput
                        value={facilityForm.phone}
                        onChangeText={(value) => setFacilityForm((current) => ({ ...current, phone: value }))}
                        placeholder="+963110000000"
                        style={styles.input}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>الموقع</Text>
                    <TextInput
                      value={facilityForm.location}
                      onChangeText={(value) => setFacilityForm((current) => ({ ...current, location: value }))}
                      placeholder="إحداثيات أو رابط موقع"
                      style={styles.input}
                    />
                  </View>
                  <Pressable
                    style={[styles.actionButton, isCreatingFacility && styles.actionButtonDisabled]}
                    onPress={() => void createFacility()}
                    disabled={isCreatingFacility}
                  >
                    <Text style={styles.actionText}>{isCreatingFacility ? 'جاري الإضافة...' : 'إضافة المركز'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>إضافة طبيب/مدرب</Text>
              <View style={styles.doctorFormGrid}>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>الاسم الكامل</Text>
                    <TextInput
                      value={doctorForm.name}
                      onChangeText={(value) => setDoctorForm((current) => ({ ...current, name: value }))}
                      placeholder="مثال: د. محمد الخطيب"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>البريد الإلكتروني</Text>
                    <TextInput
                      value={doctorForm.email}
                      onChangeText={(value) => setDoctorForm((current) => ({ ...current, email: value }))}
                      placeholder="doctor@akdar.test"
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>رقم الهاتف</Text>
                    <TextInput
                      value={doctorForm.phone}
                      onChangeText={(value) => setDoctorForm((current) => ({ ...current, phone: value }))}
                      placeholder="+963991234567"
                      style={styles.input}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>كلمة المرور</Text>
                    <TextInput
                      value={doctorForm.password}
                      onChangeText={(value) => setDoctorForm((current) => ({ ...current, password: value }))}
                      placeholder="Password123!"
                      style={styles.input}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>الاختصاص</Text>
                  <View style={styles.chipRow}>
                    {catalogs?.specialties.map((specialty) => (
                      <Pressable
                        key={specialty.id}
                        style={[
                          styles.selectionChip,
                          doctorForm.specialty_id === String(specialty.id) && styles.selectionChipActive,
                        ]}
                        onPress={() => setDoctorForm((current) => ({ ...current, specialty_id: String(specialty.id) }))}
                      >
                        <Text
                          style={[
                            styles.selectionChipText,
                            doctorForm.specialty_id === String(specialty.id) && styles.selectionChipTextActive,
                          ]}
                        >
                          {specialty.name_ar}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>المركز</Text>
                  <View style={styles.chipRow}>
                    {catalogs?.facilities.map((facility) => (
                      <Pressable
                        key={facility.id}
                        style={[
                          styles.selectionChip,
                          doctorForm.facility_id === String(facility.id) && styles.selectionChipActive,
                        ]}
                        onPress={() => setDoctorForm((current) => ({ ...current, facility_id: String(facility.id) }))}
                      >
                        <Text
                          style={[
                            styles.selectionChipText,
                            doctorForm.facility_id === String(facility.id) && styles.selectionChipTextActive,
                          ]}
                        >
                          {facility.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={styles.formLabel}>نبذة مختصرة</Text>
                  <TextInput
                    value={doctorForm.bio}
                    onChangeText={(value) => setDoctorForm((current) => ({ ...current, bio: value }))}
                    placeholder="نبذة تظهر في ملف الطبيب"
                    style={[styles.input, styles.multilineInput]}
                    multiline
                  />
                </View>

                <View style={styles.formActions}>
                  <Pressable
                    style={[styles.actionButton, isCreatingDoctor && styles.actionButtonDisabled]}
                    onPress={() => void createDoctor()}
                    disabled={isCreatingDoctor}
                  >
                    <Text style={styles.actionText}>{isCreatingDoctor ? 'جاري الإضافة...' : 'إضافة الطبيب'}</Text>
                  </Pressable>
                </View>
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
  formPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 12,
  },
  doctorFormGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  catalogFormGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 20,
  },
  catalogFormColumn: {
    minWidth: 320,
    flex: 1,
    gap: 12,
  },
  formField: {
    minWidth: 220,
    flex: 1,
    gap: 6,
  },
  formLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6,
  },
  multilineInput: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionChip: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.secondaryContainer,
  },
  selectionChipText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  selectionChipTextActive: {
    color: colors.primary,
  },
  formActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
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
  actionButtonDisabled: {
    opacity: 0.65,
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
