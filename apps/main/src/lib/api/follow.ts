import { createFollowApi } from '@repo/api-client';
import { apiClient } from './client';

export const followApi = createFollowApi(apiClient);
