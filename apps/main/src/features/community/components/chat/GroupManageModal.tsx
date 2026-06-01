'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Search, Loader2, UserMinus, UserPlus, Crown, Link2, Copy, Check } from 'lucide-react';
import { chatApi, usersApi } from '@/lib/api/client';
import { CommunityAvatar, cn, ui } from '@/features/community/ui';
import type { ChatMember } from '@repo/types';

interface SearchUser {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
}

interface GroupManageModalProps {
  isOpen: boolean;
  chatId: string;
  groupName?: string;
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onLeftOrDeleted: () => void;
}

export function GroupManageModal({
  isOpen,
  chatId,
  groupName,
  isAdmin,
  onClose,
  onUpdated,
  onLeftOrDeleted,
}: GroupManageModalProps) {
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [canManage, setCanManage] = useState(isAdmin);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatApi.getGroupMembers(chatId);
      setMembers(response.data.members);
      setCanManage(Boolean(response.data.isAdmin));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    setCanManage(isAdmin);
  }, [isAdmin, chatId]);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery('');
    setSearchResults([]);
    setInviteLink(null);
    void loadMembers();
  }, [isOpen, loadMembers]);

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await usersApi.searchCommunityUsers(query.trim());
      const memberIds = new Set(members.map((m) => m.id));
      setSearchResults((response.data || []).filter((u) => !memberIds.has(u.id)));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = async (user: SearchUser) => {
    setIsAdding(true);
    setError(null);
    try {
      await chatApi.addGroupMember(chatId, user.id);
      setSearchQuery('');
      setSearchResults([]);
      await loadMembers();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add member');
    } finally {
      setIsAdding(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setRemovingId(memberId);
    setError(null);
    try {
      await chatApi.removeGroupMember(chatId, memberId);
      await loadMembers();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const createInviteLink = async () => {
    setIsCreatingInvite(true);
    setError(null);
    try {
      const response = await chatApi.createGroupInvite(chatId);
      setInviteLink(response.data.inviteUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create invite link');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-bn-border shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-bn-border/70 shrink-0">
          <div className="min-w-0">
            <h2 className="font-semibold text-bn-ink truncate">Manage group</h2>
            <p className="text-sm text-bn-muted truncate">{groupName || 'Group chat'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-bn-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {canManage && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-bn-ink">Add members</h3>
              <p className="text-xs text-bn-muted">Search community members to add to this group.</p>
              <h4 className="text-xs font-medium text-bn-muted uppercase tracking-wide pt-1">
                Invite link
              </h4>
              <button
                type="button"
                onClick={() => void createInviteLink()}
                disabled={isCreatingInvite}
                className={cn(ui.btnSecondary, 'w-full justify-center')}
              >
                {isCreatingInvite ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Link2 size={16} />
                )}
                Create invite link
              </button>
              {inviteLink && (
                <div className="flex items-center gap-2 rounded-xl border border-bn-border bg-bn-surface/40 px-3 py-2">
                  <a
                    href={inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-bn-primary font-medium truncate flex-1 hover:underline"
                  >
                    {inviteLink}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyInviteLink()}
                    className="text-xs font-medium text-bn-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
                    {copiedInvite ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bn-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => void searchUsers(e.target.value)}
                  placeholder="Search users to add…"
                  className={cn(ui.input, 'pl-9')}
                />
              </div>
              {isSearching && (
                <div className="flex justify-center py-2">
                  <Loader2 size={18} className="animate-spin text-bn-primary" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="border border-bn-border rounded-xl divide-y divide-bn-border/60 overflow-hidden">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      disabled={isAdding}
                      onClick={() => void addMember(user)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bn-surface text-left"
                    >
                      <CommunityAvatar name={user.name} src={user.avatarUrl} size="sm" />
                      <span className="flex-1 text-sm font-medium text-bn-ink truncate">
                        {user.name}
                      </span>
                      <UserPlus size={16} className="text-bn-primary shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-bn-ink">
              Members ({members.length})
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-bn-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-bn-border/70 px-3 py-2.5"
                  >
                    <CommunityAvatar name={member.name} src={member.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bn-ink truncate">
                        {member.name}
                        {member.isSelf ? ' (You)' : ''}
                      </p>
                      {member.isAdmin && (
                        <p className="text-xs text-bn-muted flex items-center gap-1">
                          <Crown size={12} />
                          Group admin
                        </p>
                      )}
                    </div>
                    {canManage && !member.isSelf && !member.isAdmin && (
                      <button
                        type="button"
                        onClick={() => void removeMember(member.id)}
                        disabled={removingId === member.id}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${member.name}`}
                      >
                        {removingId === member.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserMinus size={16} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="p-4 border-t border-bn-border/70 shrink-0 space-y-2">
          {!canManage && (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Leave this group?')) return;
                try {
                  await chatApi.leaveGroup(chatId);
                  onLeftOrDeleted();
                  onClose();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not leave group');
                }
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
            >
              Leave group
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={async () => {
                if (
                  !window.confirm(
                    'Delete this group for everyone? This cannot be undone.'
                  )
                ) {
                  return;
                }
                try {
                  await chatApi.deleteGroup(chatId);
                  onLeftOrDeleted();
                  onClose();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not delete group');
                }
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200"
            >
              Delete group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
