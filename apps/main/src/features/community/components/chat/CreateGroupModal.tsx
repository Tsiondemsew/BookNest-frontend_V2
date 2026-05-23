'use client';

import { useState } from 'react';
import { X, Search, Users, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<void>;
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'info' | 'members'>('info');
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    // TODO: API call to search users
    await new Promise(resolve => setTimeout(resolve, 500));
    setSearchResults([
      { id: '2', name: 'Jane Smith', username: 'janesmith' },
      { id: '3', name: 'Bob Johnson', username: 'bobjohnson' },
    ]);
    setIsSearching(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const toggleMember = (member: User) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers(prev => [...prev, member]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsCreating(true);
    await onCreateGroup(groupName, selectedMembers.map(m => m.id));
    setIsCreating(false);
    onClose();
    setGroupName('');
    setSelectedMembers([]);
    setStep('info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9]">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">
            {step === 'info' ? 'Create New Group' : 'Add Members'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#4A5568] hover:text-[#1A2A3A]">
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Group Info */}
        {step === 'info' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Book Lovers Club"
                className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                Group Avatar (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGroupAvatar(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[#E8E2D9] text-[#4A5568] rounded-lg hover:bg-[#F5F1EB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('members')}
                disabled={!groupName.trim()}
                className="flex-1 px-4 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Members */}
        {step === 'members' && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
              />
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div>
                <p className="text-sm text-[#4A5568] mb-2">Selected ({selectedMembers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <span
                      key={member.id}
                      className="flex items-center gap-1 px-2 py-1 bg-[#F5F1EB] rounded-full text-sm"
                    >
                      {member.name}
                      <button
                        onClick={() => toggleMember(member)}
                        className="ml-1 text-[#4A5568] hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-[#B85C38]" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => toggleMember(result)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.find(m => m.id === result.id)
                        ? 'bg-[#F5F1EB] border border-[#B85C38]'
                        : 'hover:bg-[#F5F1EB]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white">
                      {result.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A2A3A]">{result.name}</p>
                      <p className="text-xs text-[#4A5568]">@{result.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-[#4A5568] py-8">No users found</p>
            ) : null}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('info')}
                className="flex-1 px-4 py-2 border border-[#E8E2D9] text-[#4A5568] rounded-lg hover:bg-[#F5F1EB] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Group'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}