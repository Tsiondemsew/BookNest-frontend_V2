'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Loader2, BookOpen, ArrowRight, AlertCircle } from 'lucide-react';
import { checkoutApi } from '@/lib/api/client';
import { useCartStore } from '@/stores/cartStore';
import { wishlistQueryKeys } from '@/features/wishlist/query-keys';

type ResultStatus = 'processing' | 'success' | 'failed';

function readTxRef(searchParams: URLSearchParams): string | null {
  return (
    searchParams.get('tx_ref') ||
    searchParams.get('trx_ref') ||
    searchParams.get('trxref') ||
    searchParams.get('reference')
  );
}

export default function CheckoutResultPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [status, setStatus] = useState<ResultStatus>('processing');
  const [message, setMessage] = useState('Confirming your payment...');

  const refreshCommerceState = useCallback(() => {
    void fetchCart();
    void queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
  }, [fetchCart, queryClient]);

  const goToLibrary = useCallback(() => {
    router.replace('/library');
  }, [router]);

  const confirmPayment = useCallback(
    async (txRef: string) => {
      const maxAttempts = 5;
      const delayMs = 1500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await checkoutApi.verifyPayment(txRef);
          const verified = response.data?.verified === true;

          if (verified) {
            setStatus('success');
            setMessage('Payment confirmed! Taking you to your library...');
            refreshCommerceState();
            setTimeout(goToLibrary, 1500);
            return;
          }
        } catch (err) {
          console.error('Payment verify attempt failed', err);
        }

        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }

      setStatus('failed');
      setMessage(
        'We could not confirm your payment yet. If Chapa charged you, open your library in a minute or contact support with your receipt.'
      );
    },
    [goToLibrary, refreshCommerceState]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tx_ref = readTxRef(searchParams);
    const statusParam = searchParams.get('status');

    if (statusParam?.toLowerCase() === 'cancelled' || statusParam?.toLowerCase() === 'canceled') {
      setStatus('failed');
      setMessage('Payment was cancelled.');
      setTimeout(() => router.replace('/market'), 2000);
      return;
    }

    if (statusParam?.toLowerCase() === 'failed') {
      setStatus('failed');
      setMessage('Payment did not complete. You can try again from the marketplace.');
      return;
    }

    if (!tx_ref) {
      setStatus('success');
      setMessage('Check your library for your new books.');
      setTimeout(goToLibrary, 2000);
      return;
    }

    void confirmPayment(tx_ref);
  }, [confirmPayment, goToLibrary, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'processing' ? (
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 size={64} className="animate-spin text-[#B85C38]" />
          </div>
        ) : status === 'success' ? (
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#2D6A4F]" />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle size={48} className="text-[#B85C38]" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">
          {status === 'processing'
            ? 'Processing Payment'
            : status === 'success'
              ? 'Payment Successful!'
              : 'Payment Status'}
        </h1>
        <p className="text-[#4A5568] mb-6">{message}</p>
        {status === 'processing' ? (
          <p className="text-sm text-[#4A5568]">Please don&apos;t close this window</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={goToLibrary}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
            >
              <BookOpen size={18} />
              Go to My Library
            </button>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#E8E2D9] text-[#4A5568] rounded-lg font-medium hover:bg-[#F5F1EB] transition-colors"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
