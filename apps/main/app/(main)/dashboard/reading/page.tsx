'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ReadingJourneyView } from '@/features/reading-journey';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function isReaderRole(role?: string) {
  return role !== 'author' && role !== 'publisher';
}

export default function ReadingJourneyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role;

  useEffect(() => {
    if (user && !isReaderRole(role)) {
      router.replace('/studio');
    }
  }, [user, role, router]);

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  if (!isReaderRole(role)) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <p className="text-[#1A2A3A] font-semibold text-lg">Reading tracking is for readers</p>
        <p className="text-sm text-[#4A5568] mt-2">
          Authors and publishers use Studio for sales analytics and earnings — not reading streaks or
          badges.
        </p>
        <Link
          href="/studio/analytics"
          className="inline-block mt-6 text-sm font-semibold text-[#B85C38] hover:underline"
        >
          Go to Studio analytics →
        </Link>
      </div>
    );
  }

  return <ReadingJourneyView />;
}
