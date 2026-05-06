'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle, BookOpen, ArrowRight } from 'lucide-react';

export default function CheckoutResultPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const tx_ref = searchParams.get('tx_ref');
    const statusParam = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');

    console.log('Checkout result params:', { tx_ref, statusParam, paymentId });

    if (statusParam === 'success' || (tx_ref && !statusParam)) {
      // Successful payment
      setStatus('success');
      setMessage('Payment completed successfully! Redirecting to your library...');
      
      setTimeout(() => {
        window.location.href = '/library';
      }, 2000);
    } else if (statusParam === 'cancelled') {
      // User cancelled payment
      setStatus('error');
      setMessage('Payment was cancelled. You can try again when you\'re ready.');
    } else if (statusParam === 'failed') {
      // Payment failed
      setStatus('error');
      setMessage('Payment failed. Please check your payment method and try again.');
    } else if (tx_ref) {
      // Has reference but no status - assume success, webhook will handle
      setStatus('success');
      setMessage('Payment successful! Redirecting to your library...');
      
      setTimeout(() => {
        window.location.href = '/library';
      }, 2000);
    } else {
      // No parameters - something went wrong
      setStatus('error');
      setMessage('Something went wrong. Please check your library or contact support.');
    }
  }, []);

  if (status === 'processing') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 size={64} className="animate-spin text-[#B85C38]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Processing Payment</h1>
          <p className="text-[#4A5568]">{message}</p>
          <p className="text-sm text-[#4A5568] mt-4">Please don't close this window</p>
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
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Payment Successful! 🎉</h1>
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
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Payment Failed</h1>
        <p className="text-[#4A5568] mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
          >
            Browse Books
            <ArrowRight size={16} />
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#E8E2D9] text-[#4A5568] rounded-lg font-medium hover:bg-[#F5F1EB] transition-colors"
          >
            Try Again
          </button>
        </div>
        <p className="text-xs text-[#4A5568] mt-6">
          If the amount was deducted from your account, please contact support.
        </p>
      </div>
    </div>
  );
}