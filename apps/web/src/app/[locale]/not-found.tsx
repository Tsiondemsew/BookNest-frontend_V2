'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go back to dashboard
        </Link>
      </div>
    </div>
  );
}
