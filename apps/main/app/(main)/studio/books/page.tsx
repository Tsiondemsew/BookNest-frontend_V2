import { MyBooksList } from '@/features/studio/components/MyBooksList';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MyBooksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1A2A3A]">My Books</h2>
          <p className="text-sm text-[#4A5568]">Manage drafts and approved books</p>
        </div>
        <Link
          href="/studio/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B85C38] text-white rounded-lg text-sm font-medium hover:bg-[#8E735B] transition-colors"
        >
          Upload Book
        </Link>
      </div>
      <MyBooksList />
    </div>
);
}