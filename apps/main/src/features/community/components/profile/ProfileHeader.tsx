'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Link as LinkIcon, Calendar, Settings, MessageCircle } from 'lucide-react';
import { FollowButton } from './FollowButton';
import { formatRelativeTime } from '../../utils/timeFormat';
import Link from 'next/link';
import { followApi } from '@/lib/api/follow';
interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    location?: string | null;
    website?: string | null;
    joinedAt: string;
    followerCount: number;
    followingCount: number;
    postCount: number;
    isFollowing?: boolean;
    isOwnProfile: boolean;
    isPrivate: boolean;
  };
  onMessage?: () => void;
  onEdit?: () => void;
  onSettings?: () => void;
}

export function ProfileHeader({ profile, onMessage, onEdit, onSettings }: ProfileHeaderProps) {
  const [coverImageError, setCoverImageError] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [followingCount] = useState(profile.followingCount);
  const [listType, setListType] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<Array<{ id: string; name: string; email?: string; avatarUrl?: string; bio?: string }>>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  const openUserList = async (type: 'followers' | 'following') => {
    setListType(type);
    setIsListLoading(true);
    try {
      const response =
        type === 'followers'
          ? await followApi.getFollowers(profile.id, 1, 50)
          : await followApi.getFollowing(profile.id, 1, 50);
      setListUsers(type === 'followers' ? response.data.followers : response.data.following);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      setListUsers([]);
    } finally {
      setIsListLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-40 bg-gradient-to-r from-[#2C3E50] to-[#B85C38]">
        {profile.coverUrl && !coverImageError && (
          <Image
            src={profile.coverUrl}
            alt="Cover"
            fill
            className="object-cover"
            onError={() => setCoverImageError(true)}
          />
        )}
      </div>

      {/* Avatar & Actions */}
      <div className="relative px-4 pb-4">
        <div className="flex justify-between items-start">
          <div className="relative -mt-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.name} width={96} height={96} className="rounded-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {profile.isOwnProfile ? (
              <>
                <button
                  onClick={onEdit}
                  className="px-4 py-1.5 text-sm font-medium border border-[#E8E2D9] rounded-full hover:bg-[#F5F1EB] transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={onSettings}
                  className="p-1.5 border border-[#E8E2D9] rounded-full hover:bg-[#F5F1EB] transition-colors"
                >
                  <Settings size={16} />
                </button>
              </>
            ) : (
              <>
                <FollowButton
                  userId={profile.id}
                  initialIsFollowing={profile.isFollowing || false}
                  initialFollowerCount={profile.followerCount}
                  onFollowChange={({ followerCount: nextCount }) => setFollowerCount(nextCount)}
                />
                <button
                  onClick={onMessage || (() => { window.location.href = `/messages/new?user=${profile.id}`; })}
                  className="p-1.5 border border-[#E8E2D9] rounded-full hover:bg-[#F5F1EB] transition-colors"
                >
                  <MessageCircle size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-3">
          <h1 className="text-xl font-bold text-[#1A2A3A]">{profile.name}</h1>
          <p className="text-sm text-[#4A5568]">@{profile.username}</p>
          
          {profile.bio && (
            <p className="mt-2 text-[#1A2A3A]">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#4A5568]">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#B85C38] hover:underline"
              >
                <LinkIcon size={14} />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Joined {formatRelativeTime(profile.joinedAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-[#E8E2D9]">
            <div>
              <span className="font-semibold text-[#1A2A3A]">{profile.postCount}</span>
              <span className="text-sm text-[#4A5568] ml-1">posts</span>
            </div>
            <button onClick={() => openUserList('followers')} className="hover:opacity-80 transition-opacity">
              <span className="font-semibold text-[#1A2A3A]">{followerCount}</span>
              <span className="text-sm text-[#4A5568] ml-1">followers</span>
            </button>
            <button onClick={() => openUserList('following')} className="hover:opacity-80 transition-opacity">
              <span className="font-semibold text-[#1A2A3A]">{followingCount}</span>
              <span className="text-sm text-[#4A5568] ml-1">following</span>
            </button>
          </div>

          {/* Private Account Badge */}
          {profile.isPrivate && profile.isOwnProfile && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-800">
              Your account is private. Only followers can see your posts.
            </div>
          )}
        </div>
      </div>
      {listType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setListType(null)}>
          <div className="w-full max-w-md rounded-xl bg-white border border-[#E8E2D9] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A2A3A] capitalize">{listType}</h3>
              <button onClick={() => setListType(null)} className="text-sm text-[#4A5568] hover:text-[#1A2A3A]">Close</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {isListLoading ? (
                <p className="text-sm text-[#4A5568]">Loading...</p>
              ) : listUsers.length === 0 ? (
                <p className="text-sm text-[#4A5568]">No users yet.</p>
              ) : (
                listUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/${user.email?.split('@')[0] || user.name}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F5F1EB]"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-sm font-semibold">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.name} width={36} height={36} className="rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A2A3A] truncate">{user.name}</p>
                      {user.bio && <p className="text-xs text-[#4A5568] truncate">{user.bio}</p>}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}