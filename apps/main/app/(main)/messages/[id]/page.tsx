'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ChatRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  useEffect(() => {
    if (chatId) {
      router.replace(`/messages?chat=${chatId}`);
    }
  }, [chatId, router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 size={32} className="animate-spin text-bn-primary" />
    </div>
  );
}
