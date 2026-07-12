import { apiClient } from './client';
import { AuthPayload, AuthResponse, DataResponse } from './types';

export type LoginRequest = {
  login: string;
  password: string;
  device_name?: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  accepted_terms: boolean;
  terms_version?: string;
};

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      device_name: 'react-native',
      ...payload,
    });

    return response.data;
  },

  async dashboardLogin(payload: LoginRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/dashboard-login', {
      device_name: 'web-dashboard',
      ...payload,
    });

    return response.data;
  },

  async register(payload: RegisterRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async me() {
    const response = await apiClient.get<DataResponse<AuthPayload>>('/me');
    return response.data.data;
  },

  async dashboardMe() {
    const response = await apiClient.get<DataResponse<AuthPayload>>('/dashboard/me');
    return response.data.data;
  },
};
