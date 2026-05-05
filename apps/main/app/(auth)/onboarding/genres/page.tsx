import { GenreSelection } from '@/features/auth/components/GenreSelection';

async function getGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books/genres`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load genres');
  }

  const payload = await res.json();
  return payload?.data || [];
}

export default async function GenresPage() {
  const genres = await getGenres();

  return <GenreSelection genres={genres} />;
}