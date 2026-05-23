'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { apiClient } from '@/lib/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function NewChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get<{ success: boolean; data: User[] }>(
        `/api/auth/search?q=${encodeURIComponent(query)}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = async (userId: string) => {
    setIsCreating(true);
    try {
      const response = await chatApi.getOrCreateDirectChat(userId);
      router.push(`/messages/${response.data.chat.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchUsers(value);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#F5F1EB] rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">New Chat</h1>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
          />
        </div>

        <div className="mt-4 space-y-2">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[#B85C38]" />
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => startChat(user.id)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1EB] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#1A2A3A]">{user.name}</p>
                    <p className="text-xs text-[#4A5568]">{user.email}</p>
                  </div>
                </div>
                {isCreating ? (
                  <Loader2 size={16} className="animate-spin text-[#B85C38]" />
                ) : (
                  <button className="text-sm text-[#B85C38]">Message</button>
                )}
              </div>
            ))
          ) : searchQuery.length >= 2 ? (
            <p className="text-center text-[#4A5568] py-8">No users found</p>
          ) : (
            <p className="text-center text-[#4A5568] py-8">Type at least 2 characters to search</p>
          )}
        </div>
      </div>
    </div>
  );
}