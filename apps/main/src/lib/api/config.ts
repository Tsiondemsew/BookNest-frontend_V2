import type { ApiConfig } from '@repo/api-client';

export const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  credentials: 'include',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};