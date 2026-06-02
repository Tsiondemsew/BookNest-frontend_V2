import {
  ApiClient,
  createAuthApi,
  createAdminApi,
} from '@repo/api-client';
import { apiConfig } from './config';
import { getAdminAccessToken } from '@/lib/auth/adminToken';

export const apiClient = new ApiClient(apiConfig);

const _request = apiClient.request.bind(apiClient);
apiClient.request = async (path, options = { method: 'GET' }) => {
  const token = getAdminAccessToken();
  const headers = { ...(options.headers ?? {}) };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  return _request(path, { ...options, headers });
};

export const authApi = createAuthApi(apiClient);
export const adminApi = createAdminApi(apiClient);
