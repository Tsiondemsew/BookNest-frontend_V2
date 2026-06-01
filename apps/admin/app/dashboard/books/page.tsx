import { Suspense } from 'react';
import { ApprovalWorkspace } from '@/features/books';

function BooksWorkspaceFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksWorkspaceFallback />}>
      <ApprovalWorkspace />
    </Suspense>
  );
}
