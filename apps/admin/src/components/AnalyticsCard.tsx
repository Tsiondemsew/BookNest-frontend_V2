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
    <div className="rounded-3xl bg-card p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl bg-surface p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}