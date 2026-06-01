import type { CheckoutRequest, CheckoutResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createCheckoutApi(client: ApiClient) {
  return {
    initializeCheckout: (data: CheckoutRequest) =>
      client.post<CheckoutResponse, CheckoutRequest>(endpoints.checkout.initialize, data),

    verifyPayment: (tx_ref: string, transaction_id?: string) => {
      let url = `${endpoints.checkout.verify}?tx_ref=${encodeURIComponent(tx_ref)}`;
      if (transaction_id) {
        url += `&transaction_id=${transaction_id}`;
      }
      return client.get<{ success: boolean; data: { verified: boolean; already_processed?: boolean } }>(url);
    },
  };
}