'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, CreditCard, Loader2, Check, BookOpen, Library } from 'lucide-react';
import type { BookFormat } from '@repo/types';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/feedback';
import { useBookPurchaseStatus } from '@/features/books/hooks/useBookPurchaseStatus';
import { buildLoginUrl, checkoutUrlForFormatIds } from '@/lib/auth/pendingAuthAction';

interface BookFormatPurchaseSectionProps {
  formats: BookFormat[];
  bookId: string;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function BookFormatPurchaseSection({ formats, bookId }: BookFormatPurchaseSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isOwnBook, ownedFormatIds, isLoading: statusLoading, isFetched } =
    useBookPurchaseStatus(bookId);

  const availableFormats = useMemo(
    () => formats.filter((f) => f.is_active !== false),
    [formats]
  );

  const purchasableFormats = useMemo(() => {
    if (!isAuthenticated || !isFetched) return availableFormats;
    if (isOwnBook) return [];
    return availableFormats.filter((f) => !ownedFormatIds.includes(f.id));
  }, [availableFormats, isAuthenticated, isFetched, isOwnBook, ownedFormatIds]);

  const allOwned =
    isAuthenticated &&
    isFetched &&
    !isOwnBook &&
    availableFormats.length > 0 &&
    purchasableFormats.length === 0;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const ownedIdsKey = ownedFormatIds.join(',');
  const formatIdsKey = availableFormats.map((f) => f.id).join(',');

  useEffect(() => {
    if (!isFetched && isAuthenticated) return;

    const allowedIds = availableFormats
      .filter((f) => !ownedFormatIds.includes(f.id))
      .map((f) => f.id);

    setSelectedIds((prev) => {
      const allowed = new Set(allowedIds);
      const kept = [...prev].filter((id) => allowed.has(id));
      let next: Set<string>;
      if (kept.length > 0) {
        next = new Set(kept);
      } else if (allowedIds.length === 1) {
        next = new Set([allowedIds[0]]);
      } else {
        next = new Set();
      }

      if (prev.size === next.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });
  }, [isFetched, isAuthenticated, formatIdsKey, ownedIdsKey]);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const selectedFormats = purchasableFormats.filter((f) => selectedIds.has(f.id));
  const total = selectedFormats.reduce((sum, f) => sum + Number(f.price || 0), 0);
  const currency = selectedFormats[0]?.currency || 'ETB';
  const hasSelection = selectedFormats.length > 0;

  const toggleFormat = (formatId: string) => {
    if (ownedFormatIds.includes(formatId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(formatId)) {
        next.delete(formatId);
      } else {
        next.add(formatId);
      }
      return next;
    });
    setJustAdded(false);
  };

  const requireAuth = (action: 'add-to-cart' | 'buy', formatIds: string[]) => {
    if (isAuthenticated) return true;
    router.push(
      buildLoginUrl({
        redirect: `/market/${bookId}`,
        action,
        bookFormatIds: formatIds,
      })
    );
    return false;
  };

  const handleAddToCart = async () => {
    if (!hasSelection) {
      showToast('Select at least one format', 'error');
      return;
    }
    const ids = selectedFormats.map((f) => f.id);
    if (!requireAuth('add-to-cart', ids)) return;

    setIsAddingToCart(true);
    try {
      for (const format of selectedFormats) {
        await addToCart(format.id);
      }
      setJustAdded(true);
      showToast(
        selectedFormats.length === 1
          ? 'Added to cart'
          : `${selectedFormats.length} formats added to cart`,
        'success'
      );
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart';
      showToast(message, 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!hasSelection) {
      showToast('Select at least one format', 'error');
      return;
    }
    const ids = selectedFormats.map((f) => f.id);
    if (!requireAuth('buy', ids)) return;

    router.push(checkoutUrlForFormatIds(ids));
  };

  if (availableFormats.length === 0) {
    return (
      <p className="text-sm text-[#4A5568]">No formats available for purchase yet.</p>
    );
  }

  if (isAuthenticated && statusLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#B85C38]" />
      </div>
    );
  }

  if (isOwnBook) {
    return (
      <div className="rounded-xl border border-[#E8E2D9] bg-[#F5F1EB] p-6 text-center">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#4A5568]" />
        <h4 className="font-semibold text-[#1A2A3A]">This is your book</h4>
        <p className="mt-2 text-sm text-[#4A5568]">
          Authors and publishers cannot purchase their own listings.
        </p>
        <Link
          href="/studio/books"
          className="mt-4 inline-flex text-sm font-medium text-[#B85C38] hover:text-[#8E735B]"
        >
          Manage in Studio →
        </Link>
      </div>
    );
  }

  if (allOwned) {
    return (
      <div className="rounded-xl border border-[#2D6A4F]/30 bg-[#F0FDF4] p-6 text-center">
        <Library className="mx-auto mb-3 h-10 w-10 text-[#2D6A4F]" />
        <h4 className="font-semibold text-[#1A2A3A]">You already own this book</h4>
        <p className="mt-2 text-sm text-[#4A5568]">
          All available formats are in your library.
        </p>
        <Link
          href="/library"
          className="mt-4 inline-flex rounded-lg bg-[#2D6A4F] px-5 py-2 text-sm font-medium text-white hover:bg-[#1B4332]"
        >
          Open in Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#4A5568]">
        {purchasableFormats.length > 1
          ? 'Select formats to purchase. Formats you already own are marked below.'
          : 'Select the format below to continue.'}
      </p>

      <div className="space-y-3">
        {availableFormats.map((format) => {
          const isSelected = selectedIds.has(format.id);
          const isOwned = isAuthenticated && ownedFormatIds.includes(format.id);
          const canSelect = !isOwned && purchasableFormats.some((f) => f.id === format.id);

          return (
            <label
              key={format.id}
              className={`flex items-start gap-4 rounded-xl border p-5 transition-all ${
                isOwned
                  ? 'cursor-default border-[#2D6A4F]/40 bg-[#F0FDF4] opacity-90'
                  : isSelected
                    ? 'cursor-pointer border-[#B85C38] bg-[#FDFBF7] shadow-sm ring-1 ring-[#B85C38]/30'
                    : canSelect
                      ? 'cursor-pointer border-[#E8E2D9] bg-white hover:border-[#8E735B]/40'
                      : 'cursor-not-allowed border-[#E8E2D9] bg-[#F5F1EB] opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={!canSelect}
                onChange={() => toggleFormat(format.id)}
                className="mt-1 h-4 w-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38] disabled:opacity-50"
              />
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl" aria-hidden>
                    {format.format_type === 'PDF' ? '📖' : '🎧'}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1A2A3A]">
                        {format.format_type === 'PDF' ? 'eBook (PDF)' : 'Audiobook'}
                      </span>
                      {isOwned && (
                        <span className="rounded-md bg-[#2D6A4F] px-2 py-0.5 text-xs font-medium text-white">
                          Owned
                        </span>
                      )}
                    </div>
                    {format.format_type === 'PDF' && format.page_count != null && (
                      <div className="text-sm text-[#4A5568]">{format.page_count} pages</div>
                    )}
                    {format.format_type === 'Audio' && format.duration_sec != null && (
                      <div className="text-sm text-[#4A5568]">
                        {formatDuration(format.duration_sec)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-[#2C3E50] sm:text-right">
                  {format.price} {format.currency || 'ETB'}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {purchasableFormats.length > 0 && (
        <div className="rounded-xl border border-[#E8E2D9] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-[#4A5568]">
              {hasSelection
                ? `${selectedFormats.length} format${selectedFormats.length > 1 ? 's' : ''} selected`
                : 'No format selected'}
            </span>
            <span className="text-2xl font-bold text-[#2C3E50]">
              {hasSelection ? `${total.toFixed(2)} ${currency}` : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!hasSelection || isAddingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#B85C38] bg-white px-5 py-3 text-sm font-medium text-[#B85C38] transition-colors hover:bg-[#FDFBF7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingToCart ? (
                <Loader2 size={18} className="animate-spin" />
              ) : justAdded ? (
                <Check size={18} />
              ) : (
                <ShoppingCart size={18} />
              )}
              {justAdded ? 'Added!' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!hasSelection || isAddingToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#B85C38] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8E735B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={18} />
              Buy now
            </button>
          </div>

          {purchasableFormats.length > 1 && hasSelection && (
            <p className="mt-3 text-xs text-[#4A5568]">
              Buy now checks out only your selected format
              {selectedFormats.length > 1 ? 's' : ''} in one payment — other items in your cart are
              not included.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
