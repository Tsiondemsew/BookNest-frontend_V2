import { ApiClientError } from '@repo/api-client';

const PRODUCTION_NETWORK_MESSAGE =
  'Unable to connect right now. Please check your connection and try again.';

export function getFriendlyNetworkMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (error instanceof ApiClientError) {
    if (error.code === 'NETWORK_ERROR') {
      if (process.env.NODE_ENV === 'development') {
        return error.message;
      }
      return PRODUCTION_NETWORK_MESSAGE;
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('could not reach')) {
      return process.env.NODE_ENV === 'development'
        ? error.message
        : PRODUCTION_NETWORK_MESSAGE;
    }
    return error.message;
  }

  return fallback;
}
