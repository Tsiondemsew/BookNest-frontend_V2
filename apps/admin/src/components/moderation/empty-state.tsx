export function EmptyState({
  title,
  description,
  icon = '📚',
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-8 py-16 text-center dark:border-slate-600 dark:bg-slate-900/40">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
