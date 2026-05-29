'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle, BookOpen, ArrowRight } from 'lucide-react';
import { checkoutApi } from '@/lib/api/client';

type ResultStatus = 'processing' | 'success' | 'error';

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
  const [status, setStatus] = useState<ResultStatus>('processing');
  const [message, setMessage] = useState('Confirming your payment...');

  const confirmPayment = useCallback(async (txRef: string) => {
    const maxAttempts = 8;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await checkoutApi.verifyPayment(txRef);
        const verified = response.data?.verified === true;

        if (verified) {
          setStatus('success');
          setMessage('Payment confirmed! Taking you to your library...');
          setTimeout(() => router.replace('/library'), 1500);
          return;
        }
      } catch (err) {
        console.error('Payment verify attempt failed', err);
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    setStatus('error');
    setMessage(
      'Payment received but confirmation is still processing. Check your library in a minute or contact support if the book is missing.'
    );
  }, [router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tx_ref = readTxRef(searchParams);
    const statusParam = searchParams.get('status')?.toLowerCase();

    if (statusParam === 'cancelled' || statusParam === 'canceled') {
      setStatus('error');
      setMessage('Payment was cancelled. You can try again when you\'re ready.');
      return;
    }

    if (statusParam === 'failed') {
      setStatus('error');
      setMessage('Payment failed. Please check your payment method and try again.');
      return;
    }

    if (!tx_ref) {
      setStatus('error');
      setMessage('Missing payment reference. Check your library or contact support.');
      return;
    }

    void confirmPayment(tx_ref);
  }, [confirmPayment]);

  if (status === 'processing') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 size={64} className="animate-spin text-[#B85C38]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Processing Payment</h1>
          <p className="text-[#4A5568]">{message}</p>
          <p className="text-sm text-[#4A5568] mt-4">Please don&apos;t close this window</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#2D6A4F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Payment Successful!</h1>
          <p className="text-[#4A5568] mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
            >
              <BookOpen size={18} />
              Go to My Library
            </Link>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#E8E2D9] text-[#4A5568] rounded-lg font-medium hover:bg-[#F5F1EB] transition-colors"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Payment Issue</h1>
        <p className="text-[#4A5568] mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
          >
            <BookOpen size={18} />
            Check My Library
          </Link>
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#E8E2D9] text-[#4A5568] rounded-lg font-medium hover:bg-[#F5F1EB] transition-colors"
          >
            Browse Books
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
