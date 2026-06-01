'use client';

interface NavCountBadgeProps {
  count: number;
  /** Pill beside label text */
  inline?: boolean;
  /** Dot on top-right of an icon button */
  overlay?: boolean;
  className?: string;
}

function displayCount(count: number) {
  return count > 99 ? '99+' : String(count);
}

export function NavCountBadge({ count, inline, overlay, className = '' }: NavCountBadgeProps) {
  if (count <= 0) return null;

  const label = displayCount(count);

  if (overlay) {
    return (
      <span
        className={`absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] px-0.5 rounded-full bg-[#B85C38] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white tabular-nums pointer-events-none ${className}`}
        aria-hidden
      >
        {label}
      </span>
    );
  }

  if (inline) {
    return (
      <span
        className={`ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[#B85C38] text-white text-[10px] font-bold tabular-nums ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#B85C38] text-white text-[10px] font-bold tabular-nums ${className}`}
    >
      {label}
    </span>
  );
}
