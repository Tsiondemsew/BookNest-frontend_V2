'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';
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

  // Fetch book format details
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
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-blue-500" />
        <p className="mt-4 text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  if (error || !bookFormat) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">{error || 'No item selected for checkout.'}</p>
        <Link href="/market" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/market/${bookFormat.book.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={18} />
        Back to Book
      </Link>

      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        <div className="flex gap-4 pb-4 border-b">
          <img
            src={bookFormat.book.cover_image_url}
            alt={bookFormat.book.title}
            className="w-20 h-28 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{bookFormat.book.title}</h3>
            <p className="text-sm text-gray-600">{bookFormat.book.author_name}</p>
            <div className="mt-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {bookFormat.format_type}
              </span>
            </div>
            <p className="font-bold mt-2">{bookFormat.price} ETB</p>
          </div>
        </div>
        
        <div className="flex justify-between font-semibold text-lg pt-4">
          <span>Total</span>
          <span>{bookFormat.price} ETB</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay {bookFormat.price} ETB with Chapa
          </>
        )}
      </button>
    </div>
  );
}