'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, targetRole?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('cv_tracker_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await api.get('/auth/me');
      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setUser(null);
        localStorage.removeItem('cv_tracker_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('cv_tracker_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: loggedInUser, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('cv_tracker_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('cv_tracker_refresh_token', refreshToken);
        }
        setUser(loggedInUser);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed',
      };
    }
  };

  const register = async (name: string, email: string, password: string, targetRole?: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, targetRole });
      if (res.data.success) {
        const { user: newUser, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('cv_tracker_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('cv_tracker_refresh_token', refreshToken);
        }
        setUser(newUser);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('cv_tracker_token');
      localStorage.removeItem('cv_tracker_refresh_token');
      setUser(null);
      router.push('/login');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
