'use client';

import type { LoginRequest, RegisterRequest } from '@repo/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

export function useLoginMutation() {
  const router = useRouter();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (response) => {
      // Update Zustand store
      login(response.data.user.email, 'password'); // You need to store password? Better design below
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const { register: zustandRegister } = useAuthStore();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (response) => {
      // Zustand handles the registration and auto-login
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error.message);
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      router.push('/');
    },
  });
}

export function useAuth() {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  return {
    user,
    isAuthenticated,
    /** @deprecated Use isInitializing */
    isLoading: isInitializing,
    isInitializing,
  };
}