export function getAdminFormatContentUrl(bookId: string, format: 'pdf' | 'audio') {
  return `/api/admin/books/${bookId}/content?format=${format}`;
}

export function isGoogleDriveUrl(url: string | null | undefined) {
  if (!url) return false;
  return /google\.com|googleusercontent\.com/i.test(url);
}

export function googleDrivePreviewUrl(url: string) {
  const match = url.match(/\/file\/d\/([^/]+)/);
  const id = match?.[1] || url.match(/[?&]id=([^&]+)/)?.[1];
  if (!id) return url;
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function googleDriveOpenUrl(url: string) {
  const match = url.match(/\/file\/d\/([^/]+)/);
  const id = match?.[1] || url.match(/[?&]id=([^&]+)/)?.[1];
  if (!id) return url;
  return `https://drive.google.com/file/d/${id}/view`;
}
