'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show helpful message
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('To install: Tap Share button → "Add to Home Screen"');
      } else {
        alert('Install prompt ready. Look for install icon in address bar or click again.');
      }
      return;
    }
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-[#2C3E50] text-white rounded-lg shadow-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Download size={24} className="text-[#B85C38]" />
            <div>
              <h3 className="font-semibold">Install BookNest</h3>
              <p className="text-sm text-white/80">Read offline, faster access</p>
            </div>
          </div>
          <button onClick={() => setShowPrompt(false)} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 py-2 bg-[#B85C38] text-white rounded-lg text-sm font-medium hover:bg-[#8E735B] transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}