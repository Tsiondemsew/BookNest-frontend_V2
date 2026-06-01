'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Link as LinkIcon, Calendar, Settings, MessageCircle, Lock } from 'lucide-react';
import { FollowButton } from './FollowButton';
import { FollowListModal } from './FollowListModal';
import { formatJoinDate } from '@/lib/utils/formatJoinDate';
import { useTranslation } from '@/hooks/useTranslation';
import { CommunityCard, cn, ui } from '../../ui';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

type FollowListKind = 'followers' | 'following';

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
    role?: 'reader' | 'author' | 'publisher' | string;
    readingStats?: {
      current_streak: number;
      books_completed: number;
      total_pages: number;
      total_minutes: number;
    };
    achievements?: Array<{ id: string; title: string; earned_at: string }>;
  };
  onEdit?: () => void;
  onSettings?: () => void;
}

export function ProfileHeader({ profile, onEdit, onSettings }: ProfileHeaderProps) {
  const { t, locale } = useTranslation();
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [followList, setFollowList] = useState<FollowListKind | null>(null);
  const isReader = !profile.role || profile.role === 'reader';
  const joinLabel = useMemo(
    () => formatJoinDate(profile.joinedAt, locale === 'am' ? 'am-ET' : 'en-US'),
    [profile.joinedAt, locale]
  );

  const roleBadge =
    profile.role === 'author'
      ? { label: t('community.author'), className: 'bg-blue-100 text-blue-700' }
      : profile.role === 'publisher'
        ? { label: t('community.publisher'), className: 'bg-purple-100 text-purple-700' }
        : null;

  return (
    <CommunityCard className="overflow-hidden">
      <div className="relative h-32 sm:h-44 bg-gradient-to-br from-bn-accent via-bn-accent/90 to-bn-primary">
        {profile.coverUrl && !coverImageError && (
          <Image
            src={profile.coverUrl}
            alt=""
            fill
            className="object-cover opacity-90"
            onError={() => setCoverImageError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bn-ink/20 to-transparent" />
      </div>

      <div className="relative px-4 sm:px-6 pb-5 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="-mt-1">
            <button
              type="button"
              onClick={() => profile.avatarUrl && setAvatarPreviewOpen(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-bn-primary to-bn-accent flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              aria-label={profile.name}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 sm:pb-1 sm:ml-auto">
            {profile.isOwnProfile ? (
              <>
                <button type="button" onClick={onEdit} className={ui.btnSecondary}>
                  {t('profile.editProfile')}
                </button>
                <button type="button" onClick={onSettings} className={ui.btnIcon} aria-label={t('profile.settings')}>
                  <Settings size={18} />
                </button>
              </>
            ) : (
              <>
                <FollowButton
                  userId={profile.id}
                  initialIsFollowing={profile.isFollowing || false}
                  initialFollowerCount={profile.followerCount}
                />
                <Link href={`/messages?startUser=${profile.id}`} className={ui.btnIcon} aria-label={t('profile.message')}>
                  <MessageCircle size={18} />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-bn-ink tracking-tight">{profile.name}</h1>
              {roleBadge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge.className}`}>
                  {roleBadge.label}
                </span>
              )}
            </div>
            <p className={ui.caption}>@{profile.username}</p>
          </div>

          {profile.bio && <p className={ui.body}>{profile.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-bn-muted">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-bn-primary/70" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-bn-primary hover:underline"
              >
                <LinkIcon size={14} />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {joinLabel && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-bn-primary/70" />
                {t('profile.joined', { date: joinLabel })}
              </span>
            )}
          </div>

          <div className="flex gap-6 pt-3 border-t border-bn-border/60">
            <div>
              <span className="font-bold text-bn-ink tabular-nums">{profile.postCount}</span>
              <span className="text-sm text-bn-muted ml-1.5">{t('profile.posts')}</span>
            </div>
            <button
              type="button"
              onClick={() => setFollowList('followers')}
              className="text-left hover:opacity-80 transition-opacity touch-manipulation"
            >
              <span className="font-bold text-bn-ink tabular-nums">{profile.followerCount}</span>
              <span className="text-sm text-bn-muted ml-1.5">{t('profile.followers')}</span>
            </button>
            <button
              type="button"
              onClick={() => setFollowList('following')}
              className="text-left hover:opacity-80 transition-opacity touch-manipulation"
            >
              <span className="font-bold text-bn-ink tabular-nums">{profile.followingCount}</span>
              <span className="text-sm text-bn-muted ml-1.5">{t('profile.following')}</span>
            </button>
          </div>

          {isReader && profile.readingStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl bg-bn-surface border border-bn-border px-3 py-2">
                <p className="text-lg font-bold text-bn-ink tabular-nums">{profile.readingStats.current_streak}</p>
                <p className="text-xs text-bn-muted">{t('profile.dayStreak')}</p>
              </div>
              <div className="rounded-xl bg-bn-surface border border-bn-border px-3 py-2">
                <p className="text-lg font-bold text-bn-ink tabular-nums">{profile.readingStats.books_completed}</p>
                <p className="text-xs text-bn-muted">{t('profile.booksDone')}</p>
              </div>
              <div className="rounded-xl bg-bn-surface border border-bn-border px-3 py-2">
                <p className="text-lg font-bold text-bn-ink tabular-nums">{profile.readingStats.total_pages}</p>
                <p className="text-xs text-bn-muted">{t('profile.pagesRead')}</p>
              </div>
              <div className="rounded-xl bg-bn-surface border border-bn-border px-3 py-2">
                <p className="text-lg font-bold text-bn-ink tabular-nums">{profile.readingStats.total_minutes}</p>
                <p className="text-xs text-bn-muted">{t('profile.minutesListened')}</p>
              </div>
            </div>
          )}

          {isReader && profile.achievements && profile.achievements.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium text-bn-ink mb-2">{t('profile.recentAchievements')}</p>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.slice(0, 6).map((a) => (
                  <span
                    key={a.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-bn-accent/10 text-bn-accent border border-bn-accent/20"
                  >
                    {a.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.isPrivate && !profile.isOwnProfile && !profile.isFollowing && (
            <div className="flex items-center gap-2 mt-2 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-sm text-amber-900">
              <Lock size={16} className="shrink-0" />
              {t('profile.privateFollow')}
            </div>
          )}

          {profile.isPrivate && profile.isOwnProfile && (
            <div className="flex items-center gap-2 mt-2 px-3.5 py-2.5 rounded-xl bg-bn-surface border border-bn-border text-sm text-bn-muted">
              <Lock size={16} className="shrink-0 text-bn-primary" />
              {t('profile.privateOwn')}
            </div>
          )}
        </div>
      </div>

      <FollowListModal
        userId={profile.id}
        kind={followList || 'followers'}
        title={followList === 'following' ? t('profile.following') : t('profile.followers')}
        isOpen={followList !== null}
        onClose={() => setFollowList(null)}
      />

      {profile.avatarUrl && (
        <ImageLightbox
          images={[{ id: 'avatar', url: profile.avatarUrl, alt: profile.name }]}
          initialIndex={0}
          isOpen={avatarPreviewOpen}
          onClose={() => setAvatarPreviewOpen(false)}
        />
      )}
    </CommunityCard>
  );
}
