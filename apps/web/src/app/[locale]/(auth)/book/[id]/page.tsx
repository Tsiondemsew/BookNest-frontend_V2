import { Metadata } from 'next';
import BookDetailClient from '@/components/BookDetailClient';

interface BookDetailPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export const metadata: Metadata = {
  title: 'Book Details - BookNest',
  description: 'View book details, reviews, and reading progress',
};

export default function BookDetailPage({ params }: BookDetailPageProps) {
  return <BookDetailClient bookId={params.id} />;
}
