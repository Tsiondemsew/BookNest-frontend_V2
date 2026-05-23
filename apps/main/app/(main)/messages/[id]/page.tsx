'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatWindow } from '@/features/community/components/chat/ChatWindow';
import { chatApi } from '@/lib/api/chat';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const [chatName, setChatName] = useState<string | undefined>();
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const response = await chatApi.getChats();
        const chat = response.data.find(c => c.id === chatId);
        if (chat) {
          setChatName(chat.type === 'direct' ? chat.participants[0]?.name : chat.name);
          setChatType(chat.type);
        }
      } catch (error) {
        console.error('Failed to fetch chat info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId) {
      fetchChatInfo();
    }
  }, [chatId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <ChatWindow
        chatId={chatId}
        chatName={chatName}
        chatType={chatType}
        onBack={() => router.push('/messages')}
      />
    </div>
  );
}