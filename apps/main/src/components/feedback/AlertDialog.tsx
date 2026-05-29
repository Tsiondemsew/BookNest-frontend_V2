'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  onClose: () => void;
}

export function AlertDialog({
  open,
  title,
  message,
  buttonLabel = 'OK',
  actionHref,
  actionLabel,
  onClose,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2A3A]/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-xl p-6"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-full bg-[#FEE2E2] text-[#DC2626]">
            <AlertCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1A2A3A]">{title}</h2>
            <p className="mt-2 text-sm text-[#4A5568] whitespace-pre-line">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2C3E50] hover:bg-[#1A2A3A] rounded-lg"
            >
              {actionLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#4A5568] hover:text-[#1A2A3A] rounded-lg border border-[#E8E2D9]"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
