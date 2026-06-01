'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthorBookSubmission } from '../hooks/useAuthorBookSubmission';
import { AuthorAudioPreview } from './AuthorAudioPreview';
import { AuthorRevenueAgreementCard } from './AuthorRevenueAgreementCard';

type Props = {
  bookId: string;
};

export function AuthorBookSubmissionView({ bookId }: Props) {
  const { data, loading, error, refetch } = useAuthorBookSubmission(bookId);
  const [updateNote, setUpdateNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitForReview = async () => {
    if (!data) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiClient.patch(`/api/books/${bookId}/submit-for-review`, {
        updateNote: updateNote.trim(),
      });
      await refetch();
      setUpdateNote('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#B85C38]" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        {error || 'Book not found'}
        <Link href="/studio/books" className="mt-4 block text-sm font-semibold underline">
          Back to my books
        </Link>
      </div>
    );
  }

  const pdf = data.formats.find((f) => f.formatType === 'PDF');
  const audio = data.formats.find((f) => f.formatType === 'Audio');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/studio/books"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#B85C38] hover:underline"
      >
        <ArrowLeft size={16} />
        My books
      </Link>

      <div className="flex flex-wrap gap-4">
        {data.coverImageUrl && (
          <img
            src={data.coverImageUrl}
            alt=""
            className="h-40 w-28 rounded-xl object-cover shadow-md ring-1 ring-[#E8E2D9]"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">{data.title}</h1>
          {data.subtitle && <p className="text-[#4A5568]">{data.subtitle}</p>}
          <p className="mt-2 text-sm capitalize text-[#8E735B]">
            {data.status.replace(/_/g, ' ')} · {data.genre}
          </p>
        </div>
      </div>

      {data.mustSignAgreement && (
        <AuthorRevenueAgreementCard onSigned={refetch} />
      )}

      {data.isUpdateSubmission && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">Update under review</h2>
          <p className="mt-1 text-sm text-amber-900">
            Admin is reviewing your changes. Your live approved version stays on the marketplace
            until the update is approved.
          </p>
          {data.updateNote && (
            <p className="mt-3 text-sm">
              <span className="font-medium">Your note:</span> {data.updateNote}
            </p>
          )}
          {data.updateRequest && (
            <p className="mt-1 text-xs text-amber-800">
              Submitted {new Date(data.updateRequest.submittedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {data.reviewNote && data.status === 'rejected' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Admin feedback:</strong> {data.reviewNote}
        </div>
      )}

      <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A2A3A]">Description</h2>
        {data.isUpdateSubmission && data.descriptionComparison ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-[#8E735B]">Previous (live)</p>
              <div className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#F5F1EB] p-4 text-sm text-[#4A5568]">
                {data.descriptionComparison.previous || '—'}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#B85C38]">Your update</p>
              <div className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#B85C38]/30 bg-amber-50/50 p-4 text-sm text-[#1A2A3A]">
                {data.descriptionComparison.current || '—'}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-[#4A5568] leading-relaxed">
            {data.description || 'No description.'}
          </div>
        )}
      </section>

      {data.isUpdateSubmission && data.contentComparison && (
        <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">Audio & files (update)</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase text-[#8E735B] mb-2">Previous audio</p>
              {data.contentComparison.audio.previous ? (
                <AuthorAudioPreview
                  format={data.contentComparison.audio.previous}
                  bookDescription={data.description}
                />
              ) : (
                <p className="text-sm text-[#4A5568]">No previous audio</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-[#B85C38] mb-2">New audio (full)</p>
              {data.contentComparison.audio.current ? (
                <AuthorAudioPreview
                  format={data.contentComparison.audio.current}
                  bookDescription={data.description}
                />
              ) : (
                <p className="text-sm text-[#4A5568]">No audio in this update</p>
              )}
            </div>
          </div>
        </section>
      )}

      {!data.isUpdateSubmission && audio && (
        <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">Audio (full)</h2>
          <p className="mt-1 text-sm text-[#4A5568]">Listen to your submitted audiobook before admin review.</p>
          <div className="mt-4">
            <AuthorAudioPreview format={audio} bookDescription={data.description} />
          </div>
        </section>
      )}

      {pdf && (
        <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">PDF</h2>
          <p className="text-sm text-[#4A5568]">
            {pdf.fileName || 'PDF'} · {pdf.pageCount ?? '?'} pages
          </p>
          {pdf.fileUrl && (
            <a
              href={pdf.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-[#B85C38] hover:underline"
            >
              Open PDF in new tab
            </a>
          )}
        </section>
      )}

      {data.changes.length > 0 && (
        <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">What changed</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.changes.map((c) => (
              <li key={c.label} className="rounded-lg bg-[#F5F1EB] px-3 py-2">
                <span className="font-medium">{c.label}</span>
                <span className="text-[#4A5568]">
                  {' '}
                  — {c.previous || '—'} → {c.proposed || '—'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.canSubmitForReview && (
        <section className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">Submit for review</h2>
          {data.status === 'approved' && (
            <p className="mt-1 text-sm text-[#4A5568]">
              Submit an update for admin review. Describe what changed below.
            </p>
          )}
          <textarea
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
            placeholder="Optional note for admin (e.g. updated chapter 5, new audio master)…"
            rows={4}
            className="mt-3 w-full rounded-lg border border-[#E8E2D9] px-3 py-2 text-sm"
          />
          {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}
          <button
            type="button"
            disabled={submitting || data.mustSignAgreement}
            onClick={handleSubmitForReview}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#B85C38] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {data.status === 'approved' ? 'Submit update for review' : 'Submit for review'}
          </button>
        </section>
      )}

      <p className="text-center text-sm">
        <Link href="/studio/profile" className="text-[#B85C38] font-medium hover:underline">
          Author profile & agreement
        </Link>
      </p>
    </div>
  );
}
