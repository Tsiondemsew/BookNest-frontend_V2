import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { SessionUser } from '@repo/types';
import { cartApi } from '@/lib/api/client';
import { getPostLoginPath, resolvePostLoginPath } from '@/lib/auth/postLoginRedirect';

export type PendingAuthAction = 'add-to-cart' | 'buy';

export type PendingAuthParams = {
  redirect: string;
  action?: PendingAuthAction | null;
  bookFormatIds?: string[];
};

export function buildLoginUrl({ redirect, action, bookFormatIds = [] }: PendingAuthParams): string {
  const params = new URLSearchParams();
  params.set('redirect', redirect);
  if (action) params.set('action', action);
  bookFormatIds.forEach((id) => params.append('book_format_id', id));
  return `/login?${params.toString()}`;
}

export function buildRegisterUrl(params: PendingAuthParams): string {
  const loginQuery = buildLoginUrl(params).split('?')[1];
  return `/register?${loginQuery}`;
}

export function appendPendingActionQuery(
  basePath: string,
  { redirect, action, bookFormatIds = [] }: PendingAuthParams
): string {
  const params = new URLSearchParams();
  if (redirect && redirect !== '/dashboard') params.set('redirect', redirect);
  if (action) params.set('action', action);
  bookFormatIds.forEach((id) => params.append('book_format_id', id));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function checkoutUrlForFormatIds(ids: string[]): string {
  if (ids.length === 1) return `/checkout?book_format_id=${ids[0]}`;
  return `/checkout?book_format_ids=${ids.join(',')}`;
}

export async function executePendingAuthAction(
  action: PendingAuthAction | null | undefined,
  bookFormatIds: string[],
  router: AppRouterInstance
): Promise<boolean> {
  if (!action || bookFormatIds.length === 0) return false;

  if (action === 'add-to-cart') {
    for (const id of bookFormatIds) {
      await cartApi.addToCart(id);
    }
    router.push('/cart');
    return true;
  }

  if (action === 'buy') {
    router.push(checkoutUrlForFormatIds(bookFormatIds));
    return true;
  }

  return false;
}

export function readPendingActionFromSearchParams(
  searchParams: URLSearchParams
): { action: PendingAuthAction | null; bookFormatIds: string[]; redirect: string } {
  const actionParam = searchParams.get('action');
  const action =
    actionParam === 'add-to-cart' || actionParam === 'buy' ? actionParam : null;
  const bookFormatIds = searchParams.getAll('book_format_id').filter(Boolean);
  const redirect = searchParams.get('redirect') || '/dashboard';
  return { action, bookFormatIds, redirect };
}

/**
 * After login/register: run pending cart/checkout action, else genre onboarding, else redirect.
 */
export async function completeAuthContinuation(
  router: AppRouterInstance,
  searchParams: URLSearchParams,
  user: SessionUser,
  options?: { needsGenreOnboarding?: boolean }
): Promise<void> {
  const { action, bookFormatIds, redirect } = readPendingActionFromSearchParams(searchParams);

  const handled = await executePendingAuthAction(action, bookFormatIds, router);
  if (handled) return;

  let destination: string;
  if (options?.needsGenreOnboarding !== undefined) {
    destination = getPostLoginPath(user, {
      needsGenreOnboarding: options.needsGenreOnboarding,
      redirectTo: redirect,
    });
    if (destination.includes('/onboarding/genres') && (action || bookFormatIds.length)) {
      destination = appendPendingActionQuery('/onboarding/genres', {
        redirect,
        action,
        bookFormatIds,
      });
    }
  } else {
    destination = await resolvePostLoginPath(user, redirect);
    if (destination.includes('/onboarding/genres') && (action || bookFormatIds.length)) {
      destination = appendPendingActionQuery('/onboarding/genres', {
        redirect,
        action,
        bookFormatIds,
      });
    }
  }

  router.push(destination);
}
