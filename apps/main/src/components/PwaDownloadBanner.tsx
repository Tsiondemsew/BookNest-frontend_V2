'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { isInstalledPwa } from '@/lib/pwa/isInstalledPwa';

export function PwaDownloadBanner() {
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    setInstalled(isInstalledPwa());
  }, []);

  if (installed) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
      <Smartphone className="text-amber-700 shrink-0 mt-0.5" size={22} />
      <div>
        <p className="font-medium text-amber-900">Install BookNest for offline reading</p>
        <p className="text-sm text-amber-800 mt-1">
          Downloads only work in the installed app. A regular browser tab cannot open books when you are offline.
          Use your browser&apos;s &quot;Install app&quot; or &quot;Add to Home screen&quot; option first.
        </p>
        <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
          <Download size={12} /> After installing, return here to download books to your device.
        </p>
      </div>
    </div>
  );
}
