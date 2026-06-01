'use client';

import { useMemo, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { ImageLightbox, type LightboxImage } from '@/components/ui/ImageLightbox';
import type { ProfilePhoto } from '@repo/types';

interface ProfilePhotoGridProps {
  avatarUrl?: string | null;
  photos?: ProfilePhoto[];
  canEdit?: boolean;
  onAddPhoto?: (file: File) => Promise<void>;
  onDeletePhoto?: (photoId: string) => Promise<void>;
  isUploading?: boolean;
  avatarSize?: 'md' | 'lg';
}

export function ProfilePhotoGrid({
  avatarUrl,
  photos = [],
  canEdit = false,
  onAddPhoto,
  onDeletePhoto,
  isUploading = false,
  avatarSize = 'md',
}: ProfilePhotoGridProps) {
  const mainSize =
    avatarSize === 'lg'
      ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md'
      : 'w-16 h-16 rounded-xl';
  const thumbSize = avatarSize === 'lg' ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-xl';
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const galleryImages: LightboxImage[] = useMemo(() => {
    const items: LightboxImage[] = [];
    if (avatarUrl) {
      items.push({ id: 'avatar', url: avatarUrl, alt: 'Profile photo' });
    }
    for (const p of photos) {
      items.push({ id: p.id, url: p.imageUrl, alt: 'Profile photo' });
    }
    return items;
  }, [avatarUrl, photos]);

  const openAt = (id: string) => {
    const idx = galleryImages.findIndex((g) => g.id === id);
    if (idx >= 0) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  };

  const thumbs = galleryImages;

  if (thumbs.length === 0 && !canEdit) return null;

  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        {thumbs.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openAt(img.id)}
            className={`${index === 0 && avatarUrl ? mainSize : thumbSize} overflow-hidden border border-[#E8E2D9] hover:ring-2 hover:ring-[#B85C38]/40 transition-shadow flex-shrink-0`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {canEdit && onAddPhoto && (
          <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E8E2D9] flex items-center justify-center cursor-pointer hover:border-[#B85C38] hover:bg-[#F5F1EB]/50 transition-colors">
            {isUploading ? (
              <Loader2 size={20} className="animate-spin text-[#B85C38]" />
            ) : (
              <Plus size={20} className="text-[#B85C38]" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) void onAddPhoto(file);
              }}
            />
          </label>
        )}
      </div>

      <ImageLightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        canDelete={canEdit && Boolean(onDeletePhoto)}
        onDelete={async (image) => {
          if (image.id === 'avatar') return;
          await onDeletePhoto?.(image.id);
        }}
      />
    </>
  );
}
