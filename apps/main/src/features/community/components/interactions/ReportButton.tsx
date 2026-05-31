'use client';

import { useState } from 'react';
import { Flag, X, Send, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { feedApi } from '@/lib/api/client';

interface ReportButtonProps {
  targetId: string;
  type: 'post' | 'comment' | 'user';
}

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Abusive content',
  'Sexual content',
  'Racist content',
  'Inappropriate content',
  'Copyright violation',
  'Other',
];

export function ReportButton({ targetId, type }: ReportButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReport = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (!selectedReason) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await feedApi.createReport({
        target_type: type,
        target_id: targetId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setSelectedReason('');
        setDetails('');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="p-1 text-[#4A5568] hover:text-red-500 transition-colors"
        title="Report"
      >
        <Flag size={14} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#1A2A3A]">Report {type}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#4A5568] hover:text-[#1A2A3A]"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-green-600" />
                </div>
                <p className="text-[#1A2A3A] font-medium">Thank you for reporting</p>
                <p className="text-sm text-[#4A5568] mt-1">Our team will review this content.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1A2A3A] mb-2">Reason *</label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                    >
                      <option value="">Select a reason</option>
                      {REPORT_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1A2A3A] mb-2">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38]"
                      placeholder="Please provide any additional context…"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-[#E8E2D9] text-[#4A5568] rounded-lg hover:bg-[#F5F1EB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReport()}
                    disabled={!selectedReason || isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSubmitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
