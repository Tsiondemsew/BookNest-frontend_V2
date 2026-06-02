import {
  ApiClient,
  createAuthApi,
  createAdminApi,
  UnauthorizedError,
} from '@repo/api-client';
import { apiConfig } from './config';
import { getAdminAccessToken } from '@/lib/auth/adminToken';
import { refreshAdminSessionIfNeeded } from '@/lib/auth/refreshAdminSession';
import { notifySessionExpired } from '@/lib/auth/sessionExpired';

export const apiClient = new ApiClient(apiConfig);

const _request = apiClient.request.bind(apiClient);

apiClient.request = async (path, options = { method: 'GET' }) => {
  const isAuthRefresh = path.includes('/api/auth/refresh');
  const isLogin = path.includes('/api/auth/admin/login') || path.includes('/api/auth/login');

  if (!isAuthRefresh && !isLogin) {
    const ok = await refreshAdminSessionIfNeeded();
    if (!ok && getAdminAccessToken()) {
      // Had a token but refresh failed — treat as expired
    }
  }

  const token = getAdminAccessToken();
  const headers = { ...(options.headers ?? {}) };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await _request(path, { ...options, headers });
  } catch (error) {
    if (
      error instanceof UnauthorizedError &&
      !isAuthRefresh &&
      !isLogin
    ) {
      const refreshed = await refreshAdminSessionIfNeeded();
      if (refreshed) {
        const retryToken = getAdminAccessToken();
        const retryHeaders = { ...(options.headers ?? {}) };
        if (retryToken) {
          retryHeaders.Authorization = `Bearer ${retryToken}`;
        }
        try {
          return await _request(path, { ...options, headers: retryHeaders });
        } catch (retryError) {
          if (retryError instanceof UnauthorizedError) {
            notifySessionExpired();
          }
          throw retryError;
        }
      }
      notifySessionExpired();
    }
    throw error;
  }
};

export const authApi = createAuthApi(apiClient);
export const adminApi = createAdminApi(apiClient);
