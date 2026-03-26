'use client';

import { useEffect, useState } from 'react';
import { onToastAdd, onToastRemove, type Toast } from '@/lib/toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribeAdd = onToastAdd((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    const unsubscribeRemove = onToastRemove((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      unsubscribeAdd();
      unsubscribeRemove();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }: { toast: Toast }) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[toast.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white rounded-lg shadow-lg p-4 flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-4 fade-in`}
      role="alert"
      aria-live="polite"
    >
      <span className="font-bold text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-1 text-xs font-semibold hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
