import type { SellerProfileResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createSellerApi(client: ApiClient) {
  return {
    getSellerProfile: (userId: string) =>
      client.get<SellerProfileResponse>(endpoints.seller.profile(userId)),
  };
}