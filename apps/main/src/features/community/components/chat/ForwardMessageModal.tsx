'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MessageCircle, Users, X, Forward } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { CommunityAvatar, CommunityCard, cn, ui } from '@/features/community/ui';
import type { Chat, ChatMessage } from '@repo/types';
import { encodeForwardedMessage, parseAnyForwarded } from './messageFormat';

interface ForwardMessageModalProps {
  message: ChatMessage | null;
  excludeChatId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function previewText(message: ChatMessage): { from: string; text: string } {
  if (message.sharedPost) {
    return { from: message.senderName, text: 'Shared a post' };
  }
  const raw = message.content?.trim() || '';
  const parsed = parseAnyForwarded(raw);
  if (parsed) return parsed;
  return { from: message.senderName, text: raw };
}

export function ForwardMessageModal({
  message,
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
    setSearchQuery('');
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
    if (!message) return;
    const { from, text } = previewText(message);
    setIsSending(chatId);
    setError(null);
    try {
      await chatApi.sendMessage(chatId, {
        content: encodeForwardedMessage(from, text),
      });
      onClose();
      router.push(`/messages?chat=${chatId}`);
    } catch {
      setError('Could not forward message');
    } finally {
      setIsSending(null);
    }
  };

  if (!isOpen || !message) return null;

  const preview = previewText(message);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forward-modal-title"
    >
      <CommunityCard
        padding
        className="w-full sm:max-w-md max-h-[88vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#B85C38]/10 flex items-center justify-center">
              <Forward size={18} className="text-[#B85C38]" />
            </div>
            <h2 id="forward-modal-title" className="text-lg font-semibold text-bn-ink">
              Forward message
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-bn-muted hover:bg-bn-surface"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-bn-border/70 bg-[#F5F1EB]/60 overflow-hidden">
          <div className="px-3 py-1.5 bg-[#2C3E50]/5 border-b border-bn-border/50">
            <p className="text-[10px] uppercase tracking-wide font-medium text-bn-muted">Preview</p>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-[#B85C38] truncate">{preview.from}</p>
            <p className="text-sm text-[#4A5568] line-clamp-4 mt-1 whitespace-pre-wrap break-words">
              {preview.text || '…'}
            </p>
          </div>
        </div>

        <p className="text-xs text-bn-muted mb-2">Send to</p>

        <div className="relative mb-3">
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

        <div className="flex-1 overflow-y-auto space-y-1 min-h-[160px] -mx-1 px-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-bn-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-bn-muted py-10">No conversations found</p>
          ) : (
            filtered.map((chat) => {
              const name =
                chat.type === 'direct' ? chat.participants[0]?.name || 'User' : chat.name || 'Group';
              const busy = isSending === chat.id;
              return (
                <button
                  key={chat.id}
                  type="button"
                  disabled={Boolean(isSending)}
                  onClick={() => void forwardToChat(chat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors touch-manipulation',
                    busy
                      ? 'bg-bn-primary/5 border border-bn-primary/20'
                      : 'hover:bg-bn-surface/90 border border-transparent hover:border-bn-border/50'
                  )}
                >
                  {chat.type === 'group' ? (
                    <div className="w-11 h-11 rounded-full bg-bn-primary/10 flex items-center justify-center shrink-0">
                      <Users size={20} className="text-bn-primary" />
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
                      <p className="text-xs text-bn-muted truncate mt-0.5">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {busy ? (
                    <Loader2 size={18} className="animate-spin text-bn-primary shrink-0" />
                  ) : (
                    <MessageCircle size={18} className="text-bn-muted shrink-0" />
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
