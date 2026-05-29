'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, BookOpen, Headphones, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@repo/types';
import { useAuthStore } from '@/stores/authStore';
import { useCart } from '@/features/cart/hooks/useCart';
import { checkoutApi } from '@/lib/api/client';
import { apiClient } from '@/lib/api/client';

interface BookFormat {
  id: string;
  format_type: 'PDF' | 'Audio';
  price: number;
  currency: string;
  book: {
    id: string;
    title: string;
    author_name: string;
    cover_image_url: string;
  };
}

type CheckoutMode = 'single' | 'formats' | 'cart';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading: cartLoading } = useCart();

  const [mode, setMode] = useState<CheckoutMode | null>(null);
  const [bookFormat, setBookFormat] = useState<BookFormat | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<BookFormat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);
  const [bookFormatId, setBookFormatId] = useState<string | null>(null);
  const [bookFormatIds, setBookFormatIds] = useState<string[]>([]);
  const [fromCart, setFromCart] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    setBookFormatId(params.get('book_format_id'));
    const idsParam = params.get('book_format_ids');
    setBookFormatIds(
      idsParam
        ? idsParam.split(',').map((id) => id.trim()).filter(Boolean)
        : []
    );
    setFromCart(params.get('from_cart') === '1');
    setQueryReady(true);
  }, []);

  useEffect(() => {
    if (!queryReady) return;

    if (!isAuthenticated) {
      router.push(
        '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search)
      );
      return;
    }

    if (fromCart) {
      setMode('cart');
      setIsLoading(false);
      return;
    }

    if (bookFormatIds.length > 0) {
      setMode('formats');

      const fetchFormats = async () => {
        try {
          const results = await Promise.all(
            bookFormatIds.map((id) =>
              apiClient.get<{ success: boolean; data: BookFormat }>(`/api/books/formats/${id}`)
            )
          );
          setSelectedFormats(results.map((r) => r.data));
        } catch {
          setError('Failed to load book details');
        } finally {
          setIsLoading(false);
        }
      };

      fetchFormats();
      return;
    }

    if (bookFormatId) {
      setMode('single');

      const fetchBookFormat = async () => {
        try {
          const response = await apiClient.get<{ success: boolean; data: BookFormat }>(
            `/api/books/formats/${bookFormatId}`
          );
          setBookFormat(response.data);
        } catch {
          setError('Failed to load book details');
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookFormat();
      return;
    }

    setIsLoading(false);
    setError('No book selected');
  }, [queryReady, bookFormatId, bookFormatIds, fromCart, isAuthenticated, router]);

  const cartItems: CartItem[] = cart?.items ?? [];
  const cartTotal = cart?.total ?? 0;

  const directFormats = mode === 'single' && bookFormat ? [bookFormat] : selectedFormats;
  const directTotal = directFormats.reduce((sum, f) => sum + Number(f.price || 0), 0);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let payload;

      if (mode === 'cart') {
        payload = { from_cart: true as const };
      } else if (mode === 'formats' && selectedFormats.length > 0) {
        payload = { book_format_ids: selectedFormats.map((f) => f.id) };
      } else if (mode === 'single' && bookFormat) {
        payload = { book_format_id: bookFormat.id };
      } else {
        throw new Error('Nothing to checkout');
      }

      const response = await checkoutApi.initializeCheckout(payload);

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading || (mode === 'cart' && cartLoading)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Loader2 size={32} className="animate-spin mx-auto text-[#B85C38]" />
        <p className="mt-4 text-[#4A5568]">Loading checkout...</p>
      </div>
    );
  }

  if (mode === 'cart' && (!cartItems.length || cartTotal <= 0)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <ShoppingBag size={48} className="mx-auto text-[#4A5568] mb-4" />
        <p className="text-[#4A5568] mb-4">Your cart is empty. Add books before checkout.</p>
        <Link href="/cart" className="text-[#B85C38] hover:text-[#8E735B] transition-colors">
          ← Back to cart
        </Link>
      </div>
    );
  }

  if ((mode === 'single' || mode === 'formats') && (error || directFormats.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-red-500">{error || 'No item selected for checkout.'}</p>
        <Link href="/market" className="inline-block mt-4 text-[#B85C38] hover:text-[#8E735B] transition-colors">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const total = mode === 'cart' ? cartTotal : directTotal;
  const currency =
    mode === 'cart'
      ? cartItems[0]?.book_format?.currency || 'ETB'
      : directFormats[0]?.currency || 'ETB';
  const backHref =
    mode === 'cart'
      ? '/cart'
      : `/market/${directFormats[0]?.book.id}`;
  const backLabel = mode === 'cart' ? 'Back to Cart' : 'Back to Book';
  const itemCount = mode === 'cart' ? cartItems.length : directFormats.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href={backHref} className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#B85C38] transition-colors mb-4">
          <ArrowLeft size={18} />
          {backLabel}
        </Link>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">
          {mode === 'cart' ? 'Checkout your cart' : 'Complete Your Purchase'}
        </h1>
        <p className="text-[#4A5568] mt-1">
          {mode === 'cart'
            ? `${itemCount} item${itemCount > 1 ? 's' : ''} • one payment via Chapa`
            : `${itemCount} format${itemCount > 1 ? 's' : ''} • one payment via Chapa`}
        </p>
        {mode !== 'cart' && (
          <p className="text-sm text-[#4A5568] mt-2">
            Only the items shown below are included — not other books in your cart.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
            <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Order Summary</h2>

            <div className="space-y-4 pb-4 border-b border-[#E8E2D9]">
              {mode === 'cart'
                ? cartItems.map((item) => <CartLineItem key={item.id} item={item} />)
                : directFormats.map((format) => (
                    <DirectLineItem key={format.id} bookFormat={format} />
                  ))}
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#4A5568]">Subtotal</span>
                <span className="text-[#1A2A3A]">{total.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4A5568]">Tax</span>
                <span className="text-[#1A2A3A]">0.00 {currency}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E8E2D9]">
                <span className="text-[#1A2A3A]">Total</span>
                <span className="text-[#2C3E50]">{total.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Payment Method</h2>

            <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg mb-4">
              <CreditCard size={18} className="text-[#B85C38]" />
              <span className="text-sm font-medium text-[#1A2A3A]">Chapa Payment Gateway</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay {total.toFixed(2)} {currency}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#4A5568]">
              <ShieldCheck size={14} />
              <span>Secure payment • SSL Encrypted</span>
            </div>

            <p className="text-xs text-[#4A5568] text-center mt-4 pt-3 border-t border-[#E8E2D9]">
              You will be redirected to Chapa to complete your payment securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartLineItem({ item }: { item: CartItem }) {
  const book = item.book_format?.book;
  const formatType = item.book_format?.format_type;
  const price = item.book_format?.price ?? 0;

  return (
    <div className="flex gap-4">
      <img
        src={book?.cover_image_url || '/placeholder-book.jpg'}
        alt={book?.title || 'Book'}
        className="w-16 h-22 object-cover rounded-lg shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[#1A2A3A] truncate">{book?.title}</h3>
        <p className="text-sm text-[#4A5568]">{book?.author_name}</p>
        <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md mt-1">
          {formatType === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
          {formatType}
        </span>
      </div>
      <p className="font-bold text-[#2C3E50] shrink-0">{price.toFixed(2)} ETB</p>
    </div>
  );
}

function DirectLineItem({ bookFormat }: { bookFormat: BookFormat }) {
  return (
    <div className="flex gap-4">
      <img
        src={bookFormat.book.cover_image_url}
        alt={bookFormat.book.title}
        className="w-20 h-28 object-cover rounded-lg shadow-sm"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-[#1A2A3A]">{bookFormat.book.title}</h3>
        <p className="text-sm text-[#4A5568] mt-0.5">{bookFormat.book.author_name}</p>
        <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md mt-2">
          {bookFormat.format_type === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
          {bookFormat.format_type}
        </span>
        <p className="font-bold text-[#2C3E50] mt-2">
          {bookFormat.price} {bookFormat.currency || 'ETB'}
        </p>
      </div>
    </div>
  );
}
