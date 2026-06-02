import type { LibraryItem } from '@repo/types';
import type { OfflineBook } from '@/lib/db/schema';

/** Merge cached API library with books that exist only in offline storage. */
export function mergeLibraryWithOffline(
  cached: LibraryItem[] | null,
  offlineBooks: OfflineBook[]
): LibraryItem[] {
  const base = cached ?? [];
  const knownFormatIds = new Set(base.map((item) => item.format.id));

  const extras: LibraryItem[] = offlineBooks
    .filter((b) => !knownFormatIds.has(b.bookFormatId))
    .map((b) => ({
      id: `offline-${b.bookFormatId}`,
      purchased_at: b.downloadedAt,
      progress: null,
      format: {
        id: b.bookFormatId,
        type: b.formatType,
        price: 0,
        currency: 'ETB',
        storage_path: '',
        file_size_bytes: b.fileSize,
      },
      book: {
        id: b.bookId ?? b.bookFormatId,
        title: b.title,
        author_name: '—',
        cover_image_url: b.coverUrl ?? '/icons/icon-192x192.png',
        language: 'en',
        status: 'published',
        created_at: b.downloadedAt,
      },
    }));

  return [...base, ...extras];
}
