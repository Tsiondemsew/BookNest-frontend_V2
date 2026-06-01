import type { BookFormatDetail } from '@/features/books/types';

/** True when admin can stream or preview this format (upload, playback URL, storage, or demo). */
export function hasPlayableContent(format: BookFormatDetail | null | undefined): boolean {
  if (!format || format.missing) return false;
  return Boolean(
    format.fileUrl ||
      format.playbackUrl ||
      format.storagePath ||
      format.isDemoContent,
  );
}
