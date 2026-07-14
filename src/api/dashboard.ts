import { apiClient } from './client';
import {
  ApiAppointment,
  ApiDoctor,
  ApiPatientSummary,
  ApiUser,
  DataResponse,
  DoctorAvailability,
  PaginatedResponse,
} from './types';


export type DashboardStats = Record<string, number>;

export type DoctorOverview = {
  doctor: ApiDoctor;
  stats: DashboardStats;
  next_appointments: ApiAppointment[];
};

export type AdminOverview = {
  stats: DashboardStats;
  recent_appointments: ApiAppointment[];
};

export type PatientDetails = {
  patient: ApiPatientSummary;
  allergies: { id: number; name: string; reaction: string | null; severity: string | null }[];
  appointments: ApiAppointment[];
  records: {
    id: number;
    recorded_at: string;
    type: string;
    title: string;
    diagnosis: string | null;
    notes: string | null;
  }[];
  vitals: { id: number; type: string; value: number; unit: string; measured_at: string }[];
};

export type DoctorSchedule = {
  rules: {
    id: number;
    weekday: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
  }[];
  time_offs: {
    id: number;
    starts_at: string;
    ends_at: string;
    reason: string | null;
  }[];
};

export type AdminUser = ApiUser & {
  patient_profile?: unknown;
  doctor?: ApiDoctor | null;
};
export type CreateSpecialtyPayload = {
  name_ar: string;
  description?: string;
};

export type CreateFacilityPayload = {
  name: string;
  type: string;
  address?: string;
  phone?: string;
};

export type Catalogs = {
  specialties: { id: number; name_ar: string; description: string | null }[];
  facilities: { id: number; name: string; type: string; address: string | null; phone: string | null; location: string | null }[];
};

export type CreateAdminDoctorPayload = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  specialty_id: number;
  facility_id: number;
  bio?: string;
  is_active?: boolean;
};

export const dashboardApi = {
  async getDoctorOverview() {
    const response = await apiClient.get<DataResponse<DoctorOverview>>('/doctor-dashboard/overview');
    return response.data.data;

  },
  async createSpecialty(payload: CreateSpecialtyPayload) {
    const response = await apiClient.post<DataResponse<{ id: number; name_ar: string; description: string | null }>>('/admin-dashboard/specialties', payload);
    return response.data.data;
  },

  async createFacility(payload: CreateFacilityPayload) {
    const response = await apiClient.post<DataResponse<{ id: number; name: string; type: string; address: string | null; phone: string | null; location: string | null }>>('/admin-dashboard/facilities', payload);
    return response.data.data;
  },

  async getDoctorAppointments(scope: 'today' | 'upcoming' | 'past' | 'all' = 'upcoming') {
    const response = await apiClient.get<PaginatedResponse<ApiAppointment>>('/doctor-dashboard/appointments', {
      params: { scope, per_page: 50 },
    });
    return response.data;
  },

  async updateDoctorAppointmentStatus(
    id: number,
    payload: { status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'; reason?: string; session_notes?: string; diagnosis?: string; plan?: string },
  ) {
    const response = await apiClient.patch<DataResponse<ApiAppointment>>(
      `/doctor-dashboard/appointments/${id}/status`,
      payload,
    );
    return response.data.data;
  },

  async rescheduleDoctorAppointment(id: number, payload: { starts_at: string; duration_minutes?: number; reason?: string }) {
    const response = await apiClient.patch<DataResponse<ApiAppointment>>(
      `/doctor-dashboard/appointments/${id}/reschedule`,
      payload,
    );
    return response.data.data;
  },

  async getDoctorAvailability(date: string, durationMinutes: number, appointmentId?: number) {
    const response = await apiClient.get<DataResponse<DoctorAvailability>>('/doctor-dashboard/availability', {
      params: {
        date,
        duration_minutes: durationMinutes,
        appointment_id: appointmentId,
      },
    });
    return response.data.data;
  },

  async getPatientDetails(patientId: number) {
    const response = await apiClient.get<DataResponse<PatientDetails>>(`/doctor-dashboard/patients/${patientId}`);
    return response.data.data;
  },

  async getDoctorSchedule() {
    const response = await apiClient.get<DataResponse<DoctorSchedule>>('/doctor-dashboard/schedule');
    return response.data.data;
  },

  async getAdminOverview() {
    const response = await apiClient.get<DataResponse<AdminOverview>>('/admin-dashboard/overview');
    return response.data.data;
  },

  async getAdminUsers() {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin-dashboard/users', {
      params: { per_page: 50 },
    });
    return response.data;
  },

  async updateAdminUser(id: number, payload: { status?: 'active' | 'inactive' | 'suspended'; role?: 'patient' | 'doctor' | 'admin' }) {
    const response = await apiClient.patch<DataResponse<ApiUser>>(`/admin-dashboard/users/${id}`, payload);
    return response.data.data;
  },

  async getAdminAppointments() {
    const response = await apiClient.get<PaginatedResponse<ApiAppointment>>('/admin-dashboard/appointments', {
      params: { per_page: 50 },
    });
    return response.data;
  },

  async getAdminDoctors() {
    const response = await apiClient.get<PaginatedResponse<ApiDoctor & { user?: ApiUser | null }>>('/admin-dashboard/doctors', {
      params: { per_page: 50 },
    });
    return response.data;
  },

  async createAdminDoctor(payload: CreateAdminDoctorPayload) {
    const response = await apiClient.post<DataResponse<ApiDoctor & { user?: ApiUser | null }>>('/admin-dashboard/doctors', payload);
    return response.data.data;
  },

  async updateAdminDoctor(id: number, payload: { is_active?: boolean; bio?: string; full_name?: string }) {
    const response = await apiClient.patch<DataResponse<ApiDoctor>>(`/admin-dashboard/doctors/${id}`, payload);
    return response.data.data;
  },

  async getCatalogs() {
    const response = await apiClient.get<DataResponse<Catalogs>>('/admin-dashboard/catalogs');
    return response.data.data;
  },

  async getSupportSummary() {
    const response = await apiClient.get<DataResponse<{
      open_tickets: number;
      faq_items: { question: string; answer: string }[];
      audit_log_hint: string;
    }>>('/admin-dashboard/support');
    return response.data.data;
  },
};
