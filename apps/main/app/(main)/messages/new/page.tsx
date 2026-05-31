'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';

export default function NewChatRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');

  useEffect(() => {
    if (userId) {
      router.replace(`/messages?startUser=${userId}`);
      return;
    }
    router.replace('/messages');
  }, [userId, router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 size={32} className="animate-spin text-bn-primary" />
    </div>
  );
}
