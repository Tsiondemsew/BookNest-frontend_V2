'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Users, Loader2, MessageSquare, UserPlus } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { usersApi } from '@/lib/api/client';
import { getFriendlyNetworkMessage } from '@/lib/api/networkErrorMessage';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import { ChatWindow } from '@/features/community/components/chat/ChatWindow';
import { CreateGroupModal } from '@/features/community/components/chat/CreateGroupModal';
import {
  PageHeader,
  CommunityCard,
  OnlineAvatar,
  CommunityAvatar,
  SegmentedTabs,
  EmptyState,
  cn,
  ui,
} from '@/features/community/ui';
import type { Chat } from '@repo/types';

interface MessagesHubProps {
  initialChatId?: string;
}

export function MessagesHub({ initialChatId }: MessagesHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get('chat') || initialChatId || null;

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState('');
  const [newChatResults, setNewChatResults] = useState<
    { id: string; name: string; username?: string; avatarUrl?: string | null }[]
  >([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const handledStartUser = useRef<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      const response = await chatApi.getChats();
      setChats(response.data);
      setLoadError(null);
    } catch (error) {
      setLoadError(getFriendlyNetworkMessage(error, 'Unable to load conversations. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChatRemoved = () => {
    router.push('/messages', { scroll: false });
    void loadChats();
  };

  const selectChat = (chatId: string) => {
    router.push(`/messages?chat=${chatId}`, { scroll: false });
  };

  const startDirectChat = useCallback(
    async (otherUserId: string) => {
      setIsStartingChat(true);
      try {
        const response = await chatApi.getOrCreateDirectChat(otherUserId);
        setShowNewChat(false);
        setNewChatQuery('');
        setNewChatResults([]);
        await loadChats();
        selectChat(response.data.chat.id);
      } catch (error) {
        console.error('Failed to start chat:', error);
      } finally {
        setIsStartingChat(false);
      }
    },
    [loadChats]
  );

  useEffect(() => {
    void loadChats();
    const interval = window.setInterval(() => void loadChats(), 45_000);
    return () => window.clearInterval(interval);
  }, [loadChats]);

  useEffect(() => {
    if (!selectedChatId) return;
    void loadChats();
  }, [selectedChatId, loadChats]);

  useEffect(() => {
    const startUserId = searchParams.get('startUser');
    if (!startUserId || handledStartUser.current === startUserId) return;
    handledStartUser.current = startUserId;
    void startDirectChat(startUserId);
  }, [searchParams, startDirectChat]);

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    const response = await chatApi.createGroupChat({ name, memberIds });
    await loadChats();
    selectChat(response.data.id);
  };

  const searchUsers = async (query: string) => {
    setNewChatQuery(query);
    if (query.trim().length < 2) {
      setNewChatResults([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      const response = await usersApi.searchCommunityUsers(query.trim());
      setNewChatResults(response.data || []);
    } catch (error) {
      console.error('User search failed:', error);
      setNewChatResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (activeTab === 'direct' && chat.type !== 'direct') return false;
    if (activeTab === 'groups' && chat.type !== 'group') return false;
    if (searchQuery) {
      const name = chat.type === 'direct' ? chat.participants[0]?.name || '' : chat.name || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const activeChat = chats.find((c) => c.id === selectedChatId);
  const activeChatName =
    activeChat?.type === 'direct'
      ? activeChat.participants[0]?.name
      : activeChat?.name;

  if (isLoading) {
    return (
      <div className={cn(ui.page, 'flex justify-center items-center min-h-[50vh]')}>
        <Loader2 size={32} className="animate-spin text-bn-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      <PageHeader
        title="Messages"
        description="Chat with readers, authors, and groups."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              className={ui.btnSecondary}
            >
              <Users size={18} />
              New group
            </button>
            <button type="button" onClick={() => setShowNewChat(true)} className={ui.btnPrimary}>
              <Plus size={18} />
              New chat
            </button>
          </div>
        }
      />

      {loadError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
          <button
            type="button"
            onClick={() => void loadChats()}
            className="ml-3 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="flex h-[calc(100dvh-11rem)] min-h-[420px] max-h-[820px] rounded-2xl border border-bn-border/70 overflow-hidden bg-white shadow-md">
        {/* Chat list — left panel */}
        <div
          className={cn(
            'w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-bn-border/70 flex flex-col bg-bn-surface/30',
            selectedChatId ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="p-4 space-y-3 border-b border-bn-border/60">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bn-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className={cn(ui.input, 'pl-10 bg-white')}
              />
            </div>
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

          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations"
                  description="Start a direct chat or create a group."
                />
              </div>
            ) : (
              <div className="divide-y divide-bn-border/50">
                {filteredChats.map((chat) => {
                  const displayName =
                    chat.type === 'direct' ? chat.participants[0]?.name || 'User' : chat.name;
                  const isActive = chat.id === selectedChatId;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => selectChat(chat.id)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 transition-colors hover:bg-white/80',
                        isActive && 'bg-white border-l-2 border-l-bn-primary',
                        chat.unreadCount > 0 && !isActive && 'bg-bn-primary/[0.04]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {chat.type === 'group' ? (
                          <div
                            className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0',
                              ui.avatarGradient
                            )}
                          >
                            <Users size={18} />
                          </div>
                        ) : (
                          <OnlineAvatar
                            name={displayName || 'U'}
                            src={chat.participants[0]?.avatarUrl}
                            size="md"
                            ring
                            isOnline={chat.participants[0]?.isOnline}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-bn-ink truncate text-sm">
                              {displayName}
                              {chat.type === 'group' && chat.participantCount
                                ? ` · ${chat.participantCount}`
                                : ''}
                            </h3>
                            {chat.lastMessage && (
                              <span className={cn(ui.caption, 'flex-shrink-0')}>
                                {formatRelativeTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className={cn(ui.caption, 'truncate')}>
                              {chat.lastMessage?.senderName === 'You' ? 'You: ' : ''}
                              {chat.lastMessage?.content || 'No messages yet'}
                            </p>
                            {chat.unreadCount > 0 && (
                              <span className={ui.unread}>
                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat panel — right side */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 bg-white',
            !selectedChatId ? 'hidden md:flex' : 'flex'
          )}
        >
          {selectedChatId ? (
            <ChatWindow
              chatId={selectedChatId}
              chatName={activeChatName}
              chatType={activeChat?.type || 'direct'}
              isGroupAdmin={activeChat?.isAdmin}
              otherUserId={activeChat?.participants[0]?.id}
              otherUserOnline={activeChat?.participants[0]?.isOnline}
              onBack={() => router.push('/messages', { scroll: false })}
              onMessageSent={loadChats}
              onRefreshMeta={loadChats}
              onChatRemoved={handleChatRemoved}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-bn-primary/10 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-bn-primary" />
              </div>
              <h3 className="text-lg font-semibold text-bn-ink">Select a conversation</h3>
              <p className="text-sm text-bn-muted mt-1 max-w-sm">
                Choose a chat from the list or start a new direct message or group.
              </p>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowNewChat(true)} className={ui.btnPrimary}>
                  <UserPlus size={16} />
                  New chat
                </button>
                <button type="button" onClick={() => setShowGroupModal(true)} className={ui.btnSecondary}>
                  <Users size={16} />
                  Create group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />

      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CommunityCard padding className="max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-bn-ink">New direct chat</h2>
              <button type="button" onClick={() => setShowNewChat(false)} className="text-bn-muted">
                ✕
              </button>
            </div>
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bn-muted" />
              <input
                type="text"
                value={newChatQuery}
                onChange={(e) => searchUsers(e.target.value)}
                placeholder="Search community members…"
                className={cn(ui.input, 'pl-10')}
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {isSearchingUsers ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={24} className="animate-spin text-bn-primary" />
                </div>
              ) : newChatResults.length > 0 ? (
                newChatResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    disabled={isStartingChat}
                    onClick={() => startDirectChat(user.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-bn-surface/80 text-left"
                  >
                    <CommunityAvatar name={user.name} src={user.avatarUrl || undefined} size="sm" />
                    <div>
                      <p className="font-medium text-sm text-bn-ink">{user.name}</p>
                      {user.username && (
                        <p className="text-xs text-bn-muted">@{user.username}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : newChatQuery.length >= 2 ? (
                <p className="text-center text-bn-muted py-6 text-sm">No users found</p>
              ) : (
                <p className="text-center text-bn-muted py-6 text-sm">Type at least 2 characters</p>
              )}
            </div>
          </CommunityCard>
        </div>
      )}
    </div>
  );
}
