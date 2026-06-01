/** Marketplace book detail page for a given book id. */
export function getBookDetailPath(bookId: string): string {
  return `/market/${encodeURIComponent(bookId)}`;
}
