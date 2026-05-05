import * as React from 'react';
import { cn } from '../../utils';

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
};

export function Card({ className, as: Comp = 'div', ...props }: CardProps) {
  return (
    <Comp
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm',
        'transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}

