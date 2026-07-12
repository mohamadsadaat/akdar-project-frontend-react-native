import { apiClient } from './client';
import {
  ApiAppointment,
  ApiDoctor,
  ApiMedicalRecord,
  ApiNotification,
  ApiPrescription,
  ApiSpecialty,
  ApiVitalMeasurement,
  DashboardResponse,
  DataResponse,
  DoctorAvailability,
  PaginatedResponse,
} from './types';

export const patientApi = {
  async getDashboard() {
    const response = await apiClient.get<DataResponse<DashboardResponse>>('/dashboard');
    return response.data.data;
  },

  async getAppointments(scope: 'upcoming' | 'past' = 'upcoming') {
    const response = await apiClient.get<PaginatedResponse<ApiAppointment>>('/appointments', {
      params: { scope, per_page: 30 },
    });
    return response.data;
  },

  async cancelAppointment(id: number | string, cancellationReason?: string) {
    const response = await apiClient.patch<DataResponse<ApiAppointment>>(
      `/appointments/${id}/cancel`,
      { cancellation_reason: cancellationReason },
    );
    return response.data.data;
  },

  async rescheduleAppointment(
    id: number | string,
    payload: { starts_at: string; duration_minutes?: number; reason?: string },
  ) {
    const response = await apiClient.patch<DataResponse<ApiAppointment>>(
      `/appointments/${id}/reschedule`,
      payload,
    );
    return response.data.data;
  },

  async createAppointment(payload: {
    doctor_id: number;
    starts_at: string;
    duration_minutes: number;
    reason?: string;
  }) {
    const response = await apiClient.post<DataResponse<ApiAppointment>>('/appointments', payload);
    return response.data.data;
  },

  async getMedicalRecords() {
    const response = await apiClient.get<PaginatedResponse<ApiMedicalRecord>>('/medical-records', {
      params: { per_page: 30 },
    });
    return response.data;
  },

  async getMedicalRecord(id: number | string) {
    const response = await apiClient.get<DataResponse<ApiMedicalRecord>>(`/medical-records/${id}`);
    return response.data.data;
  },

  async getPrescription(recordId: number | string) {
    const response = await apiClient.get<DataResponse<ApiPrescription>>(
      `/medical-records/${recordId}/prescription`,
    );
    return response.data.data;
  },

  async getNotifications() {
    const response = await apiClient.get<PaginatedResponse<ApiNotification>>('/notifications', {
      params: { per_page: 50 },
    });
    return response.data;
  },

  async markNotificationRead(id: string) {
    const response = await apiClient.patch<DataResponse<ApiNotification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllNotificationsRead() {
    const response = await apiClient.post<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  async getDoctors(params?: { search?: string; specialty_id?: number; per_page?: number }) {
    const response = await apiClient.get<PaginatedResponse<ApiDoctor>>('/doctors', {
      params: { per_page: 20, ...params },
    });
    return response.data;
  },

  async getDoctorAvailability(doctorId: number, date: string, durationMinutes: number) {
    const response = await apiClient.get<DataResponse<DoctorAvailability>>(
      `/doctors/${doctorId}/availability`,
      { params: { date, duration_minutes: durationMinutes } },
    );
    return response.data.data;
  },

  async getSpecialties() {
    const response = await apiClient.get<PaginatedResponse<ApiSpecialty>>('/specialties', {
      params: { per_page: 50 },
    });
    return response.data;
  },

  async getVitalMeasurements(params?: { type?: string; from?: string; to?: string; per_page?: number }) {
    const response = await apiClient.get<PaginatedResponse<ApiVitalMeasurement>>(
      '/vital-measurements',
      { params: { per_page: 30, ...params } },
    );
    return response.data;
  },
};
