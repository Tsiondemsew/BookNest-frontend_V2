'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton - Animated placeholder for loading content
 * Use while data is being fetched
 */
export function Skeleton({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} rounded-lg bg-foreground/10 animate-pulse`}
        />
      ))}
    </>
  );
}

/**
 * BookCardSkeleton - Loading state for book cards
 */
export function BookCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-lg border border-border">
      <div className="w-16 h-24 rounded bg-foreground/10 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}

/**
 * BookListSkeleton - Loading state for book list
 */
export function BookListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * PostSkeleton - Loading state for social posts
 */
export function PostSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-foreground/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton count={3} className="h-3" />
      <div className="flex gap-4 text-xs pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

/**
 * PostListSkeleton - Loading state for social feed
 */
export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * ProfileSkeleton - Loading state for user profile
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-foreground/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
}
