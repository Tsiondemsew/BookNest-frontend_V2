import type { ApiConfig } from '@repo/api-client';

/** Same as main app — calls Railway/Express directly; auth cookie is on the API host. */
export const apiConfig: ApiConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:5000',
  credentials: 'include',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};
