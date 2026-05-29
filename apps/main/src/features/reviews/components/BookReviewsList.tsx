'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api/client';
import type { BookReview } from '@repo/types';

const roleLabel: Record<string, string> = {
  reader: 'Reader',
  author: 'Author',
  publisher: 'Publisher',
};

export function BookReviewsList({ bookId }: { bookId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => reviewsApi.listReviews(bookId),
  });

  const reviews = (data?.data || []) as BookReview[];

  if (isLoading) {
    return <p className="text-sm text-[#4A5568]">Loading reviews...</p>;
  }

  if (!reviews.length) {
    return <p className="text-sm text-[#4A5568]">No reviews yet. Complete the book to leave the first one.</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="bg-white border border-[#E8E2D9] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1A2A3A]">{r.user.display_name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F1EB] text-[#4A5568] capitalize">
                {roleLabel[r.reviewer_role] || r.reviewer_role}
              </span>
            </div>
            <span className="text-[#B85C38]">{'★'.repeat(r.rating)}</span>
          </div>
          {r.body && <p className="text-sm text-[#4A5568]">{r.body}</p>}
          <p className="text-xs text-[#4A5568] mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
        </li>
      ))}
    </ul>
  );
}
