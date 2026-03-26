'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, initializeAuth } from '@/stores/authStore';
import { authApi } from '@/services/api/auth';
import type { LoginRequest, RegisterRequest } from '@/services/api/types';

/**
 * useAuth - Hook for authentication operations
 * 
 * Provides access to:
 * - Current user and auth state
 * - Login/register/logout functions
 * - Auth status checks
 */
export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // Set user and update store
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const logout = useAuthStore((state) => state.logout);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setLoading(true);
      try {
        const response = await authApi.login(credentials);
        setUser(response.user);
        router.push('/dashboard');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, setError, router]
  );

  const register = useCallback(
    async (credentials: RegisterRequest) => {
      setLoading(true);
      try {
        const response = await authApi.register(credentials);
        setUser(response.user);
        router.push('/dashboard');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setUser, setError, router]
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
      logout();
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, logout, setError, router]);

  return {
    user,
    isAuthenticated,
    isHydrated,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    refetch: initializeAuth,
  };
}
