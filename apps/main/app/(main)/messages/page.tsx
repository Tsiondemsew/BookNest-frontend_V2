'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Users, Loader2, MessageSquare } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import {
  PageHeader,
  CommunityCard,
  CommunityAvatar,
  SegmentedTabs,
  EmptyState,
  cn,
  ui,
} from '@/features/community/ui';
import type { Chat } from '@repo/types';

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      try {
        const response = await chatApi.getChats();
        setChats(response.data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredChats = chats.filter((chat) => {
    if (activeTab === 'direct' && chat.type !== 'direct') return false;
    if (activeTab === 'groups' && chat.type !== 'group') return false;
    if (searchQuery) {
      const name = chat.type === 'direct' ? chat.participants[0]?.name || '' : chat.name || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className={cn(ui.page, 'flex justify-center items-center min-h-[50vh]')}>
        <Loader2 size={32} className="animate-spin text-bn-primary" />
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <PageHeader
        title="Messages"
        description="Connect with readers, authors, and publishers."
        action={
          <Link href="/messages/new" className={ui.btnPrimary}>
            <Plus size={18} />
            New chat
          </Link>
        }
      />

      <CommunityCard padding className="mb-5">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bn-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className={cn(ui.input, 'pl-10')}
          />
        </div>
        <div className="mt-4">
          <SegmentedTabs
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'direct', label: 'Direct' },
              { id: 'groups', label: 'Groups' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </CommunityCard>

      <CommunityCard className="overflow-hidden">
        {filteredChats.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Start a chat with someone from the community."
            action={
              <Link href="/messages/new" className={ui.btnPrimary}>
                Start a chat
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-bn-border/60">
            {filteredChats.map((chat) => {
              const displayName = chat.type === 'direct' ? chat.participants[0]?.name || 'User' : chat.name;
              const isOnline = chat.type === 'direct' ? chat.participants[0]?.isOnline : false;

              return (
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className={cn(
                    'block px-4 sm:px-5 py-4 transition-colors hover:bg-bn-surface/60',
                    chat.unreadCount > 0 && 'bg-bn-primary/[0.03]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {chat.type === 'group' ? (
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white', ui.avatarGradient)}>
                          <Users size={20} />
                        </div>
                      ) : (
                        <CommunityAvatar name={displayName || 'U'} src={chat.participants[0]?.avatarUrl} size="md" ring />
                      )}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-bn-ink truncate">{displayName}</h3>
                        {chat.lastMessage && (
                          <span className={ui.caption}>{formatRelativeTime(chat.lastMessage.createdAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className={cn(ui.caption, 'truncate')}>
                          {chat.lastMessage?.senderId === 'currentUser' ? 'You: ' : ''}
                          {chat.lastMessage?.content}
                        </p>
                        {chat.unreadCount > 0 && <span className={ui.unread}>{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CommunityCard>
    </div>
  );
}
