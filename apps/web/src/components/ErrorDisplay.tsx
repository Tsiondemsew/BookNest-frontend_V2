'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'page';
}

/**
 * ErrorDisplay - Reusable error message component
 * 
 * Variants:
 * - inline: For use within other components (smaller)
 * - page: Full page error display
 */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  variant = 'inline',
}: ErrorDisplayProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  if (variant === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-accent mb-2">
              Something went wrong
            </h1>
            <p className="text-foreground/70 mb-6">{message}</p>
            <div className="flex gap-2 justify-center">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className="p-4 rounded-lg border border-accent/30 bg-accent/5"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">⚠️</div>
        <div className="flex-1">
          <p className="text-sm text-accent font-medium">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs text-foreground/60 hover:text-foreground font-medium"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * QueryErrorBoundary - For React Query errors
 */
export function QueryErrorBoundary({
  error,
  isError,
  refetch,
}: {
  error: Error | null;
  isError: boolean;
  refetch: () => void;
}) {
  if (!isError || !error) return null;

  return (
    <ErrorDisplay
      error={error}
      onRetry={refetch}
      variant="inline"
    />
  );
}
