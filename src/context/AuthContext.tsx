import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, LoginRequest, RegisterRequest } from '../api/auth';
import { ApiProfile, ApiUser } from '../api/types';
import { setUnauthorizedHandler } from '../api/client';
import { clearAuthToken, getAuthToken, getSessionType, setAuthToken, setSessionType } from '../api/tokenStorage';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ApiUser | null;
  profile: ApiProfile | null;
  login: (credentials: LoginRequest) => Promise<void>;
  loginDashboard: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  const clearSession = useCallback(async () => {
    await clearAuthToken();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  const applyAuthPayload = useCallback((nextUser: ApiUser, nextProfile: ApiProfile | null) => {
    setUser(nextUser);
    setProfile(nextProfile);
    setIsAuthenticated(true);
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        await clearSession();
        return;
      }

      const sessionType = await getSessionType();

      if (sessionType === 'dashboard') {
        const payload = await authApi.dashboardMe();
        applyAuthPayload(payload.user, payload.profile);
        return;
      }

      try {
        const payload = await authApi.me();
        applyAuthPayload(payload.user, payload.profile);
      } catch {
        const payload = await authApi.dashboardMe();
        await setSessionType('dashboard');
        applyAuthPayload(payload.user, payload.profile);
      }
    } catch {
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthPayload, clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });

    void refreshSession();

    return () => setUnauthorizedHandler(null);
  }, [clearSession, refreshSession]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(credentials);
      await setAuthToken(response.token);
      await setSessionType('patient');
      applyAuthPayload(response.data.user, response.data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDashboard = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const response = await authApi.dashboardLogin(credentials);
      await setAuthToken(response.token);
      await setSessionType('dashboard');
      applyAuthPayload(response.data.user, response.data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    setIsLoading(true);

    try {
      const response = await authApi.register(payload);
      await setAuthToken(response.token);
      await setSessionType('patient');
      applyAuthPayload(response.data.user, response.data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const token = await getAuthToken();
      if (token) {
        await authApi.logout();
      }
    } catch {
      // Local logout should still complete if the server token is already invalid.
    } finally {
      await clearSession();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        profile,
        login,
        loginDashboard,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
