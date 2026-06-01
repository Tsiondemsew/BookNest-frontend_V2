'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose]);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-[#E8E2D9] shadow-2xl w-full sm:max-w-md max-h-[min(90vh,560px)] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[#E8E2D9]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B85C38]">Rate this book</p>
            <h2 id="review-modal-title" className="text-lg font-bold text-[#1A2A3A] bn-serif mt-0.5 line-clamp-2">
              {bookTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2D9] text-[#4A5568] hover:bg-[#F5F1EB] transition-colors"
            aria-label="Close review"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {checking ? (
            <p className="text-sm text-[#4A5568] py-6 text-center">Checking review status…</p>
          ) : alreadyReviewed ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-[#1A2A3A] leading-relaxed">
                You already reviewed this book. Each reader can leave one review per title.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-[#B85C38] text-white rounded-xl text-sm font-semibold hover:bg-[#A04E2F] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-[#1A2A3A] block mb-2">Your rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="p-1 rounded-lg hover:bg-[#F5F1EB] transition-colors"
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={32}
                        className={n <= rating ? 'fill-[#B85C38] text-[#B85C38]' : 'text-[#E8E2D9]'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-body" className="text-sm font-medium text-[#1A2A3A] block mb-2">
                  Review <span className="text-[#4A5568] font-normal">(optional)</span>
                </label>
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full border border-[#E8E2D9] rounded-xl p-3 text-sm text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 resize-none"
                  placeholder="What did you think of this book?"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-[#E8E2D9] rounded-xl text-sm font-medium text-[#4A5568] hover:bg-[#F5F1EB] transition-colors"
                >
                  Not now
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#B85C38] text-white rounded-xl text-sm font-semibold hover:bg-[#A04E2F] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
