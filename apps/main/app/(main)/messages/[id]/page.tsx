'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  useEffect(() => {
    if (chatId) {
      router.replace(`/messages?chat=${chatId}`);
    }
  }, [chatId, router]);

  return null;
}