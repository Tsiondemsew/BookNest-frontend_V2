'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Link as LinkIcon, Calendar, Settings, MessageCircle } from 'lucide-react';
import { FollowButton } from './FollowButton';
import { formatRelativeTime } from '../../utils/timeFormat';
import Link from 'next/link';
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
                />
                <button
                  onClick={onMessage}
                  className="p-1.5 border border-[#E8E2D9] rounded-full hover:bg-[#F5F1EB] transition-colors"
                >
                  <MessageCircle size={16} />
                </button>
              
  <Link
    href={`/messages/new?user=${profile.id}`}
    className="p-1.5 border border-[#E8E2D9] rounded-full hover:bg-[#F5F1EB] transition-colors"
  >
    <MessageCircle size={16} />
  </Link>
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
            <div>
              <span className="font-semibold text-[#1A2A3A]">{profile.followerCount}</span>
              <span className="text-sm text-[#4A5568] ml-1">followers</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A2A3A]">{profile.followingCount}</span>
              <span className="text-sm text-[#4A5568] ml-1">following</span>
            </div>
          </div>

          {/* Private Account Badge */}
          {profile.isPrivate && profile.isOwnProfile && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-800">
              Your account is private. Only followers can see your posts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}