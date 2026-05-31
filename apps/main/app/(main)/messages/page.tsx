'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { MessagesHub } from '@/features/community/components/chat/MessagesHub';
import { ui, cn } from '@/features/community/ui';

function MessagesContent() {
  return <MessagesHub />;
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className={cn(ui.page, 'flex justify-center items-center min-h-[50vh]')}>
          <Loader2 size={32} className="animate-spin text-bn-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
