interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  change,
  bgColor = 'bg-white',
}: StatsCardProps) {
  return (
    <div
      className={`${bgColor} rounded-lg border border-zinc-200 p-6 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          {change && (
            <p
              className={`mt-2 text-xs font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}% from last month
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
