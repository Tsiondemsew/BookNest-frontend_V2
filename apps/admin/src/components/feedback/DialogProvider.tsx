'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AdminButton } from '@/components/ui/AdminUi';

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type ActiveConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirm | null>(null);

  const confirm = useCallback<DialogContextValue['confirm']>((options) => {
    return new Promise<boolean>((resolve) => {
      setActiveConfirm({
        title: options.title ?? 'Confirm',
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        destructive: options.destructive ?? false,
        resolve,
      });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {activeConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close dialog"
            onClick={() => {
              const done = activeConfirm.resolve;
              setActiveConfirm(null);
              done(false);
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-xl p-6">
            <h2 className="text-lg font-semibold text-[#1A2A3A]">
              {activeConfirm.title ?? 'Confirm'}
            </h2>
            <p className="mt-2 text-sm text-[#4A5568] whitespace-pre-line">
              {activeConfirm.description}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  const done = activeConfirm.resolve;
                  setActiveConfirm(null);
                  done(false);
                }}
              >
                {activeConfirm.cancelLabel ?? 'Cancel'}
              </AdminButton>
              <AdminButton
                variant={activeConfirm.destructive ? 'danger' : 'primary'}
                onClick={() => {
                  const done = activeConfirm.resolve;
                  setActiveConfirm(null);
                  done(true);
                }}
              >
                {activeConfirm.confirmLabel ?? 'Confirm'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}

