/** Exact match, or nested path — but parent routes (e.g. /studio) do not match children (/studio/books). */
export function isNavHrefActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (pathname === href) return true;

  if (href === '/studio') return false;
  if (href === '/community') {
    return pathname.startsWith('/community/');
  }

  return pathname.startsWith(`${href}/`);
}

export function pickActiveGroupId<T extends { id: string; isActive: (pathname: string | null) => boolean }>(
  pathname: string | null,
  groups: T[]
): string | null {
  for (const group of groups) {
    if (group.isActive(pathname)) return group.id;
  }
  return null;
}
