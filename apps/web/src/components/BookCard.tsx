import type { Book } from '@repo/types';

interface BookCardProps {
  book: Book;
  showProgress?: boolean;
  progress?: number;
  onAddToLibrary?: (bookId: string) => void;
}

export default function BookCard({
  book,
  showProgress = false,
  progress = 0,
  onAddToLibrary,
}: BookCardProps) {
  return (
    <div className="group cursor-pointer rounded-lg border border-border bg-card hover:shadow-lg transition-shadow overflow-hidden">
      {/* Book Cover */}
      <div className="relative w-full aspect-[2/3] bg-secondary/20 overflow-hidden flex items-center justify-center">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm font-semibold text-foreground/60 line-clamp-2">{book.title}</p>
          </div>
        )}

        {/* Rating Badge */}
        {book.rating && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
            ★ {book.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{book.title}</h3>
        <p className="text-xs text-foreground/60 mt-1">{book.author}</p>

        {/* Category Tags */}
        {book.category && (
          <div className="mt-2">
            <span className="inline-block text-xs px-2 py-1 rounded bg-primary/20 text-primary">
              {book.category}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-foreground/60">Progress</span>
              <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-secondary/30">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {onAddToLibrary && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToLibrary(book.id);
            }}
            className="mt-3 w-full px-3 py-1 text-xs font-medium rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            aria-label={`Add ${book.title} to library`}
          >
            + Add to Library
          </button>
        )}
      </div>
    </div>
  );
}
