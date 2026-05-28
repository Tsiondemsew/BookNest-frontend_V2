'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Users, Loader2, ArrowLeft } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import { ChatWindow } from '@/features/community/components/chat/ChatWindow';
import { useAuthStore } from '@/stores/authStore';
import type { Chat } from '@repo/types';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');
  const selectedChatId = searchParams.get('chat');

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const filteredChats = useMemo(() => chats.filter((chat) => {
    if (activeTab === 'direct' && chat.type !== 'direct') return false;
    if (activeTab === 'groups' && chat.type !== 'group') return false;
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const name = chat.type === 'direct' 
        ? chat.participants[0]?.name || ''
        : chat.name || '';
      return name.toLowerCase().includes(searchLower);
    }
    return true;
  }), [chats, activeTab, searchQuery]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) || null,
    [chats, selectedChatId]
  );

  const openChat = (chatId: string) => {
    router.replace(`/messages?chat=${chatId}`);
  };

  const closeChat = () => {
    router.replace('/messages');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full bg-[#FDFBF7]">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex w-full bg-[#FDFBF7] overflow-hidden">
      
      {/* LEFT SIDEBAR: Conversational Context Panel */}
      <div className={`w-full lg:w-[360px] border-r border-[#E8E2D9] flex flex-col flex-shrink-0 bg-white min-h-0 ${
        activeChat ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Inner Header Section */}
        <div className="p-4 border-b border-[#E8E2D9] bg-[#FDFBF7]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-[#1A2A3A]">Messages</h1>
              <p className="text-xs text-[#4A5568] mt-0.5">Connect with your community</p>
            </div>
            <Link
              href="/messages/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors"
            >
              <Plus size={16} />
              New
            </Link>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="text-black text-sm w-full pl-9 pr-3 py-1.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
            />
          </div>
          
          {/* Filter Pill Badges */}
          <div className="flex gap-1.5">
            {['all', 'direct', 'groups'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${
                  activeTab === tab
                    ? 'bg-[#B85C38] text-white'
                    : 'text-[#4A5568] bg-white border border-[#E8E2D9] hover:bg-[#F5F1EB]'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'direct' ? 'Direct' : 'Groups'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Active Conversations Queue */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E8E2D9]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#4A5568]">No conversations found</p>
              <Link href="/messages/new" className="text-xs text-[#B85C38] hover:underline mt-2 inline-block">
                Start a new chat →
              </Link>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const displayName = chat.type === 'direct' 
                ? chat.participants[0]?.name || 'User'
                : chat.name;
              const isOnline = chat.type === 'direct' ? chat.participants[0]?.isOnline : false;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className={`w-full block text-left p-4 hover:bg-[#FDFBF7] transition-colors ${
                    activeChat?.id === chat.id ? 'bg-[#F5F1EB]' : ''
                  } ${
                    chat.unreadCount > 0 ? 'bg-[#FDFBF7]/70 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold text-sm">
                        {chat.type === 'direct' ? (
                          displayName?.charAt(0).toUpperCase()
                        ) : (
                          <Users size={16} />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[#1A2A3A] truncate">{displayName}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-[#4A5568] flex-shrink-0 ml-1">
                            {formatRelativeTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-[#4A5568] truncate pr-2">
                          {chat.lastMessage?.senderId === user?.id ? 'You: ' : ''}
                          {chat.lastMessage?.content}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="w-4 h-4 bg-[#B85C38] text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Immersive Dynamic Edge-to-Edge Chat Workspace */}
      <div className={`flex-1 h-full min-w-0 ${
        !activeChat ? 'hidden lg:flex items-center justify-center bg-[#FDFBF7]' : 'flex'
      }`}>
        {activeChat ? (
          <div className="w-full h-full">
            <ChatWindow
              chatId={activeChat.id}
              chatName={activeChat.type === 'direct' ? activeChat.participants[0]?.name : activeChat.name}
              chatType={activeChat.type}
              onBack={closeChat}
            />
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#F5F1EB] rounded-full flex items-center justify-center mx-auto mb-3 text-[#B85C38]">
              <Users size={28} />
            </div>
            <h2 className="text-base font-semibold text-[#1A2A3A]">No conversation selected</h2>
            <p className="text-sm text-[#4A5568] mt-1 max-w-xs">Pick a thread from your inbox array to resume seamlessly.</p>
          </div>
        )}
      </div>

    </div>
  );
}