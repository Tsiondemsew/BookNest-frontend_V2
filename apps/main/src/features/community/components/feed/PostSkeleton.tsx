import { ui } from '../../ui';

export function PostSkeleton() {
  return (
    <div className={ui.cardPad + ' animate-pulse'}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bn-border" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-bn-border rounded-lg w-1/3" />
          <div className="h-3 bg-bn-border/70 rounded-lg w-1/4" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 bg-bn-border rounded-lg w-full" />
        <div className="h-3.5 bg-bn-border rounded-lg w-4/5" />
        <div className="h-3.5 bg-bn-border/70 rounded-lg w-2/5" />
      </div>
    </div>
  );
}
