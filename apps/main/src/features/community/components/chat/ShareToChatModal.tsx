'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MessageCircle, Users } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { CommunityAvatar, CommunityCard, cn, ui } from '@/features/community/ui';
import type { Chat, Post } from '@repo/types';

interface ShareToChatModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareToChatModal({ post, isOpen, onClose }: ShareToChatModalProps) {
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
        setChats(response.data);
      } catch {
        setError('Could not load your conversations');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen]);

  const filtered = chats.filter((chat) => {
    const name =
      chat.type === 'direct' ? chat.participants[0]?.name || '' : chat.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sendToChat = async (chatId: string) => {
    setIsSending(chatId);
    setError(null);
    try {
      await chatApi.sharePost(chatId, post.id);
      onClose();
      router.push(`/messages?chat=${chatId}`);
    } catch {
      setError('Failed to share post. Try again.');
    } finally {
      setIsSending(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <CommunityCard padding className="max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-bn-ink">Send post in chat</h2>
          <button type="button" onClick={onClose} className="text-bn-muted hover:text-bn-ink">
            ✕
          </button>
        </div>
        <p className="text-sm text-bn-muted mb-4 line-clamp-2">{post.content}</p>

        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bn-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className={cn(ui.input, 'pl-9')}
          />
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="flex-1 overflow-y-auto min-h-[200px] space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-bn-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={28} className="mx-auto text-bn-muted mb-2" />
              <p className="text-sm text-bn-muted">No chats yet</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/messages');
                }}
                className={cn(ui.btnPrimary, 'mt-3 text-sm')}
              >
                Start a chat
              </button>
            </div>
          ) : (
            filtered.map((chat) => {
              const name =
                chat.type === 'direct' ? chat.participants[0]?.name || 'User' : chat.name;
              return (
                <button
                  key={chat.id}
                  type="button"
                  disabled={!!isSending}
                  onClick={() => void sendToChat(chat.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bn-surface/80 text-left disabled:opacity-60"
                >
                  {chat.type === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-bn-primary/15 flex items-center justify-center text-bn-primary">
                      <Users size={18} />
                    </div>
                  ) : (
                    <CommunityAvatar
                      name={name || 'U'}
                      src={chat.participants[0]?.avatarUrl}
                      size="sm"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-bn-ink truncate">{name}</p>
                    <p className="text-xs text-bn-muted capitalize">{chat.type} chat</p>
                  </div>
                  {isSending === chat.id && (
                    <Loader2 size={16} className="animate-spin text-bn-primary" />
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
