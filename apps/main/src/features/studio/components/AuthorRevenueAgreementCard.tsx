'use client';

import { useState } from 'react';
import { FileSignature, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthorRevenueAgreement } from '../hooks/useAuthorRevenueAgreement';

type Props = {
  compact?: boolean;
  onSigned?: () => void;
};

export function AuthorRevenueAgreementCard({ compact, onSigned }: Props) {
  const { status, loading, signing, error, sign } = useAuthorRevenueAgreement();
  const [accepted, setAccepted] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E8E2D9] bg-white p-6 animate-pulse">
        <div className="h-5 w-48 bg-[#E8E2D9] rounded" />
      </div>
    );
  }

  if (status?.signed) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
          <div>
            <p className="font-semibold text-emerald-900">
              <span className="font-bold">
                {status.authorName || signatureName || 'You'}
              </span>{' '}
              signed the revenue agreement
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              Signed successfully · version {status.version} · {status.authorSharePercent}% author
              / {status.platformSharePercent}% platform
            </p>
            {status.acceptedAt && (
              <p className="mt-1 text-sm text-emerald-800">
                Signed on {new Date(status.acceptedAt).toLocaleString()}
              </p>
            )}
            <p className="mt-2 text-sm text-emerald-800">
              A confirmation was sent to{' '}
              {status.authorEmail ? (
                <span className="font-medium">{status.authorEmail}</span>
              ) : (
                'your email'
              )}{' '}
              and your Studio inbox. Admins are notified so your submissions can proceed to approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start gap-3">
        <FileSignature className="text-amber-700 shrink-0" size={22} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-amber-950">Revenue agreement required</h3>
          <p className="mt-1 text-sm text-amber-900">
            Sign before submitting books for admin review. Admin approval is blocked until this is
            complete.
          </p>
          {!compact && status?.agreementText && (
            <pre className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-amber-200 bg-white p-4 text-xs text-[#4A5568] font-sans">
              {status.agreementText}
            </pre>
          )}
          <label className="mt-4 block text-sm">
            <span className="font-medium text-amber-950">Legal name / pen name</span>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder={status?.authorName || 'Your name'}
              className="mt-1 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 flex items-start gap-2 text-sm text-amber-950">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            I have read and accept the BookNest Author Revenue Agreement
          </label>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button
            type="button"
            disabled={!accepted || signing}
            onClick={async () => {
              const ok = await sign(signatureName || status?.authorName || undefined);
              if (ok) {
                toast.success(
                  `${status?.authorName || signatureName || 'You'} signed the revenue agreement — check your email for confirmation.`,
                );
                onSigned?.();
              }
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#B85C38] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {signing ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
            Sign agreement
          </button>
        </div>
      </div>
    </div>
  );
}
