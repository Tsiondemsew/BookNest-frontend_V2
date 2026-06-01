export type AuthorNotificationResult = {
  notified?: boolean;
  inApp?: boolean;
  email?: boolean;
  bookNote?: boolean;
  needsSchema?: boolean;
  inAppError?: string | null;
};

export function authorNotificationToast(
  bookTitle: string,
  action: 'rejected' | 'approved' | 'changes requested',
  notification?: AuthorNotificationResult | null,
): { message: string; variant: 'success' | 'info' } {
  if (notification?.notified) {
    const channels: string[] = [];
    if (notification.inApp) channels.push('inbox');
    if (notification.bookNote) channels.push('book feedback');
    if (notification.email) channels.push('email');
    return {
      message: `"${bookTitle}" ${action}. Author notified (${channels.join(', ')}).`,
      variant: 'success',
    };
  }

  if (
    notification?.needsSchema ||
    notification?.inAppError?.includes('author_messages') ||
    notification?.inAppError?.includes('schema cache')
  ) {
    return {
      message: `"${bookTitle}" ${action}. Status saved. Run backend/scripts/admin-approval-extensions.sql in Supabase (or npm run setup:approval) for inbox + review notes.`,
      variant: 'info',
    };
  }

  return {
    message: `"${bookTitle}" ${action}. Status updated. Configure SMTP for email or run the approval SQL script for author inbox.`,
    variant: 'info',
  };
}
