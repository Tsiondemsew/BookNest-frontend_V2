'use client';

export function TopSoldBooksButtons({
  data,
  loading,
  selectedBookId,
  onSelectBook,
}: {
  data: Array<{ bookId: string; title: string; sold: number }>;
  loading?: boolean;
  selectedBookId?: string | null;
  onSelectBook?: (bookId: string | null) => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 animate-pulse rounded-full bg-surface" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <p className="text-xs text-muted">No sold books in this period.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((book) => {
        const active = selectedBookId === book.bookId;
        return (
          <button
            key={book.bookId}
            type="button"
            onClick={() => onSelectBook?.(active ? null : book.bookId)}
            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-left text-xs font-semibold transition ${
              active
                ? 'border-primary bg-primary text-white shadow-md'
                : 'border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5'
            }`}
            title={book.title}
          >
            <span className="truncate">{book.title}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}
            >
              {book.sold} sold
            </span>
          </button>
        );
      })}
      {selectedBookId && (
        <button
          type="button"
          onClick={() => onSelectBook?.(null)}
          className="rounded-full border border-dashed border-border px-3 py-2 text-xs font-medium text-muted hover:text-foreground"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
