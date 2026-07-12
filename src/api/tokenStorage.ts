import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'akdar.authToken';
const SESSION_TYPE_KEY = 'akdar.sessionType';

let cachedToken: string | null | undefined;
let cachedSessionType: 'patient' | 'dashboard' | null | undefined;
const memoryStorage: Record<string, string | undefined> = {};

const getWebStorage = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
};

export async function getAuthToken() {
  if (cachedToken !== undefined) {
    return cachedToken;
  }

  const webStorage = getWebStorage();
  if (webStorage) {
    cachedToken = webStorage.getItem(TOKEN_KEY);
    return cachedToken;
  }

  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = memoryStorage[TOKEN_KEY] ?? null;
  }

  return cachedToken;
}

export async function setAuthToken(token: string) {
  cachedToken = token;

  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(TOKEN_KEY, token);
    return;
  }

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    memoryStorage[TOKEN_KEY] = token;
  }
}

export async function getSessionType() {
  if (cachedSessionType !== undefined) {
    return cachedSessionType;
  }

  const webStorage = getWebStorage();
  if (webStorage) {
    const value = webStorage.getItem(SESSION_TYPE_KEY);
    cachedSessionType = value === 'dashboard' || value === 'patient' ? value : null;
    return cachedSessionType;
  }

  try {
    const value = await SecureStore.getItemAsync(SESSION_TYPE_KEY);
    cachedSessionType = value === 'dashboard' || value === 'patient' ? value : null;
  } catch {
    const value = memoryStorage[SESSION_TYPE_KEY];
    cachedSessionType = value === 'dashboard' || value === 'patient' ? value : null;
  }

  return cachedSessionType;
}

export async function setSessionType(type: 'patient' | 'dashboard') {
  cachedSessionType = type;

  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(SESSION_TYPE_KEY, type);
    return;
  }

  try {
    await SecureStore.setItemAsync(SESSION_TYPE_KEY, type);
  } catch {
    memoryStorage[SESSION_TYPE_KEY] = type;
  }
}

export async function clearAuthToken() {
  cachedToken = null;
  cachedSessionType = null;

  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(TOKEN_KEY);
    webStorage.removeItem(SESSION_TYPE_KEY);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(SESSION_TYPE_KEY);
  } catch {
    delete memoryStorage[TOKEN_KEY];
    delete memoryStorage[SESSION_TYPE_KEY];
  }
}
