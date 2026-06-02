'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { isAppInstalled, isInstalledPwa, markAppInstalled } from '@/lib/pwa/isInstalledPwa';

const SEEN_KEY = 'booknest:installPrompt:seen';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function shouldSuppressInstallPrompt(): boolean {
  return isAppInstalled() || sessionStorage.getItem(SEEN_KEY) === '1';
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return shouldSuppressInstallPrompt();
  });
  const [showInstall, setShowInstall] = useState(false);
  const [helperText, setHelperText] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem(SEEN_KEY, '1');
    setShowInstall(false);
    setHelperText(null);
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    if (dismissed || isAppInstalled()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (shouldSuppressInstallPrompt()) return;
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const onInstalled = () => {
      markAppInstalled();
      sessionStorage.setItem(SEEN_KEY, '1');
      setShowInstall(false);
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        setHelperText('To install: Tap Share button → "Add to Home Screen".');
      } else {
        setHelperText('Use the install icon in the address bar (or refresh and try again).');
      }
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      markAppInstalled();
      dismiss();
      setDeferredPrompt(null);
    }
  };

  if (isInstalledPwa() || isAppInstalled() || !showInstall || dismissed) {
    return null;
  }

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
          <button
            type="button"
            onClick={dismiss}
            className="text-white/60 hover:text-white"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 py-2 bg-[#B85C38] text-white rounded-lg text-sm font-medium hover:bg-[#8E735B] transition-colors"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            Later
          </button>
        </div>
        {helperText && <p className="mt-3 text-xs text-white/80">{helperText}</p>}
      </div>
    </div>
  );
}
