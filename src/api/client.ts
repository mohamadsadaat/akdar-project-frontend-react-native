import { AxiosError, create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { clearAuthToken, getAuthToken } from './tokenStorage';

type LaravelErrorBody = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export class ApiError extends Error {
  status?: number;
  fields?: Record<string, string>;
  raw?: unknown;

  constructor(message: string, status?: number, fields?: Record<string, string>, raw?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
    this.raw = raw;
  }
}

const API_PORT = '8001';

type ExpoConstantsWithHost = typeof Constants & {
  expoConfig?: { hostUri?: string } | null;
  manifest?: {
    debuggerHost?: string;
    packagerOpts?: { hostUri?: string };
  } | null;
  manifest2?: {
    extra?: {
      expoClient?: { hostUri?: string };
    };
  } | null;
};

const constants = Constants as ExpoConstantsWithHost;

const getExpoDevHost = () => {
  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost ??
    constants.manifest?.packagerOpts?.hostUri;

  const host = hostUri?.split(':')[0];

  return host ? `http://${host}:${API_PORT}` : undefined;
};

const getWebHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:${API_PORT}`;
  }

  return `http://127.0.0.1:${API_PORT}`;
};

const expoDevHost = getExpoDevHost();

const defaultHost = Platform.select({
  android: expoDevHost ?? `http://10.0.2.2:${API_PORT}`,
  ios: expoDevHost ?? `http://localhost:${API_PORT}`,
  web: getWebHost(),
  default: expoDevHost ?? `http://localhost:${API_PORT}`,
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? `${defaultHost}/api/v1`;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

const flattenValidationErrors = (errors?: LaravelErrorBody['errors']) => {
  if (!errors) {
    return undefined;
  }

  return Object.entries(errors).reduce<Record<string, string>>((acc, [field, value]) => {
    acc[field] = Array.isArray(value) ? value.join('\n') : value;
    return acc;
  }, {});
};

const toApiError = (error: AxiosError<LaravelErrorBody>) => {
  if (error.response) {
    const message = error.response.data?.message ?? 'تعذر تنفيذ الطلب. حاول مرة ثانية.';
    return new ApiError(
      message,
      error.response.status,
      flattenValidationErrors(error.response.data?.errors),
      error.response.data,
    );
  }

  if (error.request) {
    return new ApiError('تعذر الاتصال بالخادم. تأكد من الشبكة ورابط الـ API.');
  }

  return new ApiError(error.message || 'حدث خطأ غير متوقع.');
};

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<LaravelErrorBody>) => {
    if (error.response?.status === 401) {
      await clearAuthToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(toApiError(error));
  },
);

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'حدث خطأ غير متوقع.';
}
