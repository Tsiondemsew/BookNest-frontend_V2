'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MessageCircle, Users, X } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { CommunityAvatar, CommunityCard, cn, ui } from '@/features/community/ui';
import type { Chat } from '@repo/types';

interface ForwardMessageModalProps {
  messageContent: string;
  senderName: string;
  excludeChatId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ForwardMessageModal({
  messageContent,
  senderName,
  excludeChatId,
  isOpen,
  onClose,
}: ForwardMessageModalProps) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const response = await chatApi.getChats();
        setChats(response.data.filter((chat) => chat.id !== excludeChatId));
      } catch {
        setError('Could not load your conversations');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [excludeChatId, isOpen]);

  const filtered = chats.filter((chat) => {
    const name =
      chat.type === 'direct' ? chat.participants[0]?.name || '' : chat.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const forwardToChat = async (chatId: string) => {
    setIsSending(chatId);
    setError(null);
    try {
      const snippet = messageContent.trim().slice(0, 500);
      await chatApi.sendMessage(chatId, {
        content: `Forwarded from ${senderName}:\n${snippet}`,
      });
      onClose();
      router.push(`/messages?chat=${chatId}`);
    } catch {
      setError('Could not forward message');
    } finally {
      setIsSending(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <CommunityCard padding className="max-w-md w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-bn-ink">Forward message</h2>
          <button type="button" onClick={onClose} className="text-bn-muted" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bn-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className={cn(ui.input, 'pl-10')}
          />
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex-1 overflow-y-auto space-y-1 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-bn-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-bn-muted py-8">No conversations found</p>
          ) : (
            filtered.map((chat) => {
              const name =
                chat.type === 'direct' ? chat.participants[0]?.name || 'User' : chat.name || 'Group';
              return (
                <button
                  key={chat.id}
                  type="button"
                  disabled={Boolean(isSending)}
                  onClick={() => void forwardToChat(chat.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bn-surface/80 text-left disabled:opacity-60"
                >
                  {chat.type === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-bn-primary/10 flex items-center justify-center">
                      <Users size={18} className="text-bn-primary" />
                    </div>
                  ) : (
                    <CommunityAvatar
                      name={name}
                      src={chat.participants[0]?.avatarUrl}
                      size="md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-bn-ink truncate">{name}</p>
                    {chat.lastMessage && (
                      <p className="text-xs text-bn-muted truncate">{chat.lastMessage.content}</p>
                    )}
                  </div>
                  {isSending === chat.id ? (
                    <Loader2 size={16} className="animate-spin text-bn-primary" />
                  ) : (
                    <MessageCircle size={16} className="text-bn-muted" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </CommunityCard>
    </div>
  );
}
