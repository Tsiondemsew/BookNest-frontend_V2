'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { CommentsFloatPanel } from '../comments/CommentsFloatPanel';
import { ShareButton } from '../interactions/ShareButton';
import { ReportButton } from '../interactions/ReportButton';
import { PostTags } from './PostTags';
import { useFormatRelativeTime } from '../../utils/timeFormat';
import { useAuthStore } from '@/stores/authStore';
import { feedApi } from '@/lib/api/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { useDismissPostNotificationWhenSeen } from '@/lib/notifications/dismissOnView';
import { useDialog } from '@/components/feedback';
import type { Post } from '@repo/types';

interface FeedPostProps {
  post: Post;
  highlighted?: boolean;
  onLikeToggle?: (postId: string, nextLiked: boolean) => void;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  showComments?: boolean;
}

export function FeedPost({
  post,
  highlighted = false,
  onLikeToggle,
  onPostUpdated,
  onPostDeleted,
  showComments = false,
}: FeedPostProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { alert, confirm } = useDialog();
  const postRef = useRef<HTMLElement>(null);
  useDismissPostNotificationWhenSeen(post.id, postRef);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);
  const formatRelativeTime = useFormatRelativeTime();
  const menuRef = useRef<HTMLDivElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(showComments);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayContent, setDisplayContent] = useState(post.content);

  const isOwner = user?.id === post.author.id;

  useEffect(() => {
    setDisplayContent(post.content);
    setEditContent(post.content);
  }, [post.content]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    onLikeToggle?.(post.id, nextLiked);
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    try {
      const response = await feedApi.updatePost(post.id, { content: trimmed });
      const updated = response.data;
      setDisplayContent(updated.content);
      setIsEditing(false);
      setMenuOpen(false);
      onPostUpdated?.({ ...post, content: updated.content });
    } catch (error) {
      console.error('Failed to update post:', error);
      await alert(t('community.updateFailed'), { title: 'Update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete post?',
      description: t('community.deleteConfirm'),
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
    if (!ok) return;

    setIsDeleting(true);
    try {
      await feedApi.deletePost(post.id);
      setMenuOpen(false);
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      await alert(t('community.deleteFailed'), { title: 'Delete failed' });
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'author':
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            {t('community.author')}
          </span>
        );
      case 'publisher':
        return (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            {t('community.publisher')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article
      ref={postRef}
      id={`post-${post.id}`}
      className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow scroll-mt-24 ${
        highlighted
          ? 'border-[#B85C38] ring-2 ring-[#B85C38]/30 shadow-md'
          : 'border-[#E8E2D9]'
      }`}
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/@${encodeURIComponent(post.author.username)}`}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold overflow-hidden">
              {post.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1A2A3A]">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
                {post.isFromFollowing && (
                  <span className="text-xs bg-[#B85C38]/10 text-[#B85C38] px-1.5 py-0.5 rounded font-medium">
                    {t('community.following')}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#4A5568]">
                @{post.author.username} • {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            {!isOwner && <ReportButton targetId={post.id} type="post" />}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((value) => !value);
                  }}
                  className="p-1 text-[#4A5568] hover:text-[#1A2A3A] touch-manipulation"
                  aria-label={t('community.postOptions')}
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E8E2D9] rounded-xl shadow-lg py-1 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#F5F1EB] text-left"
                    >
                      <Pencil size={14} />
                      {t('community.editPost')}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void handleDelete()}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#F5F1EB] text-left text-red-600"
                    >
                      <Trash2 size={14} />
                      {t('community.deletePost')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handleSaveEdit();
                }
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditContent(displayContent);
                }
              }}
              rows={4}
              autoFocus
              className="w-full px-3 py-2 border border-[#E8E2D9] rounded-xl text-[#1A2A3A] focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 resize-none text-sm"
            />
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(displayContent);
                }}
                className="p-2 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] transition-colors"
                aria-label={t('community.cancelEdit')}
              >
                <X size={18} />
              </button>
              <button
                type="button"
                disabled={!editContent.trim() || isSaving}
                onClick={() => void handleSaveEdit()}
                className="p-2 rounded-lg bg-[#B85C38] text-white hover:bg-[#A04E2F] disabled:opacity-50 transition-colors"
                aria-label={t('community.saveEdit')}
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[#1A2A3A] whitespace-pre-wrap leading-relaxed">{displayContent}</p>
        )}
        {post.tags && post.tags.length > 0 && <PostTags tags={post.tags} />}
        {post.imageUrl && (
          <>
            <button
              type="button"
              onClick={() => setImageLightboxOpen(true)}
              className="mt-3 block w-full rounded-xl overflow-hidden border border-[#E8E2D9] hover:ring-2 hover:ring-[#B85C38]/30 transition-shadow text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={t('community.postImageAlt')}
                className="w-full object-cover max-h-[28rem] cursor-zoom-in"
              />
            </button>
            <ImageLightbox
              images={[{ id: post.id, url: post.imageUrl, alt: t('community.postImageAlt') }]}
              isOpen={imageLightboxOpen}
              onClose={() => setImageLightboxOpen(false)}
            />
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#E8E2D9] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-[#4A5568] hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors"
            aria-label={t('community.openComments')}
          >
            <MessageCircle size={18} />
            <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
          </button>

          <ShareButton
            postId={post.id}
            post={post}
            shareCount={shareCount}
            onShareCountChange={setShareCount}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsSaved(!isSaved)}
          className="text-[#4A5568] hover:text-[#B85C38] transition-colors"
        >
          <Bookmark size={18} fill={isSaved ? '#B85C38' : 'none'} />
        </button>
      </div>

      <CommentsFloatPanel
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        authorName={post.author.name}
        authorUsername={post.author.username}
        postPreview={displayContent}
        commentCount={post.commentCount}
      />
    </article>
  );
}
