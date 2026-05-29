'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, X, Send, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore'; 
import { feedApi } from '@/lib/api/client';
import type { Post } from '@repo/types';

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    // TODO: Implement image upload to backend
    // For now, return null (no image)
    return null;
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    
    setIsSubmitting(true);
    
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || undefined;
      }
      
      const response = await feedApi.createPost({
        content: content.trim(),
        image_url: imageUrl,
      });
      
      setContent('');
      removeImage();
      onPostCreated?.(response.data);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!content.trim() && !imageFile) return;
    
    setIsSavingDraft(true);
    
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || undefined;
      }
      
      await feedApi.saveDraft({
        content: content.trim(),
        image_url: imageUrl,
      });
      
      setHasDraft(true);
      setTimeout(() => setHasDraft(false), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.publicName?.charAt(0) || 'U'}
        </div>
        
        {/* Post Input Area */}
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts about books, reading, or connect with authors..."
            className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38] resize-none min-h-[100px]"
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="rounded-lg object-cover max-h-32" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg transition-colors"
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={saveDraft}
                disabled={isSavingDraft || (!content.trim() && !imageFile)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#4A5568] hover:bg-[#F5F1EB] rounded-lg transition-colors disabled:opacity-50"
              >
                {isSavingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && !imageFile)}
                className="flex items-center gap-1 px-4 py-2 bg-[#B85C38] text-white font-medium rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
          
          {/* Draft Saved Indicator */}
          {hasDraft && (
            <p className="text-sm text-green-600 animate-pulse">Draft saved locally!</p>
          )}
        </div>
      </div>
    </div>
  );
}