'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useMyLibrary } from '@/features/library/hooks/useMyLibrary';


export  function LibraryShell() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { data: items, isLoading: isLibraryLoading, isError } = useMyLibrary();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please login to view your library.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 text-black">
        <h1 className="text-3xl font-bold">My Library</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      
      <p className="text-gray-600 mb-8">
        Welcome back, {user.publicName && user.role}!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isError && (
          <div className="col-span-full text-center py-12 text-red-600">
            Failed to load your library.
          </div>
        )}

        {(isLibraryLoading || !items) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading your library…
          </div>
        )}

        {items?.length === 0 && !isLibraryLoading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No purchases yet. Browse the marketplace to buy your first book.
          </div>
        )}

        {items?.map((item) => {
          const book = item.book;
          const format = item.format;
          if (!book || !format) return null;
          return (
            <Link
              key={item.ownershipId}
              href={`/reader/${format.id}`}
              className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[2/3] bg-gray-100">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {book.author_name ?? 'Unknown author'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Format: {format.format_type}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}