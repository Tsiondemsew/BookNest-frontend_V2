export function BookCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex gap-4">
        <div className="h-24 w-16 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
