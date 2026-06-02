import {
  ApiClient,
  createAuthApi,
  createAdminApi,
  UnauthorizedError,
} from '@repo/api-client';
import { apiConfig } from './config';

export const apiClient = new ApiClient(apiConfig);
export const authApi = createAuthApi(apiClient);
export const adminApi = createAdminApi(apiClient);

export { UnauthorizedError };
