'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type LucideIcon, ArrowLeft } from 'lucide-react';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const ui = {
  page: 'max-w-4xl mx-auto px-4 py-6',
  card: 'bg-white rounded-2xl border border-[#E8E2D9] shadow-sm',
  cardPad: 'bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-5 sm:p-6',
  body: 'text-sm text-[#4A5568] leading-relaxed',
  caption: 'text-xs text-[#4A5568]',
  input:
    'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-[#1A2A3A] placeholder:text-[#4A5568]/70 focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#B85C38] text-white text-sm font-semibold hover:bg-[#A04E2F] transition-colors',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D9] bg-white text-[#1A2A3A] text-sm font-medium hover:bg-[#F5F1EB] transition-colors',
  btnIcon:
    'inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E8E2D9] bg-white text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A] transition-colors',
  actionChip:
    'inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors disabled:opacity-50',
  actionChipActive: 'text-[#B85C38] font-medium',
  avatarGradient: 'bg-gradient-to-br from-[#2C3E50] to-[#B85C38]',
  unread:
    'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[#B85C38] text-white text-[10px] font-bold',
};

interface CommunityCardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function CommunityCard({ children, className, padding }: CommunityCardProps) {
  return (
    <div className={cn(padding ? ui.cardPad : ui.card, className)}>{children}</div>
  );
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
};

interface CommunityAvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof avatarSizes;
  ring?: boolean;
  className?: string;
}

export function CommunityAvatar({ name, src, size = 'md', ring, className }: CommunityAvatarProps) {
  const initial = (name?.trim()?.[0] || '?').toUpperCase();
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center font-semibold text-white shrink-0',
        ui.avatarGradient,
        avatarSizes[size],
        ring && 'ring-2 ring-white',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

interface OnlineAvatarProps extends CommunityAvatarProps {
  isOnline?: boolean;
}

/** Green dot only when `isOnline` is true (real presence from last_seen_at). */
export function OnlineAvatar({ isOnline, ...avatarProps }: OnlineAvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <CommunityAvatar {...avatarProps} />
      {isOnline ? (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"
          aria-label="Online"
          title="Online now"
        />
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F1EB] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#B85C38]" />
      </div>
      <h3 className="font-semibold text-[#1A2A3A]">{title}</h3>
      <p className="text-sm text-[#4A5568] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function BackLink({
  href = '/community',
  label = 'Back',
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-[#4A5568] hover:text-[#B85C38] transition-colors mb-3',
        className
      )}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}

export function PageHeader({ title, description, action, backHref, backLabel }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref !== undefined && <BackLink href={backHref} label={backLabel} />}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">{title}</h1>
          {description && <p className="text-[#4A5568] mt-1">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

interface SegmentedTabsProps<T extends string> {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}

export function SegmentedTabs<T extends string>({ tabs, active, onChange }: SegmentedTabsProps<T>) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-[#F5F1EB] border border-[#E8E2D9]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            active === tab.id ? 'bg-white text-[#1A2A3A] shadow-sm' : 'text-[#4A5568] hover:text-[#1A2A3A]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
