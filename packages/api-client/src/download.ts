import type { ApiConfig } from './config';
import { endpoints } from './endpoints';

export function createDownloadApi(config: ApiConfig) {
  const base = config.baseUrl.replace(/\/$/, '');

  return {
    getDownloadUrl: (bookFormatId: string) =>
      `${base}${endpoints.download.book(bookFormatId)}`,
    getFormatPreviewUrl: (bookFormatId: string) =>
      `${base}${endpoints.books.formatPreview(bookFormatId)}`,
  };
}
