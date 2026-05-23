import { createProfileApi } from '@repo/api-client';
import { apiClient } from './client';

export const profileApi = createProfileApi(apiClient);

// Re-export types
export type { Profile, PublicProfile, ProfileSettings } from '@repo/types';