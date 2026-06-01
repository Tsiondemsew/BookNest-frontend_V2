'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { CommunityUserSearch } from '@/features/community';

/** Header search — top sheet on mobile, not tied to bottom nav. */
export function HeaderUserSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] transition-colors"
        aria-label="Find people"
      >
        <Search size={20} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-[#1A2A3A]/40 backdrop-blur-[2px] lg:hidden"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
          <div className="fixed z-[70] inset-x-0 top-0 lg:hidden animate-[sheetDown_0.25s_ease-out_both]">
            <div className="bg-white border-b border-[#E8E2D9] shadow-lg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4">
              <div className="flex items-center justify-between gap-3 mb-3 max-w-lg mx-auto">
                <h2 className="text-base font-semibold text-[#1A2A3A] bn-serif">Find people</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-[#4A5568] hover:bg-[#F5F1EB] transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="max-w-lg mx-auto">
                <CommunityUserSearch variant="sheet" onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes sheetDown {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
