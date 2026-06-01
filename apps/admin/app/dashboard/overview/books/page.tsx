import { Suspense } from 'react';
import { BooksCatalogOverview } from '@/features/overview';

function Fallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );
}

export default function BooksOverviewPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <BooksCatalogOverview />
    </Suspense>
  );
}
