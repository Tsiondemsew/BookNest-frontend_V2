'use client';

import { Info } from 'lucide-react';

export function BookUploadInfoCallout() {
  return (
    <div className="flex gap-3 rounded-xl border border-[#B85C38]/30 bg-[#FDFBF7] p-4">
      <Info size={20} className="text-[#B85C38] shrink-0 mt-0.5" />
      <div className="text-sm text-[#4A5568] space-y-2">
        <p className="font-medium text-[#1A2A3A]">One book per title and language</p>
        <p>
          Each title and language can only be registered once. Translations use a different language.
        </p>
        <p>
          To offer both PDF and Audio, upload the book once, then open <strong>My Books → Edit</strong> and add the
          other format there.
        </p>
        <p>You cannot upload the same title and language again just to add the other format.</p>
      </div>
    </div>
  );
}
