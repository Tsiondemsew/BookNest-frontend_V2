import { useAdminAuthStore } from '@/stores/authStore';

export async function bootstrapAuth(): Promise<void> {
  await useAdminAuthStore.getState().initializeAuth();
}
