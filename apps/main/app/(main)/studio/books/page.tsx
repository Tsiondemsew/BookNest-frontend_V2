import { AuthorSubmissionCalendar } from '@/features/studio/components/AuthorSubmissionCalendar';
import { MyBooksList } from '@/features/studio/components/MyBooksList';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MyBooksPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">My Books</h1>
        <p className="text-sm text-[#4A5568] mt-1">
          Track submissions, pending reviews, and what changed when you resubmit.
        </p>
      </div>
      <AuthorSubmissionCalendar />
      <MyBooksList />
    </div>
  );
}
