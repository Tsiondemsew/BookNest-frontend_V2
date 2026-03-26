'use client';

/**
 * Reader page - Main e-reader interface
 * Phase 2 placeholder - Full implementation in Phase 4
 */
export default function ReaderPage() {
  return (
    <div className="px-4 py-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Reader</h1>
        <p className="text-foreground/60 mt-2">
          Open a book from your library to start reading
        </p>
      </header>

      <div className="mt-8 p-8 rounded-lg border border-border text-center">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No book selected
        </h2>
        <p className="text-foreground/60">
          Choose a book from your library to begin reading
        </p>
        <a
          href="/library"
          className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Library
        </a>
      </div>
    </div>
  );
}
