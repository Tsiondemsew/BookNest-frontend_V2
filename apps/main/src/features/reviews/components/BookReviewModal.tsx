'use client';

import { useState, useEffect } from 'react';
import { reviewsApi } from '@/lib/api/client';
import { markBookReviewSubmitted } from '@/lib/reader/reviewPrompt';
import { X, Star } from 'lucide-react';

interface BookReviewModalProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function BookReviewModal({ bookId, bookTitle, onClose, onSubmitted }: BookReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await reviewsApi.canReview(bookId);
        if (cancelled) return;
        if (res.data?.existing_review || !res.data?.can_review) {
          setAlreadyReviewed(true);
          if (res.data?.existing_review) {
            markBookReviewSubmitted(bookId);
          }
        }
      } catch {
        /* allow submit attempt; server enforces one review */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyReviewed) return;
    setSubmitting(true);
    setError(null);
    try {
      await reviewsApi.createReview(bookId, { rating, body: body.trim() || undefined });
      markBookReviewSubmitted(bookId);
      onSubmitted?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      if (message.toLowerCase().includes('already reviewed')) {
        markBookReviewSubmitted(bookId);
        setAlreadyReviewed(true);
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A2A3A]">Review this book</h2>
            <p className="text-sm text-[#4A5568]">{bookTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#4A5568] hover:text-[#1A2A3A]">
            <X size={20} />
          </button>
        </div>

        {checking ? (
          <p className="text-sm text-[#4A5568] py-4">Checking review status…</p>
        ) : alreadyReviewed ? (
          <div className="space-y-4">
            <p className="text-sm text-[#1A2A3A]">
              You already reviewed this book. Each reader can leave one review per book.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1A2A3A] block mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="p-1"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      size={28}
                      className={n <= rating ? 'fill-[#B85C38] text-[#B85C38]' : 'text-[#E8E2D9]'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2A3A] block mb-2">
                Your review (optional)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full border border-[#E8E2D9] rounded-lg p-3 text-sm"
                placeholder="Share your thoughts..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-[#E8E2D9] rounded-lg text-[#4A5568]"
              >
                Later
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
