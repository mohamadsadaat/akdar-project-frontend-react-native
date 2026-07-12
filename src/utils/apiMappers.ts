import { AppointmentProps } from '@/src/components/AppointmentCard';
import { ApiAppointment, ApiNotification } from '@/src/api/types';
import { formatDate, formatTime } from './format';

export type NotificationCardData = {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'primary' | 'secondary' | 'tertiary';
  time: string;
  isUnread: boolean;
};

export function appointmentToCard(appointment: ApiAppointment): AppointmentProps {
  return {
    id: String(appointment.id),
    doctorId: appointment.doctor?.id ?? null,
    doctor: appointment.doctor?.name ?? 'طبيب غير محدد',
    specialty: appointment.doctor?.specialty?.name_ar ?? appointment.facility?.name ?? 'تخصص غير محدد',
    date: formatDate(appointment.starts_at),
    time: formatTime(appointment.starts_at),
    startsAt: appointment.starts_at,
    durationMinutes: appointment.duration_minutes,
    reason: appointment.reason,
    status: appointment.status,
    image: appointment.doctor?.avatar_url ?? null,
  };
}

export function notificationToCard(notification: ApiNotification): NotificationCardData {
  const rawType = notification.type.toLowerCase();
  const isAppointment = rawType.includes('appointment');
  const isRecord = rawType.includes('record') || rawType.includes('prescription');

  return {
    id: notification.id,
    title: notification.data.title ?? 'تنبيه جديد',
    message: notification.data.body ?? notification.data.message ?? '',
    icon: isAppointment ? 'calendar' : isRecord ? 'file-text' : 'bell',
    type: isAppointment ? 'tertiary' : isRecord ? 'primary' : 'secondary',
    time: formatDate(notification.created_at, false),
    isUnread: !notification.read_at,
  };
}
