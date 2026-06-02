import { cn } from '@/lib/cn';

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8E2D9] bg-white shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'bg-[#2C3E50]/10 text-[#2C3E50]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', tones[tone])}>
      {children}
    </span>
  );
}

export function AdminButton({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}) {
  const variants = {
    primary: 'bg-[#2C3E50] text-white hover:bg-[#1A2A3A]',
    secondary: 'border border-[#E8E2D9] bg-white text-[#2C3E50] hover:bg-[#FDFBF7]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-[#B85C38] hover:underline bg-transparent',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function AdminInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-[#E8E2D9] bg-[#FDFBF7]/50 px-3 py-2.5 text-sm text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38]',
        className
      )}
      {...props}
    />
  );
}

export function AdminTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-[#E8E2D9] bg-[#FDFBF7]/50 px-3 py-2.5 text-sm text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38] min-h-[88px] resize-y',
        className
      )}
      {...props}
    />
  );
}

export function AdminSelect({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'rounded-xl border border-[#E8E2D9] bg-[#FDFBF7]/50 px-3 py-2.5 text-sm text-[#1A2A3A] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38]',
        className
      )}
      {...props}
    />
  );
}
