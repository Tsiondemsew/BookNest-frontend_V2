'use client';

import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAdminSession } from '@/hooks/useAdminSession';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/jpg';
const MAX_SIZE_MB = 2;

type AdminAvatarUploadProps = {
  size?: 'sm' | 'lg';
  className?: string;
  /** When false, shows avatar only (used inside profile links on main pages). */
  editable?: boolean;
};

function isAllowedImage(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
  if (allowedExt.includes(ext)) return true;
  if (!file.type) return true;
  return ACCEPT.split(',').some((t) => file.type === t || file.type.startsWith('image/'));
}

function AvatarVisual({
  shownUrl,
  initials,
  dimension,
  textSize,
}: {
  shownUrl: string | null;
  initials: string;
  dimension: string;
  textSize: string;
}) {
  if (shownUrl) {
    return (
      <img
        src={shownUrl}
        alt=""
        className={`${dimension} rounded-full object-cover shadow-md ring-4 ring-indigo-100 dark:ring-indigo-900`}
      />
    );
  }

  return (
    <div
      className={`flex ${dimension} items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-bold text-white shadow-md ${textSize}`}
    >
      {initials}
    </div>
  );
}

export function AdminAvatarUpload({
  size = 'lg',
  className = '',
  editable = true,
}: AdminAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { avatarUrl, initials, refresh, patchAvatarUrl } = useAdminSession();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dimension = size === 'lg' ? 'h-28 w-28' : 'h-11 w-11';
  const iconSize = size === 'lg' ? 22 : 14;
  const textSize = size === 'lg' ? 'text-3xl' : 'text-sm';
  const shownUrl = previewUrl || avatarUrl;

  const handleFile = async (file: File | null) => {
    if (!file) return;

    if (!isAllowedImage(file)) {
      toast('Use a JPEG, PNG, or WebP image.', 'error');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast(`Image must be under ${MAX_SIZE_MB}MB.`, 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      let payload: {
        success?: boolean;
        message?: string;
        error?: { message?: string };
        data?: { user?: { avatarUrl?: string | null }; avatar_url?: string };
      } = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to upload photo'));
      }

      const nextUrl =
        payload.data?.user?.avatarUrl ??
        payload.data?.avatar_url ??
        null;

      if (nextUrl) {
        patchAvatarUrl(nextUrl);
      } else {
        await refresh();
      }

      setPreviewUrl(null);
      toast('Profile photo updated', 'success');
    } catch (err) {
      setPreviewUrl(null);
      toast(err instanceof Error ? err.message : 'Failed to upload photo', 'error');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  if (!editable) {
    return (
      <span
        className={`block shrink-0 ${dimension} ${className}`}
        aria-hidden
      >
        <AvatarVisual
          shownUrl={shownUrl}
          initials={initials}
          dimension={dimension}
          textSize={textSize}
        />
      </span>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`group relative block rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 ${dimension} ${size === 'lg' ? 'mx-auto' : ''}`}
        aria-label={avatarUrl ? 'Change profile photo' : 'Add profile photo'}
      >
        <AvatarVisual
          shownUrl={shownUrl}
          initials={initials}
          dimension={dimension}
          textSize={textSize}
        />

        <span
          className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition group-hover:opacity-100 ${
            uploading ? 'opacity-100' : ''
          }`}
        >
          {uploading ? (
            <Loader2 className="animate-spin text-white" size={iconSize} />
          ) : (
            <Camera className="text-white" size={iconSize} />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
