interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export function AnalyticsCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-zinc-900">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}