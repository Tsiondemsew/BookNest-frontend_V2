'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { checkoutApi } from '@/lib/api/client';

type ResultStatus = 'processing' | 'success';

function readTxRef(searchParams: URLSearchParams): string | null {
  return (
    searchParams.get('tx_ref') ||
    searchParams.get('trx_ref') ||
    searchParams.get('trxref') ||
    searchParams.get('reference')
  );
}

function isChapaSuccess(statusParam: string | null): boolean {
  if (!statusParam) return false;
  const s = statusParam.toLowerCase();
  return s === 'success' || s === 'successful';
}

export default function CheckoutResultPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ResultStatus>('processing');
  const [message, setMessage] = useState('Confirming your payment...');

  const goToLibrary = useCallback(() => {
    router.replace('/library');
  }, [router]);

  const confirmPayment = useCallback(
    async (txRef: string, chapaSaysSuccess: boolean) => {
      if (chapaSaysSuccess) {
        setStatus('success');
        setMessage('Payment successful! Taking you to your library...');
        checkoutApi.verifyPayment(txRef).catch(() => {});
        setTimeout(goToLibrary, 1500);
        return;
      }

      const maxAttempts = 4;
      const delayMs = 1500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await checkoutApi.verifyPayment(txRef);
          if (response.data?.verified === true) {
            setStatus('success');
            setMessage('Payment confirmed! Taking you to your library...');
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

      setStatus('success');
      setMessage('Payment received! Your library has been updated.');
      setTimeout(goToLibrary, 2000);
    },
    [goToLibrary]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tx_ref = readTxRef(searchParams);
    const statusParam = searchParams.get('status');

    if (statusParam?.toLowerCase() === 'cancelled' || statusParam?.toLowerCase() === 'canceled') {
      setStatus('success');
      setMessage('Payment was cancelled.');
      setTimeout(() => router.replace('/market'), 2000);
      return;
    }

    if (statusParam?.toLowerCase() === 'failed') {
      setStatus('success');
      setMessage('Payment did not complete. Check your library or try again.');
      setTimeout(goToLibrary, 2500);
      return;
    }

    if (!tx_ref) {
      setStatus('success');
      setMessage('Check your library for your new books.');
      setTimeout(goToLibrary, 2000);
      return;
    }

    void confirmPayment(tx_ref, isChapaSuccess(statusParam));
  }, [confirmPayment, goToLibrary]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        {status === 'processing' ? (
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 size={64} className="animate-spin text-[#B85C38]" />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#2D6A4F]" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">
          {status === 'processing' ? 'Processing Payment' : 'Payment Successful!'}
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
