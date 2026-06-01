'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';

export interface LightboxImage {
  id: string;
  url: string;
  alt?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  canDelete?: boolean;
  onDelete?: (image: LightboxImage, index: number) => void | Promise<void>;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  canDelete = false,
  onDelete,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) setIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const go = useCallback(
    (delta: number) => {
      if (images.length <= 1) return;
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, go]);

  if (!isOpen || images.length === 0) return null;

  const current = images[index] ?? images[0];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <span className="text-sm tabular-nums">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          {canDelete && onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await onDelete(current, index);
                  if (images.length <= 1) {
                    onClose();
                  } else {
                    setIndex((i) => Math.min(i, images.length - 2));
                  }
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="p-2 rounded-full hover:bg-white/10 text-red-300"
              aria-label="Delete image"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 px-2 relative touch-pan-y">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt || ''}
          className="max-h-[75dvh] max-w-full object-contain select-none"
          draggable={false}
        />
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-6 pt-2 shrink-0">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? 'bg-white' : 'bg-white/35'
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
