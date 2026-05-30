import type {
  RequestWithdrawalPayload,
  SellerEarning,
  SellerEarningsSummary,
  SellerWallet,
  WithdrawalRequest,
  SalesReport,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createSellerFinanceApi(client: ApiClient) {
  return {
    getWallet: () =>
      client.get<{ success: boolean; data: SellerWallet }>(endpoints.seller.wallet),
    getEarningsSummary: () =>
      client.get<{ success: boolean; data: SellerEarningsSummary }>(
        endpoints.seller.earningsSummary
      ),
    getEarnings: () =>
      client.get<{ success: boolean; data: SellerEarning[] }>(endpoints.seller.earnings),
    getWithdrawals: () =>
      client.get<{ success: boolean; data: WithdrawalRequest[] }>(
        endpoints.seller.withdrawals
      ),
    requestWithdrawal: (payload: RequestWithdrawalPayload) =>
      client.post<{ success: boolean; data: WithdrawalRequest }, RequestWithdrawalPayload>(
        endpoints.seller.withdrawals,
        payload
      ),
  };
}
