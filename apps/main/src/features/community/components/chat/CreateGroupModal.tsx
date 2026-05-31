'use client';

import { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { usersApi } from '@/lib/api/client';
import { CommunityAvatar, cn, ui } from '@/features/community/ui';

interface SearchUser {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<void>;
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [step, setStep] = useState<'info' | 'members'>('info');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<SearchUser[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const reset = () => {
    setStep('info');
    setGroupName('');
    setSearchQuery('');
    setSelectedMembers([]);
    setSearchResults([]);
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await usersApi.searchCommunityUsers(query.trim());
      setSearchResults(response.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleMember = (member: SearchUser) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsCreating(true);
    try {
      await onCreateGroup(groupName.trim(), selectedMembers.map((m) => m.id));
      reset();
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-bn-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-bn-border/70">
          <h2 className="text-lg font-semibold text-bn-ink">
            {step === 'info' ? 'Create group' : 'Add members'}
          </h2>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-1 text-bn-muted hover:text-bn-ink"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'info' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-bn-ink mb-1">Group name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Fantasy Book Club"
                className={ui.input}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className={cn(ui.btnSecondary, 'flex-1')}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('members')}
                disabled={!groupName.trim()}
                className={cn(ui.btnPrimary, 'flex-1')}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'members' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bn-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchUsers(e.target.value)}
                placeholder="Search members to add…"
                className={cn(ui.input, 'pl-10')}
              />
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-bn-surface rounded-full text-sm"
                  >
                    {member.name}
                    <button type="button" onClick={() => toggleMember(member)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1">
              {isSearching ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={22} className="animate-spin text-bn-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => {
                  const selected = selectedMembers.some((m) => m.id === result.id);
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => toggleMember(result)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors',
                        selected ? 'bg-bn-primary/10 border border-bn-primary/30' : 'hover:bg-bn-surface'
                      )}
                    >
                      <CommunityAvatar name={result.name} src={result.avatarUrl || undefined} size="sm" />
                      <div>
                        <p className="font-medium text-sm text-bn-ink">{result.name}</p>
                        {result.username && (
                          <p className="text-xs text-bn-muted">@{result.username}</p>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-bn-muted py-6 text-sm">No users found</p>
              ) : null}
            </div>

            <p className="text-xs text-bn-muted">
              You can also invite more people later with a group link.
            </p>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('info')} className={cn(ui.btnSecondary, 'flex-1')}>
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={isCreating}
                className={cn(ui.btnPrimary, 'flex-1')}
              >
                {isCreating ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create group'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
