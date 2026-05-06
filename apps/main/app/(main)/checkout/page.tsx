'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, BookOpen, Headphones, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [bookFormat, setBookFormat] = useState<BookFormat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookFormatId, setBookFormatId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const formatId = params.get('book_format_id');
    setBookFormatId(formatId);
  }, []);

  useEffect(() => {
    if (bookFormatId === undefined) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (!bookFormatId) {
      setIsLoading(false);
      setError('No book selected');
      return;
    }

    const fetchBookFormat = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: BookFormat }>(
          `/api/books/formats/${bookFormatId}`
        );
        setBookFormat(response.data);
      } catch (err) {
        console.error('Failed to fetch book:', err);
        setError('Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookFormat();
  }, [bookFormatId, isAuthenticated, router]);

  const handlePayment = async () => {
    if (!bookFormat) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<{ success: boolean; data: { checkout_url: string } }>(
        '/api/checkout',
        { book_format_id: bookFormat.id }
      );

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Loader2 size={32} className="animate-spin mx-auto text-[#B85C38]" />
        <p className="mt-4 text-[#4A5568]">Loading checkout...</p>
      </div>
    );
  }

  if (error || !bookFormat) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-red-500">{error || 'No item selected for checkout.'}</p>
        <Link href="/market" className="inline-block mt-4 text-[#B85C38] hover:text-[#8E735B] transition-colors">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/market/${bookFormat.book.id}`} className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#B85C38] transition-colors mb-4">
          <ArrowLeft size={18} />
          Back to Book
        </Link>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">Complete Your Purchase</h1>
        <p className="text-[#4A5568] mt-1">Secure checkout powered by Chapa</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Summary - Left Side */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
            <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Order Summary</h2>
            
            {/* Book Item */}
            <div className="flex gap-4 pb-4 border-b border-[#E8E2D9]">
              <img
                src={bookFormat.book.cover_image_url}
                alt={bookFormat.book.title}
                className="w-20 h-28 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-[#1A2A3A]">{bookFormat.book.title}</h3>
                <p className="text-sm text-[#4A5568] mt-0.5">{bookFormat.book.author_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
                    {bookFormat.format_type === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
                    {bookFormat.format_type}
                  </span>
                </div>
                <p className="font-bold text-[#2C3E50] mt-2">
                  {bookFormat.price} {bookFormat.currency || 'ETB'}
                </p>
              </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#4A5568]">Subtotal</span>
                <span className="text-[#1A2A3A]">{bookFormat.price} ETB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4A5568]">Tax</span>
                <span className="text-[#1A2A3A]">0.00 ETB</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E8E2D9]">
                <span className="text-[#1A2A3A]">Total</span>
                <span className="text-[#2C3E50]">{bookFormat.price} ETB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section - Right Side */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Payment Method</h2>
            
            {/* Chapa Badge */}
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
                  Pay {bookFormat.price} ETB
                </>
              )}
            </button>

            {/* Security Notice */}
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