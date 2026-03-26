'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UnauthorizedError } from '@repo/api-client';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../services/api/types';
import { authApi } from '../../services/api/auth';
import { useAuthStore } from '@/stores/authStore';

const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMeQuery() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: !isHydrated && !user,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.isFetched) return;

    if (query.data?.user) {
      setUser(query.data.user);
    } else if (query.error instanceof UnauthorizedError) {
      setUser(null);
    }

    setHydrated(true);
  }, [query.isFetched, query.data, query.error, setUser, setHydrated]);

  return query;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (data: LoginResponse) => {
      setToken(data.token);
      setUser(data.user);
      setHydrated(true);
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (data: RegisterResponse) => {
      setToken(data.token);
      setUser(data.user);
      setHydrated(true);
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

