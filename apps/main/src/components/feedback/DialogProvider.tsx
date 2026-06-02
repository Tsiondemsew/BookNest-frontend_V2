'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertDialog } from './AlertDialog';
import { ConfirmDialog } from './ConfirmDialog';

type AlertOptions = {
  title?: string;
  message: string;
  buttonLabel?: string;
};

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogContextValue = {
  alert: (message: string, options?: Omit<AlertOptions, 'message'>) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type ActiveAlert = AlertOptions & { open: true; resolve: () => void };
type ActiveConfirm = ConfirmOptions & { open: true; resolve: (value: boolean) => void };

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirm | null>(null);

  const alert = useCallback<DialogContextValue['alert']>((message, options) => {
    return new Promise<void>((resolve) => {
      setActiveAlert({
        open: true,
        message,
        title: options?.title ?? 'Notice',
        buttonLabel: options?.buttonLabel ?? 'OK',
        resolve,
      });
    });
  }, []);

  const confirm = useCallback<DialogContextValue['confirm']>((options) => {
    return new Promise<boolean>((resolve) => {
      setActiveConfirm({
        open: true,
        title: options.title ?? 'Confirm',
        description: options.description,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        destructive: options.destructive ?? false,
        resolve,
      });
    });
  }, []);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <DialogContext.Provider value={value}>
      {children}

      <AlertDialog
        open={!!activeAlert}
        title={activeAlert?.title ?? 'Notice'}
        message={activeAlert?.message ?? ''}
        buttonLabel={activeAlert?.buttonLabel ?? 'OK'}
        onClose={() => {
          const done = activeAlert?.resolve;
          setActiveAlert(null);
          done?.();
        }}
      />

      <ConfirmDialog
        open={!!activeConfirm}
        title={activeConfirm?.title ?? 'Confirm'}
        description={activeConfirm?.description ?? ''}
        confirmLabel={activeConfirm?.confirmLabel ?? 'Confirm'}
        cancelLabel={activeConfirm?.cancelLabel ?? 'Cancel'}
        destructive={activeConfirm?.destructive ?? false}
        onCancel={() => {
          const done = activeConfirm?.resolve;
          setActiveConfirm(null);
          done?.(false);
        }}
        onConfirm={() => {
          const done = activeConfirm?.resolve;
          setActiveConfirm(null);
          done?.(true);
        }}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}

