'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, BookOpen, Headphones, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface CheckoutFormProps {
  bookFormatId: string;
  bookTitle: string;
  authorName: string;
  coverImage: string;
  formatType: 'PDF' | 'Audio';
  price: number;
}

export function CheckoutForm({ 
  bookFormatId, 
  bookTitle, 
  authorName, 
  coverImage, 
  formatType, 
  price 
}: CheckoutFormProps) {
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Order Summary Card */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Order Summary</h2>
        
        <div className="flex gap-4 pb-4 border-b border-[#E8E2D9]">
          <img
            src={coverImage}
            alt={bookTitle}
            className="w-16 h-22 object-cover rounded-lg shadow-sm"
          />
          <div className="flex-1">
            <p className="font-semibold text-[#1A2A3A]">{bookTitle}</p>
            <p className="text-sm text-[#4A5568]">{authorName}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
                {formatType === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
                {formatType}
              </span>
            </div>
          </div>
          <p className="font-bold text-[#2C3E50]">{price.toFixed(2)} ETB</p>
        </div>
        
        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#4A5568]">Subtotal</span>
            <span className="text-[#1A2A3A]">{price.toFixed(2)} ETB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#4A5568]">Tax</span>
            <span className="text-[#1A2A3A]">0.00 ETB</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E8E2D9]">
            <span className="text-[#1A2A3A]">Total</span>
            <span className="text-[#2C3E50]">{price.toFixed(2)} ETB</span>
          </div>
        </div>
        
        <p className="text-xs text-[#4A5568] text-center mt-4 pt-3 border-t border-[#E8E2D9]">
          You will be redirected to Chapa to complete payment
        </p>
      </div>

      {/* Payment Button */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6">
        <div className="flex items-center gap-2 p-3 bg-[#F5F1EB] rounded-lg mb-4">
          <CreditCard size={18} className="text-[#B85C38]" />
          <span className="text-sm font-medium text-[#1A2A3A]">Chapa Payment Gateway</span>
        </div>

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
              Pay {price.toFixed(2)} ETB
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#4A5568]">
          <ShieldCheck size={14} />
          <span>Secure payment • SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}