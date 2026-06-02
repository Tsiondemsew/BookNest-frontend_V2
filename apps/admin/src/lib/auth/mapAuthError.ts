import {
  ApiClientError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '@repo/api-client';

export function getFriendlyAuthMessage(error: unknown): string {
  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof ValidationError
  ) {
    return error.message;
  }
  if (error instanceof ApiClientError) {
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      return 'Cannot reach the backend. Set NEXT_PUBLIC_API_URL to your Railway URL and redeploy.';
    }
    return error.message || 'Request failed';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
