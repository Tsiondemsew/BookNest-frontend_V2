import {
  ApiClientError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  fieldErrorsFromDetails,
} from '@repo/api-client';

export function getFriendlyAuthMessage(error: unknown): string {
  if (error instanceof UnauthorizedError) {
    return error.message;
  }

  if (error instanceof ForbiddenError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again.';
  }

  if (error instanceof ApiClientError) {
    const msg = error.message || '';
    if (msg.toLowerCase().includes('rate limit')) {
      return 'Too many emails sent. Please wait a few minutes and try again.';
    }
    if (error.status === 404) {
      return msg || 'No account found with this email.';
    }
    return msg || 'An error occurred. Please try again.';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('rate limit')) {
      return 'Too many emails sent. Please wait a few minutes and try again.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function getAuthFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiClientError && error.details?.length) {
    return fieldErrorsFromDetails(error.details);
  }
  return {};
}
