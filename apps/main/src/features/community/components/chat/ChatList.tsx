'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MoreVertical, Users } from 'lucide-react';
import { formatRelativeTime } from '../../utils/timeFormat';

interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  }[];
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

export function ChatList({ chats, activeChatId, onChatSelect }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'group'>('all');

  const filteredChats = chats.filter((chat) => {
    if (filter === 'direct' && chat.type !== 'direct') return false;
    if (filter === 'group' && chat.type !== 'group') return false;
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (chat.type === 'direct') {
        const otherParticipant = chat.participants.find(p => p.id !== 'currentUserId');
        return otherParticipant?.name.toLowerCase().includes(searchLower);
      } else {
        return chat.name?.toLowerCase().includes(searchLower);
      }
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col border-r border-[#E8E2D9] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#E8E2D9]">
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-3">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38]"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all' ? 'bg-[#B85C38] text-white' : 'text-[#4A5568] hover:bg-[#F5F1EB]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('direct')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'direct' ? 'bg-[#B85C38] text-white' : 'text-[#4A5568] hover:bg-[#F5F1EB]'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilter('group')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'group' ? 'bg-[#B85C38] text-white' : 'text-[#4A5568] hover:bg-[#F5F1EB]'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#4A5568]">No conversations yet</p>
            <button className="mt-2 text-sm text-[#B85C38] hover:underline">Start a new chat</button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = activeChatId === chat.id;
            const otherParticipant = chat.type === 'direct' 
              ? chat.participants.find(p => p.id !== 'currentUserId')
              : null;
            const displayName = chat.type === 'direct' ? otherParticipant?.name : chat.name;
            const displayAvatar = chat.type === 'direct' ? otherParticipant?.avatarUrl : null;
            const isOnline = chat.type === 'direct' ? otherParticipant?.isOnline : false;

            return (
              <div
                key={chat.id}
                onClick={() => onChatSelect?.(chat.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-[#F5F1EB] ${
                  isActive ? 'bg-[#F5F1EB] border-l-4 border-l-[#B85C38]' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                    ) : chat.type === 'group' ? (
                      <Users size={20} />
                    ) : (
                      displayName?.charAt(0).toUpperCase()
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
                    <span className="text-xs text-[#4A5568] flex-shrink-0">
                      {formatRelativeTime(chat.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[#4A5568] truncate">
                    {chat.lastMessage.senderId === 'currentUserId' ? 'You: ' : `${chat.lastMessage.senderName}: `}
                    {chat.lastMessage.content}
                  </p>
                </div>

                {/* Unread Badge */}
                {chat.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-[#B85C38] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}