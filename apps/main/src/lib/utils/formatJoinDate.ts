/** Registration date for "Joined …" labels (not relative / not profile-updated) */
export function formatJoinDate(dateString: string, locale = 'en-US'): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}
