import { useEffect, useState } from 'react';
import { ApiClient, apiConfig } from '@repo/api-client';

export interface ApprovalItem {
  id: number;
  title: string;
  author: string;
  status: string;
  createdAt: string;
}

export function useRecentApprovals() {
  const [data, setData] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const client = new ApiClient(apiConfig);

        const response = await client.request(
          '/api/admin/dashboard/approvals'
        );

        setData((response as any).data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  return { data, loading };
}