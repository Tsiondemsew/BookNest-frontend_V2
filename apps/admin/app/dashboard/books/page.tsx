export default function BooksPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-zinc-900">Book Reviews</h1>
        <p className="mt-2 text-sm text-zinc-600">Review and approve books submitted by authors.</p>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-zinc-900">📚 Book Review System</p>
          <p className="mt-2 text-sm text-zinc-600">Coming soon - pending book submissions will appear here</p>
        </div>
      </div>
    </div>
  );
}
