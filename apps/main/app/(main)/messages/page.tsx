'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Users, User, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import type { Chat } from '@repo/types';

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all');

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

  const filteredChats = chats.filter((chat) => {
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
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Messages</h1>
          <p className="text-sm text-[#4A5568] mt-1">Connect with readers, authors, and publishers</p>
        </div>
        <Link
          href="/messages/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors"
        >
          <Plus size={18} />
          New Chat
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
          />
        </div>
        
        <div className="flex gap-2 mt-3">
          {['all', 'direct', 'groups'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-[#B85C38] text-white'
                  : 'text-[#4A5568] hover:bg-[#F5F1EB]'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'direct' ? 'Direct' : 'Groups'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
        <div className="divide-y divide-[#E8E2D9]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#4A5568]">No conversations found</p>
              <Link href="/messages/new" className="text-sm text-[#B85C38] hover:underline mt-2 inline-block">
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
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className={`block p-4 hover:bg-[#FDFBF7] transition-colors ${
                    chat.unreadCount > 0 ? 'bg-[#FDFBF7]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold">
                        {chat.type === 'direct' ? (
                          displayName?.charAt(0).toUpperCase()
                        ) : (
                          <Users size={20} />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#1A2A3A] truncate">{displayName}</h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-[#4A5568] flex-shrink-0">
                            {formatRelativeTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-[#4A5568] truncate">
                          {chat.lastMessage?.senderId === 'currentUser' ? 'You: ' : ''}
                          {chat.lastMessage?.content}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-[#B85C38] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}