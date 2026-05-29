import type { LibraryResponse } from '@repo/types';
// Library types live in @repo/types book module
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createLibraryApi(client: ApiClient) {
  return {
    getLibrary: () => client.get<LibraryResponse>(endpoints.library.list),
    checkPurchase: (bookFormatId: string) =>
      client.get<{ success: boolean; data: { hasPurchased: boolean } }>(
        endpoints.library.check(bookFormatId)
      ),
  };
}
