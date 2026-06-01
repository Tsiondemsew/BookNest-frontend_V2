'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  X,
  Send,
  Loader2,
  Smile,
  AtSign,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { feedApi, usersApi, booksApi } from '@/lib/api/client';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post, CommunityUserSearchResult } from '@repo/types';

const EMOJI_QUICK = ['📚', '❤️', '🔥', '✨', '👏', '🎧', '📖', '💡', '🙂', '🎉'];

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

interface BookHit {
  id: string;
  title: string;
  cover_url?: string | null;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [tagMode, setTagMode] = useState<'user' | 'book' | null>(null);
  const [userHits, setUserHits] = useState<CommunityUserSearchResult[]>([]);
  const [bookHits, setBookHits] = useState<BookHit[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<CommunityUserSearchResult[]>([]);
  const [taggedBooks, setTaggedBooks] = useState<BookHit[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!tagMode || tagQuery.length < 2) {
      setUserHits([]);
      setBookHits([]);
      return;
    }

    const t = setTimeout(async () => {
      if (tagMode === 'user') {
        const res = await usersApi.searchCommunityUsers(tagQuery);
        setUserHits(res.data || []);
      } else {
        const res = await booksApi.getBooks({ search: tagQuery, limit: 8 });
        setBookHits((res.data?.books || []) as BookHit[]);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [tagQuery, tagMode]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetComposer = () => {
    setContent('');
    removeImage();
    setTaggedUsers([]);
    setTaggedBooks([]);
    setTagMode(null);
    setTagQuery('');
    setShowEmoji(false);
  };

  const uploadImage = async (file: File): Promise<string | undefined> => {
    const res = await feedApi.uploadPostImage(file);
    return res.data.image_url;
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const addUserTag = (u: CommunityUserSearchResult) => {
    if (!taggedUsers.find((x) => x.id === u.id)) {
      setTaggedUsers((prev) => [...prev, u]);
      setContent((prev) => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}@${u.username || u.name} `);
    }
    setTagMode(null);
    setTagQuery('');
  };

  const addBookTag = (b: BookHit) => {
    if (!taggedBooks.find((x) => x.id === b.id)) {
      setTaggedBooks((prev) => [...prev, b]);
      setContent((prev) => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}📖 ${b.title} `);
    }
    setTagMode(null);
    setTagQuery('');
  };

  const hasContent = () => Boolean(content.trim() || imageFile);

  const handleSubmit = async () => {
    if (!hasContent()) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = (await uploadImage(imageFile)) ?? null;
      }

      const response = await feedApi.createPost({
        content: content.trim(),
        image_url: imageUrl,
        tagged_users: taggedUsers.map((u) => u.id),
        tagged_books: taggedBooks.map((b) => b.id),
      });

      resetComposer();
      onPostCreated?.(response.data);
      setMessage(t('community.posted'));
      setMessageIsError(false);
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Failed to publish post:', error);
      setMessage(t('community.publishFailed'));
      setMessageIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4 sm:p-6">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.publicName?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 space-y-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('community.composerPlaceholder')}
            className="w-full px-3 py-2.5 border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 resize-none min-h-[140px] text-[#1A2A3A]"
          />

          {(taggedUsers.length > 0 || taggedBooks.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {taggedUsers.map((u) => (
                <span key={u.id} className="text-xs px-2.5 py-1 rounded-full bg-[#F5F1EB] text-[#B85C38]">
                  @{u.username || u.name}
                </span>
              ))}
              {taggedBooks.map((b) => (
                <Link
                  key={b.id}
                  href={`/market/${b.id}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#E8F4FD] text-[#2C3E50] hover:underline"
                >
                  📖 {b.title}
                </Link>
              ))}
            </div>
          )}

          {tagMode && (
            <div className="border border-[#E8E2D9] rounded-xl p-2 bg-[#FDFBF7]">
              <input
                autoFocus
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder={tagMode === 'user' ? t('community.searchPeople') : t('community.searchBooks')}
                className="w-full px-2 py-1.5 text-sm border border-[#E8E2D9] rounded-lg mb-2"
              />
              <ul className="max-h-36 overflow-y-auto space-y-1">
                {tagMode === 'user' &&
                  userHits.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => addUserTag(u)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-white"
                      >
                        {u.name} <span className="text-[#4A5568]">@{u.username}</span>
                      </button>
                    </li>
                  ))}
                {tagMode === 'book' &&
                  bookHits.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => addBookTag(b)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-white"
                      >
                        {b.title}
                      </button>
                    </li>
                  ))}
              </ul>
              <button type="button" onClick={() => setTagMode(null)} className="text-xs text-[#4A5568] mt-1">
                {t('community.cancel')}
              </button>
            </div>
          )}

          {showEmoji && (
            <div className="flex flex-wrap gap-1 p-2 bg-[#F5F1EB] rounded-xl">
              {EMOJI_QUICK.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => insertEmoji(e)}
                  className="text-xl hover:scale-110 transition-transform p-1"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {imagePreview && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt={t('community.imagePreview')} className="rounded-xl object-cover max-h-48 border border-[#E8E2D9]" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title={t('community.addImage')}
              >
                <ImageIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title={t('community.emoji')}
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagMode('user');
                  setTagQuery('');
                }}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title={t('community.tagUser')}
              >
                <AtSign size={20} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagMode('book');
                  setTagQuery('');
                }}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title={t('community.tagBook')}
              >
                <BookOpen size={20} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !hasContent()}
              className="flex items-center gap-1 px-5 py-2.5 bg-[#B85C38] text-white font-semibold rounded-xl hover:bg-[#A04E2F] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {t('community.post')}
            </button>
          </div>

          {message && (
            <p className={`text-sm ${messageIsError ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
