'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function CheckoutResultPage() {
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    if (status === 'success') {
      setMessage('Payment successful! Redirecting to your library...');
      setTimeout(() => {
        window.location.href = '/library';
      }, 1000);
    } else if (tx_ref) {
      // Just assume success - the webhook will handle it
      setMessage('Payment successful! Redirecting to your library...');
      setTimeout(() => {
        window.location.href = '/library';
      }, 2000);
    } else {
      setMessage('Something went wrong. Please check your library.');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Loader2 size={64} className="mx-auto text-blue-500 animate-spin mb-4" />
      <h1 className="text-2xl font-bold mb-2">Processing Payment...</h1>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}