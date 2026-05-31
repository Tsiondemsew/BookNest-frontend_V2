'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  X,
  Send,
  Save,
  Loader2,
  Smile,
  AtSign,
  BookOpen,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { feedApi, usersApi, booksApi } from '@/lib/api/client';
import type { Post, CommunityUserSearchResult, PostTag } from '@repo/types';

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
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [tagMode, setTagMode] = useState<'user' | 'book' | null>(null);
  const [userHits, setUserHits] = useState<CommunityUserSearchResult[]>([]);
  const [bookHits, setBookHits] = useState<BookHit[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<CommunityUserSearchResult[]>([]);
  const [taggedBooks, setTaggedBooks] = useState<BookHit[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadDrafts = async () => {
    try {
      const res = await feedApi.getMyPosts(true, 1, 10);
      setDrafts((res.data.posts || []).filter((p) => p.status === 'draft'));
    } catch {
      setDrafts([]);
    }
  };

  useEffect(() => {
    void loadDrafts();
  }, []);

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
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetComposer = () => {
    setContent('');
    removeImage();
    setTaggedUsers([]);
    setTaggedBooks([]);
    setEditingDraftId(null);
    setTagMode(null);
    setTagQuery('');
    setShowEmoji(false);
  };

  const tagsFromDraft = (tags: PostTag[] = []) => {
    const users: CommunityUserSearchResult[] = [];
    const books: BookHit[] = [];
    for (const tag of tags) {
      if (tag.type === 'user') {
        users.push({
          id: tag.id,
          name: tag.name,
          username: tag.username,
          avatarUrl: tag.avatarUrl,
          role: 'reader',
        });
      } else {
        books.push({ id: tag.id, title: tag.title, cover_url: tag.coverUrl });
      }
    }
    return { users, books };
  };

  const loadDraftIntoEditor = (draft: Post) => {
    const { users, books } = tagsFromDraft(draft.tags);
    setEditingDraftId(draft.id);
    setContent(draft.content || '');
    setTaggedUsers(users);
    setTaggedBooks(books);
    setImageFile(null);
    setExistingImageUrl(draft.imageUrl || null);
    setImagePreview(draft.imageUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowDrafts(false);
    setMessage(null);
    textareaRef.current?.focus();
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

  const buildPayload = async () => {
    let imageUrl: string | null | undefined;
    if (imageFile) {
      imageUrl = (await uploadImage(imageFile)) ?? null;
    } else if (existingImageUrl) {
      imageUrl = existingImageUrl;
    } else {
      imageUrl = null;
    }

    return {
      content: content.trim(),
      image_url: imageUrl,
      tagged_users: taggedUsers.map((u) => u.id),
      tagged_books: taggedBooks.map((b) => b.id),
    };
  };

  const hasDraftContent = () => Boolean(content.trim() || imageFile || existingImageUrl);

  const handleSubmit = async () => {
    if (!hasDraftContent()) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload = await buildPayload();

      if (editingDraftId) {
        await feedApi.updateDraft(editingDraftId, payload);
        const response = await feedApi.publishDraft(editingDraftId);
        resetComposer();
        await loadDrafts();
        onPostCreated?.(response.data);
        setMessage('Draft published!');
      } else {
        const response = await feedApi.createPost(payload);
        resetComposer();
        onPostCreated?.(response.data);
        setMessage('Posted!');
      }

      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Failed to publish post:', error);
      setMessage(editingDraftId ? 'Could not publish draft' : 'Could not publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!hasDraftContent()) return;
    setIsSavingDraft(true);
    setMessage(null);
    try {
      const payload = await buildPayload();

      if (editingDraftId) {
        await feedApi.updateDraft(editingDraftId, payload);
        setMessage('Draft updated');
      } else {
        const res = await feedApi.saveDraft(payload);
        setEditingDraftId(res.data.id);
        setExistingImageUrl(res.data.imageUrl || null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setMessage('Draft saved');
      }

      await loadDrafts();
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setMessage('Could not save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const publishDraft = async (draftId: string) => {
    try {
      if (editingDraftId === draftId) {
        await handleSubmit();
        return;
      }

      const res = await feedApi.publishDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      onPostCreated?.(res.data);
      setShowDrafts(false);
      setMessage('Draft published!');
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Failed to publish draft:', error);
      setMessage('Could not publish draft');
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      await feedApi.deletePost(draftId);
      if (editingDraftId === draftId) resetComposer();
      await loadDrafts();
      setMessage('Draft deleted');
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Failed to delete draft:', error);
      setMessage('Could not delete draft');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.publicName?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 space-y-3">
          {editingDraftId && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80">
              <p className="text-sm font-medium text-amber-900">Editing draft</p>
              <button
                type="button"
                onClick={resetComposer}
                className="text-xs font-semibold text-amber-800 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a thought, reading update, or book recommendation…"
            className="w-full px-3 py-2.5 border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 resize-none min-h-[110px] text-[#1A2A3A]"
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
                placeholder={tagMode === 'user' ? 'Search people…' : 'Search books in market…'}
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
                Cancel
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
              <img src={imagePreview} alt="Preview" className="rounded-xl object-cover max-h-48 border border-[#E8E2D9]" />
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
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title="Emoji"
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                onClick={() => { setTagMode('user'); setTagQuery(''); }}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title="Tag user"
              >
                <AtSign size={20} />
              </button>
              <button
                type="button"
                onClick={() => { setTagMode('book'); setTagQuery(''); }}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title="Tag book"
              >
                <BookOpen size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowDrafts((v) => !v)}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg"
                title="Drafts"
              >
                <FileText size={20} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={isSavingDraft || !hasDraftContent()}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#4A5568] hover:bg-[#F5F1EB] rounded-xl disabled:opacity-50"
              >
                {isSavingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingDraftId ? 'Save changes' : 'Draft'}
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !hasDraftContent()}
                className="flex items-center gap-1 px-4 py-2 bg-[#B85C38] text-white font-semibold rounded-xl hover:bg-[#A04E2F] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {editingDraftId ? 'Publish' : 'Post'}
              </button>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('Could not') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          {showDrafts && (
            <div className="border-t border-[#E8E2D9] pt-3 space-y-2">
              <p className="text-sm font-medium text-[#1A2A3A]">Your drafts</p>
              {drafts.length === 0 ? (
                <p className="text-sm text-[#4A5568]">No drafts yet</p>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-start justify-between gap-2 p-3 rounded-xl border ${
                      editingDraftId === d.id
                        ? 'border-[#B85C38] bg-[#FFF8F5]'
                        : 'border-transparent bg-[#F5F1EB]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A2A3A] line-clamp-2">{d.content || '(image draft)'}</p>
                      {d.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.imageUrl} alt="" className="mt-2 h-14 w-14 rounded-lg object-cover border border-[#E8E2D9]" />
                      )}
                      <p className="text-xs text-[#4A5568] mt-1">
                        {d.tags?.length ? `${d.tags.length} tag(s) · ` : ''}
                        Saved {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadDraftIntoEditor(d)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#2C3E50] hover:underline"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void publishDraft(d.id)}
                        className="text-xs font-semibold text-[#B85C38] hover:underline"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteDraft(d.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
