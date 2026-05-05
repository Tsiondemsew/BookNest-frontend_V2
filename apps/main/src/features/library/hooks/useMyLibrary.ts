'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

type LibraryItem = {
  ownershipId: string;
  purchasedAt: string;
  format?: {
    id: string;
    format_type: 'PDF' | 'Audio' | string;
    price?: string | number;
    currency?: string;
    page_count?: number | null;
    duration_sec?: number | null;
  } | null;
  book?: {
    id: string;
    title: string;
    author_name?: string | null;
    publisher_name?: string | null;
    cover_image_url?: string | null;
    description?: string | null;
  } | null;
};

export function useMyLibrary() {
  return useQuery({
    queryKey: ['library', 'my'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: { items: LibraryItem[] } }>(
        '/api/library/my',
      );
      return res.data.items;
    },
  });
}

