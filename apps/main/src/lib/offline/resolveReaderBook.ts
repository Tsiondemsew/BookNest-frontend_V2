import type { LibraryItem } from '@repo/types';
import { getOfflineBook, getOfflineCover } from '@/lib/db/schema';
import { fetchLibraryForQuery } from '@/lib/offline/fetchLibrary';

async function coverUrlForFormat(bookFormatId: string, fallback?: string | null): Promise<string> {
  if (fallback) return fallback;
  try {
    const blob = await getOfflineCover(bookFormatId);
    if (blob) return URL.createObjectURL(blob);
  } catch {
    /* ignore */
  }
  return '/icons/icon-192x192.png';
}

function libraryItemFromOffline(
  offline: NonNullable<Awaited<ReturnType<typeof getOfflineBook>>>,
  bookIdHint: string,
  cover: string
): LibraryItem {
  return {
    id: `offline-${offline.bookFormatId}`,
    purchased_at: offline.downloadedAt,
    progress: null,
    format: {
      id: offline.bookFormatId,
      type: offline.formatType,
      price: 0,
      currency: 'ETB',
      storage_path: '',
      file_size_bytes: offline.fileSize,
    },
    book: {
      id: offline.bookId ?? bookIdHint,
      title: offline.title,
      author_name: '—',
      cover_image_url: cover,
      language: 'en',
      status: 'published',
      created_at: offline.downloadedAt,
    },
  };
}

/** Resolve book + format for the reader from cache, library, or offline storage. */
export async function resolveReaderLibraryItem(
  bookId: string,
  formatId: string
): Promise<LibraryItem | null> {
  if (!formatId) return null;

  try {
    const library = await fetchLibraryForQuery();
    const exact = library.find(
      (item) => item.book.id === bookId && item.format.id === formatId
    );
    if (exact) return exact;

    const byFormat = library.find((item) => item.format.id === formatId);
    if (byFormat) return byFormat;
  } catch {
    /* fall through to offline-only lookup */
  }

  const offline = await getOfflineBook(formatId);
  if (!offline?.fileData) return null;

  const cover = await coverUrlForFormat(formatId, offline.coverUrl);
  return libraryItemFromOffline(offline, bookId, cover);
}
