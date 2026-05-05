import * as React from 'react';
import { cn } from '../../utils';

export type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg';
};

const sizes: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-[3px]',
};

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      aria-label="Loading"
      role="status"
      className={cn(
        'animate-spin rounded-full border-zinc-300 border-t-zinc-900',
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

