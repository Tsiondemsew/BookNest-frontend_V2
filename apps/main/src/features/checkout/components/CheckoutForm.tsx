'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useCartStore } from '@/stores/cartStore';

interface CheckoutFormProps {
  bookFormatId: string;
  bookTitle: string;
  price: number;
}

export function CheckoutForm({ bookFormatId, bookTitle, price }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<{ success: boolean; data: { checkout_url: string } }>(
        '/api/checkout',
        { book_format_id: bookFormatId }
      );

      // Redirect to Chapa payment page
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Order Summary Card */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 pb-3 border-b">
            <BookOpen size={20} className="text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">{bookTitle}</p>
              <p className="text-sm text-gray-500">{price.toFixed(2)} ETB</p>
            </div>
          </div>
          
          <div className="flex justify-between font-semibold text-lg pt-2">
            <span>Total</span>
            <span>{price.toFixed(2)} ETB</span>
          </div>
          
          <p className="text-xs text-gray-500 text-center pt-2">
            You will be redirected to Chapa to complete payment
          </p>
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
            Pay {price.toFixed(2)} ETB with Chapa
          </>
        )}
      </button>
    </div>
  );
}