import { MyBooksList } from '@/features/studio/components/MyBooksList';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function MyBooksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MyBooksList />
    </div>
);
}